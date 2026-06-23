from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta, date

from app.models.analytics import AnalyticsSnapshot
from app.models.lesson import LessonProgress
from app.models.quiz import QuizAttempt


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
        # Placeholder: compute current and longest streak from lesson completion dates
        # For now, return default values
        return (0, 0)

    async def compute_completion_rate(self, user_id: str) -> float:
        result = await self.db.execute(
            select(func.count(LessonProgress.id)).where(
                LessonProgress.user_id == user_id, LessonProgress.completed == True
            )
        )
        completed = result.scalar() or 0
        result = await self.db.execute(
            select(func.count(LessonProgress.id)).where(
                LessonProgress.user_id == user_id
            )
        )
        total = result.scalar() or 1
        return (completed / total) * 100 if total > 0 else 0.0

    async def get_today_lesson_counts(self, user_id: str) -> tuple[int, int]:
        # Placeholder: return (completed_today, total_assigned_today)
        return (0, 0)

    async def get_weekly_study_hours(self, user_id: str) -> list[dict]:
        # Placeholder: return list of {date, hours} for past 7 days
        return [
            {
                "date": (datetime.today() - timedelta(days=i)).strftime("%Y-%m-%d"),
                "hours": 0.0,
            }
            for i in range(7)
        ]
