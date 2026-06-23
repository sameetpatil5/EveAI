import asyncio
from app.core.database import AsyncSessionLocal
from app.core.redis import set_json, get_json
from app.utils.logger import logger
from app.repositories.user_repository import UserRepository
from app.repositories.subject_repository import SubjectRepository
from app.repositories.course_repository import CourseRepository
from app.repositories.schedule_repository import ScheduleRepository
from app.vectorstore.user_context_store import user_context_store
from app.utils.helpers import generate_uuid, utcnow
from datetime import datetime, timedelta, time, timezone


async def run_post_onboarding_setup(user_id: str, job_id: str) -> None:
    """
    Background job: runs after onboarding completion.

    Steps:
    1. Open new DB session (cannot use request session)
    2. Set job status to "running" in Redis
    3. Fetch user profile, subjects, hobbies
    4. For each subject: call CourseAgent, save course + modules + lessons
    5. Call ScheduleAgent, save schedule entries
    6. Upsert user context to vectorstore
    7. Set job status to "complete" in Redis
    On exception: set status to "failed" in Redis and log
    """
    db = AsyncSessionLocal()
    try:
        logger.info(f"Starting post-onboarding setup for user {user_id}, job {job_id}")

        # Set job status to running
        await set_json(f"job:{job_id}", {"status": "running", "error": None}, ttl=86400)

        # Fetch user data
        user_repo = UserRepository(db)
        subject_repo = SubjectRepository(db)
        course_repo = CourseRepository(db)

        profile = await user_repo.get_profile(user_id)
        subjects = await subject_repo.get_all_by_user(user_id)
        hobbies = await user_repo.get_hobbies(user_id)

        if not profile or not subjects:
            raise ValueError("User profile or subjects missing")

        logger.info(f"Processing {len(subjects)} subjects for user {user_id}")

        from app.ai.agents import get_course_agent

        # Generate courses for each subject
        course_agent = get_course_agent()
        all_courses = []

        for subject in subjects:
            try:
                logger.info(f"Generating course for subject: {subject.name}")
                output = await course_agent.generate(
                    subject_name=subject.name,
                    academic_level=getattr(profile, "academic_level", "beginner"),
                    major=getattr(profile, "major", ""),
                    goal=getattr(subject, "goal", ""),
                    target_weeks=subject.target_weeks,
                    weekly_hours=subject.weekly_hours,
                    user_level=subject.level,
                )

                # Save course structure to DB
                course = await course_repo.create(
                    subject.id,
                    {
                        "title": getattr(output, "title", subject.name),
                        "description": getattr(output, "description", ""),
                        "total_modules": len(getattr(output, "modules", [])),
                        # Course structure metadata is available immediately after generation.
                        # Individual lessons still generate on demand.
                        "generation_status": "complete",
                    },
                )

                # Save modules and lessons
                for mod_idx, module_data in enumerate(getattr(output, "modules", [])):
                    module = await course_repo.create_module(
                        course.id,
                        {
                            "title": getattr(
                                module_data, "title", f"Module {mod_idx + 1}"
                            ),
                            "description": getattr(module_data, "description", ""),
                            "module_order": getattr(
                                module_data, "module_order", mod_idx + 1
                            ),
                            "is_locked": mod_idx > 0,
                        },
                    )

                    # Save lessons for this module
                    for les_idx, lesson_data in enumerate(
                        getattr(module_data, "lessons", [])
                    ):
                        await course_repo.create_lesson_metadata(
                            module.id,
                            {
                                "title": getattr(
                                    lesson_data, "title", f"Lesson {les_idx + 1}"
                                ),
                                "lesson_order": getattr(
                                    lesson_data, "lesson_order", les_idx + 1
                                ),
                                "generation_status": "pending",
                            },
                        )

                all_courses.append(course)
                logger.info(f"Course generated for subject {subject.name}")

            except Exception as e:
                logger.error(
                    f"Error generating course for subject {subject.name}: {e}",
                    exc_info=True,
                )
                continue

        # Generate schedule (if courses exist)
        if all_courses:
            try:
                logger.info("Generating schedule")

                from app.ai.agents import get_schedule_agent

                schedule_agent = get_schedule_agent()
                schedule_output = await schedule_agent.generate(
                    subjects_summary=[s.__dict__ for s in subjects],
                    available_slots=getattr(profile, "available_time_slots", []) or [],
                    all_lessons=[],
                )

                # Bulk insert schedule entries
                # schedule_output is expected to be a list of schedule entry dicts
                schedule_entries = []

                def _weekday_from_name(name: str) -> int | None:
                    if not name:
                        return None
                    n = name.strip().lower()
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
                    return mapping.get(n)

                def _to_next_datetime_for_weekday(weekday: int, hhmm: str) -> datetime:
                    now = utcnow()
                    today = now.date()
                    target = (weekday - today.weekday()) % 7
                    # if today and time already passed, schedule next week
                    hh, mm = (int(x) for x in hhmm.split(":"))
                    candidate_date = today + timedelta(days=target)
                    candidate_dt = datetime.combine(
                        candidate_date, time(hh, mm), tzinfo=timezone.utc
                    )
                    if candidate_dt <= now:
                        candidate_date = candidate_date + timedelta(days=7)
                        candidate_dt = datetime.combine(
                            candidate_date, time(hh, mm), tzinfo=timezone.utc
                        )
                    return candidate_dt

                entries_iter = (
                    schedule_output
                    if isinstance(schedule_output, list)
                    else getattr(schedule_output, "entries", [])
                )

                schedule_repo = ScheduleRepository(db)

                for entry in entries_iter:
                    entry_dict = (
                        entry.model_dump() if hasattr(entry, "model_dump") else entry
                    )
                    # map day_of_week + HH:MM strings to concrete datetimes (UTC)
                    day_name = entry_dict.get("day_of_week") or entry_dict.get("day")
                    start_time_str = entry_dict.get("start_time")
                    end_time_str = entry_dict.get("end_time")

                    weekday = _weekday_from_name(day_name)
                    if weekday is None or not start_time_str or not end_time_str:
                        logger.warning(
                            "Skipping schedule entry with missing day/time: %s",
                            entry_dict,
                        )
                        continue

                    try:
                        start_dt = _to_next_datetime_for_weekday(
                            weekday, start_time_str
                        )
                        end_dt = _to_next_datetime_for_weekday(weekday, end_time_str)
                    except Exception:
                        logger.exception(
                            "Failed parsing schedule times: %s", entry_dict
                        )
                        continue

                    schedule_entries.append(
                        {
                            "id": generate_uuid(),
                            "user_id": user_id,
                            "title": entry_dict.get("title", "Study Session"),
                            "start_time": start_dt,
                            "end_time": end_dt,
                            "activity_type": entry_dict.get("activity_type", "study"),
                            "related_subject_id": entry_dict.get("related_subject_id"),
                            "related_lesson_id": entry_dict.get("related_lesson_id"),
                            "related_quiz_id": entry_dict.get("related_quiz_id"),
                            "status": "pending",
                        }
                    )

                if schedule_entries:
                    await schedule_repo.bulk_insert(schedule_entries)
                    logger.info(f"Created {len(schedule_entries)} schedule entries")
            except Exception as e:
                logger.error(f"Error generating schedule: {e}", exc_info=True)

        # Upsert user context to vectorstore
        try:
            logger.info("Upserting user context to vectorstore")
            profile_summary = f"User: {getattr(profile, 'full_name', 'N/A')}, Level: {getattr(profile, 'academic_level', 'N/A')}, Major: {getattr(profile, 'major', 'N/A')}, Hobbies: {', '.join(hobbies)}"
            await user_context_store.upsert(user_id, profile_summary)
        except Exception as e:
            logger.error(f"Error upserting to vectorstore: {e}", exc_info=True)

        # Mark job complete
        await set_json(
            f"job:{job_id}", {"status": "complete", "error": None}, ttl=86400
        )
        logger.info(f"Post-onboarding setup completed for user {user_id}")

    except Exception as e:
        logger.error(
            f"Post-onboarding setup failed for user {user_id}: {e}", exc_info=True
        )
        await set_json(
            f"job:{job_id}", {"status": "failed", "error": str(e)}, ttl=86400
        )
    finally:
        await db.close()
