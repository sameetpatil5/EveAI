from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.insights import DashboardInsightsResponse, AIInsightsResponse


class InsightsService:
    async def get_dashboard_insights(
        self, user_id: str, db: AsyncSession
    ) -> DashboardInsightsResponse:
        repo = AnalyticsRepository(db)
        current_streak, longest = await repo.compute_streak(user_id)
        today_completed, today_total = await repo.get_today_lesson_counts(user_id)
        total_hours = sum(
            [h["hours"] for h in await repo.get_weekly_study_hours(user_id)]
        )
        avg_quiz_score = await repo.compute_completion_rate(user_id)
        subject_progress = []
        weekly = await repo.get_weekly_study_hours(user_id)
        return DashboardInsightsResponse.model_validate(
            {
                "current_streak": current_streak,
                "longest_streak": longest,
                "today_lessons_completed": today_completed,
                "today_lessons_total": today_total,
                "total_study_hours": total_hours,
                "avg_quiz_score": avg_quiz_score,
                "quiz_completion_rate": avg_quiz_score,
                "subject_progress": subject_progress,
                "weekly_study_hours": weekly,
            }
        )

    async def get_ai_report(self, user_id: str, db: AsyncSession) -> AIInsightsResponse:
        repo = AnalyticsRepository(db)
        snapshot = await repo.get_latest_snapshot(user_id)
        from app.ai.agents import get_insights_agent

        agent = get_insights_agent()
        output = await agent.generate(analytics_data={})
        insights = getattr(output, "insights", [])
        generated_at = getattr(output, "generated_at", None)
        if generated_at is None:
            generated_at = datetime.now(timezone.utc)

        return AIInsightsResponse.model_validate(
            {
                "insights": insights,
                "generated_at": generated_at,
            }
        )
