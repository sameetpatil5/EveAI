from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, date

from app.models.analytics import AnalyticsSnapshot
from app.models.course import Course, Module
from app.models.lesson import Lesson, LessonProgress
from app.models.quiz import QuizAttempt
from app.models.subject import Subject


class AnalyticsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_latest_snapshot(self, user_id: str) -> AnalyticsSnapshot | None:
        result = await self.db.execute(
            select(AnalyticsSnapshot)
            .where(AnalyticsSnapshot.user_id == user_id)
            .order_by(AnalyticsSnapshot.snapshot_date.desc())
            .limit(1)
        )
        return result.scalars().first()

    async def save_snapshot(self, user_id: str, data: dict) -> None:
        snapshot = AnalyticsSnapshot(
            user_id=user_id, snapshot_date=date.today(), **data
        )
        self.db.add(snapshot)
        await self.db.commit()

    async def compute_streak(self, user_id: str) -> tuple[int, int]:
        # Compute current and longest consecutive-day streaks using LessonProgress.completed_at
        result = await self.db.execute(
            select(LessonProgress.completed_at)
            .where(LessonProgress.user_id == user_id, LessonProgress.completed == True)
            .order_by(LessonProgress.completed_at.desc())
        )
        rows = [r[0].date() for r in result.fetchall() if r[0] is not None]
        # unique, ordered descending
        seen = []
        for d in rows:
            if not seen or seen[-1] != d:
                seen.append(d)
        if not seen:
            return (0, 0)

        # compute longest streak
        longest = 0
        current = 1
        for i in range(1, len(seen)):
            if (seen[i - 1] - seen[i]).days == 1:
                current += 1
            else:
                longest = max(longest, current)
                current = 1
        longest = max(longest, current)

        # compute current streak (consecutive up to today)
        from datetime import date

        today = date.today()
        cur_streak = 0
        # iterate descending dates
        expected = today
        for d in seen:
            if d == expected:
                cur_streak += 1
                expected = expected - timedelta(days=1)
            elif d < expected:
                break

        return (cur_streak, longest)

    async def compute_average_quiz_score(self, user_id: str) -> float:
        result = await self.db.execute(
            select(func.avg(QuizAttempt.score)).where(QuizAttempt.user_id == user_id)
        )
        average = result.scalar()
        return float(average or 0.0)

    async def get_total_quizzes(self, user_id: str) -> int:
        from app.models.quiz import Quiz

        stmt = (
            select(func.count(Quiz.id))
            .select_from(Quiz)
            .join(Module, Quiz.module_id == Module.id)
            .join(Course, Module.course_id == Course.id)
            .join(Subject, Course.subject_id == Subject.id)
            .where(Subject.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def get_quizzes_attempted(self, user_id: str) -> int:
        result = await self.db.execute(
            select(func.count(func.distinct(QuizAttempt.quiz_id))).where(
                QuizAttempt.user_id == user_id
            )
        )
        return result.scalar() or 0

    async def compute_quiz_completion_rate(self, user_id: str) -> float:
        total_quizzes = await self.get_total_quizzes(user_id)
        if total_quizzes == 0:
            return 0.0
        attempted = await self.get_quizzes_attempted(user_id)
        return (attempted / total_quizzes) * 100.0

    async def compute_course_completion(self, user_id: str) -> float:
        total_lessons = await self.get_total_lessons(user_id)
        if total_lessons == 0:
            return 0.0
        completed_lessons = await self.get_lessons_completed(user_id)
        return (completed_lessons / total_lessons) * 100.0

    async def get_total_study_hours(self, user_id: str) -> float:
        completed_lessons = await self.get_lessons_completed(user_id)
        return float(completed_lessons) * 0.5

    async def get_total_study_hours_this_week(self, user_id: str) -> float:
        weekly = await self.get_weekly_study_hours(user_id)
        return sum(item["hours"] for item in weekly)

    async def get_total_estimated_study_hours(self, user_id: str) -> float:
        stmt = select(
            func.coalesce(func.sum(Subject.weekly_hours * Subject.target_weeks), 0.0)
        ).where(Subject.user_id == user_id)
        result = await self.db.execute(stmt)
        return float(result.scalar() or 0.0)

    async def get_total_available_hours_this_week(self, user_id: str) -> float:
        stmt = select(func.coalesce(func.sum(Subject.weekly_hours), 0.0)).where(
            Subject.user_id == user_id
        )
        result = await self.db.execute(stmt)
        return float(result.scalar() or 0.0)

    async def compute_subject_progress(self, user_id: str, subject_id: str) -> float:
        lesson_stmt = (
            select(func.count(Lesson.id))
            .select_from(Lesson)
            .join(Module, Lesson.module_id == Module.id)
            .join(Course, Module.course_id == Course.id)
            .where(Course.subject_id == subject_id)
        )
        total_result = await self.db.execute(lesson_stmt)
        total_lessons = total_result.scalar() or 0

        if total_lessons == 0:
            return 0.0

        completed_stmt = (
            select(func.count(LessonProgress.id))
            .select_from(LessonProgress)
            .join(Lesson, LessonProgress.lesson_id == Lesson.id)
            .join(Module, Lesson.module_id == Module.id)
            .join(Course, Module.course_id == Course.id)
            .where(
                LessonProgress.user_id == user_id,
                LessonProgress.completed == True,
                Course.subject_id == subject_id,
            )
        )
        completed_result = await self.db.execute(completed_stmt)
        completed_lessons = completed_result.scalar() or 0
        return (completed_lessons / total_lessons) * 100.0

    async def get_subject_lesson_counts(
        self, user_id: str, subject_id: str
    ) -> tuple[int, int]:
        lesson_stmt = (
            select(func.count(Lesson.id))
            .select_from(Lesson)
            .join(Module, Lesson.module_id == Module.id)
            .join(Course, Module.course_id == Course.id)
            .where(Course.subject_id == subject_id)
        )
        total_result = await self.db.execute(lesson_stmt)
        total_lessons = total_result.scalar() or 0

        completed_stmt = (
            select(func.count(LessonProgress.id))
            .select_from(LessonProgress)
            .join(Lesson, LessonProgress.lesson_id == Lesson.id)
            .join(Module, Lesson.module_id == Module.id)
            .join(Course, Module.course_id == Course.id)
            .where(
                LessonProgress.user_id == user_id,
                LessonProgress.completed == True,
                Course.subject_id == subject_id,
            )
        )
        completed_result = await self.db.execute(completed_stmt)
        completed_lessons = completed_result.scalar() or 0
        return (total_lessons, completed_lessons)

    async def get_today_lesson_counts(self, user_id: str) -> tuple[int, int]:
        today = date.today()
        completed_result = await self.db.execute(
            select(func.count(LessonProgress.id)).where(
                LessonProgress.user_id == user_id,
                LessonProgress.completed == True,
                func.date(LessonProgress.completed_at) == today,
            )
        )
        completed_today = completed_result.scalar() or 0

        stmt = (
            select(func.count(Lesson.id))
            .select_from(Subject)
            .join(Course, Course.subject_id == Subject.id)
            .join(Module, Module.course_id == Course.id)
            .join(Lesson, Lesson.module_id == Module.id)
            .where(Subject.user_id == user_id)
        )
        total_result = await self.db.execute(stmt)
        total = total_result.scalar() or 0
        return (completed_today, total)

    async def get_weekly_study_hours(self, user_id: str) -> list[dict]:
        DEFAULT_HOURS_PER_LESSON = 0.5
        today = datetime.today().date()
        weekly = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            result = await self.db.execute(
                select(func.count(LessonProgress.id)).where(
                    LessonProgress.user_id == user_id,
                    LessonProgress.completed == True,
                    func.date(LessonProgress.completed_at) == d,
                )
            )
            count = result.scalar() or 0
            weekly.append(
                {
                    "date": d.strftime("%Y-%m-%d"),
                    "hours": int(round(count * DEFAULT_HOURS_PER_LESSON)),
                }
            )
        return weekly

    async def get_total_lessons(self, user_id: str) -> int:
        stmt = (
            select(func.count(Lesson.id))
            .select_from(Subject)
            .join(Course, Course.subject_id == Subject.id)
            .join(Module, Module.course_id == Course.id)
            .join(Lesson, Lesson.module_id == Module.id)
            .where(Subject.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def get_lessons_completed(self, user_id: str) -> int:
        result = await self.db.execute(
            select(func.count(LessonProgress.id)).where(
                LessonProgress.user_id == user_id,
                LessonProgress.completed == True,
            )
        )
        return result.scalar() or 0

    async def get_last_active_lesson(self, user_id: str) -> str | None:
        result = await self.db.execute(
            select(LessonProgress.lesson_id)
            .where(LessonProgress.user_id == user_id, LessonProgress.completed == True)
            .order_by(LessonProgress.completed_at.desc())
            .limit(1)
        )
        return result.scalar()
