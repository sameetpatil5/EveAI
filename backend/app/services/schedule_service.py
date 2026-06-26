from collections import defaultdict
from datetime import datetime, date, time, timedelta, timezone
import random
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agents import get_schedule_agent
from app.repositories.schedule_repository import ScheduleRepository
from app.repositories.lesson_repository import LessonRepository
from app.repositories.subject_repository import SubjectRepository
from app.repositories.user_repository import UserRepository
from app.core.exceptions import NotFoundError
from app.schemas.schedule import ScheduleResponse
from app.utils.helpers import generate_uuid, utcnow

DEFAULT_AVAILABLE_SLOTS = [
    {"start": "09:00", "end": "12:00"},
    {"start": "14:00", "end": "18:00"},
]
LESSON_BLOCK_MINUTES = 60
HOBBY_BLOCK_MINUTES = 30
STUDY_BREAK_THRESHOLD = 90
BREAK_OPTIONS = [15, 20, 25, 30]
MIN_HOBBY_MINUTES = 30


class ScheduleService:
    async def get_schedule(self, user_id: str, db: AsyncSession) -> ScheduleResponse:
        repo = ScheduleRepository(db)
        entries = await repo.get_by_user(user_id)
        week_start = self._current_week_start()
        week_end = week_start + timedelta(days=7)
        current_week_entries = [
            entry for entry in entries if week_start <= entry.start_time < week_end
        ]
        return ScheduleResponse.model_validate(
            {"entries": [e.__dict__ for e in current_week_entries]}
        )

    async def update_status(
        self, entry_id: str, user_id: str, status: str, db: AsyncSession
    ) -> None:
        repo = ScheduleRepository(db)
        entry = await repo.get_entry(entry_id)
        if not entry:
            raise NotFoundError("Entry not found")
        if entry.user_id != user_id:
            raise NotFoundError("Entry not found")
        await repo.update_status(entry_id, status)

    async def regenerate_schedule(
        self, user_id: str, feedback: str, db: AsyncSession
    ) -> None:
        repo = ScheduleRepository(db)
        schedule_entries = await self.build_weekly_schedule_entries(
            user_id, db, feedback
        )
        if schedule_entries:
            await repo.delete_pending_future_entries(user_id)
            await repo.bulk_insert(schedule_entries)

    async def build_weekly_schedule_entries(
        self, user_id: str, db: AsyncSession, feedback: str = ""
    ) -> list[dict[str, Any]]:
        user_repo = UserRepository(db)
        subject_repo = SubjectRepository(db)
        lesson_repo = LessonRepository(db)

        profile = await user_repo.get_profile(user_id)
        hobbies = await user_repo.get_hobbies(user_id)
        subjects = await subject_repo.get_all_by_user(user_id)
        lessons = await lesson_repo.get_lessons_for_user(user_id)

        available_slots = self._available_slots(profile)
        current_week_start = self._current_week_start()
        profile_summary = self._profile_summary(profile, hobbies)
        subjects_summary = self._subjects_summary(subjects)

        schedule_agent = get_schedule_agent()
        schedule_output = await schedule_agent.generate(
            profile_summary=profile_summary,
            subjects_summary=subjects_summary,
            available_slots=available_slots,
            hobbies=hobbies,
            all_lessons=lessons,
            feedback=feedback,
            current_week_start=current_week_start.isoformat(),
        )

        schedule_entries = self._build_from_agent_output(
            user_id,
            schedule_output,
            current_week_start,
        )
        return schedule_entries or []

    def _available_slots(self, profile: Any) -> list[dict[str, str]]:
        if not profile:
            return DEFAULT_AVAILABLE_SLOTS

        slots = getattr(profile, "available_time_slots", None) or []
        if not isinstance(slots, list) or len(slots) == 0:
            return DEFAULT_AVAILABLE_SLOTS
        valid_slots = [
            s for s in slots if isinstance(s, dict) and s.get("start") and s.get("end")
        ]
        return valid_slots if valid_slots else DEFAULT_AVAILABLE_SLOTS

    def _profile_summary(self, profile: Any, hobbies: list[str]) -> str:
        if not profile:
            return "No profile data available."

        lines = [
            f"Full name: {getattr(profile, 'full_name', '')}",
            f"Academic level: {getattr(profile, 'academic_level', '')}",
            f"Major: {getattr(profile, 'major', '')}",
            f"Available time slots: {getattr(profile, 'available_time_slots', [])}",
            f"Hobbies: {', '.join(hobbies) if hobbies else 'None'}",
        ]
        return "\n".join(lines)

    def _subjects_summary(self, subjects: list[Any]) -> list[dict[str, Any]]:
        return [
            {
                "id": subject.id,
                "name": subject.name,
                "priority": subject.priority,
                "weekly_hours": subject.weekly_hours,
                "target_weeks": subject.target_weeks,
                "goal": getattr(subject, "goal", ""),
            }
            for subject in subjects
        ]

    def _current_week_start(self) -> datetime:
        now = utcnow()
        monday = now - timedelta(days=(now.weekday() % 7))
        return datetime(
            monday.year,
            monday.month,
            monday.day,
            0,
            0,
            tzinfo=timezone.utc,
        )

    def _day_name_to_date(
        self, week_start: datetime, day_of_week: str
    ) -> datetime | None:
        try:
            day_of_week = day_of_week.strip().lower()
            mapping = {
                "monday": 0,
                "mon": 0,
                "tuesday": 1,
                "tue": 1,
                "wednesday": 2,
                "wed": 2,
                "thursday": 3,
                "thu": 3,
                "friday": 4,
                "fri": 4,
                "saturday": 5,
                "sat": 5,
                "sunday": 6,
                "sun": 6,
            }
            offset = mapping.get(day_of_week)
            if offset is None:
                return None
            return week_start + timedelta(days=offset)
        except Exception:
            return None

    def _build_from_agent_output(
        self,
        user_id: str,
        schedule_output: Any,
        current_week_start: datetime,
    ) -> list[dict[str, Any]]:
        if not schedule_output:
            return []

        entries = []
        raw_entries = getattr(schedule_output, "entries", [])
        if not isinstance(raw_entries, list):
            return []

        for item in raw_entries:
            entry = item.model_dump() if hasattr(item, "model_dump") else dict(item)
            day_of_week = entry.get("day_of_week")
            start_time = entry.get("start_time")
            end_time = entry.get("end_time")
            if not day_of_week or not start_time or not end_time:
                continue

            date_for_day = self._day_name_to_date(current_week_start, day_of_week)
            if not date_for_day:
                continue

            try:
                start_hour, start_minute = (int(x) for x in start_time.split(":"))
                end_hour, end_minute = (int(x) for x in end_time.split(":"))
                start_dt = datetime(
                    date_for_day.year,
                    date_for_day.month,
                    date_for_day.day,
                    start_hour,
                    start_minute,
                    tzinfo=timezone.utc,
                )
                end_dt = datetime(
                    date_for_day.year,
                    date_for_day.month,
                    date_for_day.day,
                    end_hour,
                    end_minute,
                    tzinfo=timezone.utc,
                )
            except Exception:
                continue

            entries.append(
                {
                    "id": generate_uuid(),
                    "user_id": user_id,
                    "title": entry.get("title", "Study Session"),
                    "start_time": start_dt,
                    "end_time": end_dt,
                    "activity_type": entry.get("activity_type", "study"),
                    "related_subject_id": entry.get("related_subject_id"),
                    "related_lesson_id": entry.get("related_lesson_id"),
                    "related_quiz_id": entry.get("related_quiz_id"),
                    "status": "pending",
                }
            )
        return entries

    def _build_weekly_schedule_entries(
        self,
        user_id: str,
        subjects: list[Any],
        lessons: list[dict[str, Any]],
        hobbies: list[str],
        available_slots: list[dict[str, str]],
        start_date: date | None = None,
    ) -> list[dict[str, Any]]:
        if not start_date:
            start_date = utcnow().date()

        pending_lessons = [lesson for lesson in lessons if not lesson.get("completed")]
        if not pending_lessons and not hobbies:
            return []

        subject_map = {subject.id: subject for subject in subjects}
        lessons_by_subject: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for lesson in sorted(
            pending_lessons,
            key=lambda item: (
                -item.get("subject_priority", 0),
                item.get("module_order", 0),
                item.get("lesson_order", 0),
            ),
        ):
            lessons_by_subject[lesson["subject_id"]].append(lesson)

        lesson_queue: list[dict[str, Any]] = []
        for subject in sorted(subjects, key=lambda s: (-s.priority, s.name)):
            subject_pending = lessons_by_subject.get(subject.id, [])
            if not subject_pending:
                continue
            max_blocks = (
                max(1, round(subject.weekly_hours))
                if subject.weekly_hours
                else len(subject_pending)
            )
            lesson_queue.extend(
                subject_pending[: min(len(subject_pending), max_blocks)]
            )

        entries: list[dict[str, Any]] = []
        hobby_index = 0
        parsed_slots = [self._parse_slot(slot) for slot in available_slots]
        parsed_slots = [slot for slot in parsed_slots if slot]
        if not parsed_slots:
            parsed_slots = [self._parse_slot(slot) for slot in DEFAULT_AVAILABLE_SLOTS]

        for day_offset in range(7):
            current_date = start_date + timedelta(days=day_offset)
            day_name = current_date.strftime("%A")

            for slot in parsed_slots:
                current_dt = datetime.combine(
                    current_date, slot["start"], tzinfo=timezone.utc
                )
                slot_end_dt = datetime.combine(
                    current_date, slot["end"], tzinfo=timezone.utc
                )
                consecutive_study = 0

                while current_dt + timedelta(minutes=MIN_HOBBY_MINUTES) <= slot_end_dt:
                    remaining_minutes = int(
                        (slot_end_dt - current_dt).total_seconds() // 60
                    )
                    if (
                        consecutive_study >= STUDY_BREAK_THRESHOLD
                        and remaining_minutes >= 15
                    ):
                        break_duration = min(
                            random.choice(BREAK_OPTIONS), remaining_minutes
                        )
                        entries.append(
                            self._make_entry(
                                user_id,
                                day_name,
                                current_dt,
                                current_dt + timedelta(minutes=break_duration),
                                "Break",
                                "break",
                                None,
                                None,
                            )
                        )
                        current_dt += timedelta(minutes=break_duration)
                        consecutive_study = 0
                        continue

                    if lesson_queue and remaining_minutes >= LESSON_BLOCK_MINUTES:
                        lesson = lesson_queue.pop(0)
                        subject_name = lesson.get("subject_name") or "Study"
                        title = f"{subject_name}: {lesson.get('title', 'Lesson')}"
                        entries.append(
                            self._make_entry(
                                user_id,
                                day_name,
                                current_dt,
                                current_dt + timedelta(minutes=LESSON_BLOCK_MINUTES),
                                title,
                                "lesson",
                                lesson.get("subject_id"),
                                lesson.get("id"),
                            )
                        )
                        current_dt += timedelta(minutes=LESSON_BLOCK_MINUTES)
                        consecutive_study += LESSON_BLOCK_MINUTES
                        continue

                    if hobbies and remaining_minutes >= HOBBY_BLOCK_MINUTES:
                        hobby_name = hobbies[hobby_index % len(hobbies)]
                        entries.append(
                            self._make_entry(
                                user_id,
                                day_name,
                                current_dt,
                                current_dt + timedelta(minutes=HOBBY_BLOCK_MINUTES),
                                f"Hobby: {hobby_name}",
                                "hobby",
                                None,
                                None,
                            )
                        )
                        current_dt += timedelta(minutes=HOBBY_BLOCK_MINUTES)
                        consecutive_study = 0
                        hobby_index += 1
                        continue

                    break

        return entries

    def _parse_slot(self, slot: dict[str, str]) -> dict[str, time] | None:
        try:
            start = slot.get("start")
            end = slot.get("end")
            if not start or not end:
                return None
            hh, mm = (int(x) for x in start.split(":"))
            start_time = time(hh, mm)
            hh, mm = (int(x) for x in end.split(":"))
            end_time = time(hh, mm)
            if end_time <= start_time:
                return None
            return {"start": start_time, "end": end_time}
        except Exception:
            return None

    def _make_entry(
        self,
        user_id: str,
        day_name: str,
        start_dt: datetime,
        end_dt: datetime,
        title: str,
        activity_type: str,
        subject_id: str | None,
        lesson_id: str | None,
    ) -> dict[str, Any]:
        return {
            "id": generate_uuid(),
            "user_id": user_id,
            "title": title,
            "start_time": start_dt,
            "end_time": end_dt,
            "activity_type": activity_type,
            "related_subject_id": subject_id,
            "related_lesson_id": lesson_id,
            "related_quiz_id": None,
            "status": "pending",
        }
