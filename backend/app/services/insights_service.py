from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.subject_repository import SubjectRepository
from app.schemas.insights import DashboardInsightsResponse, AIInsightsResponse


class InsightsService:
    async def get_dashboard_insights(
        self, user_id: str, db: AsyncSession
    ) -> DashboardInsightsResponse:
        repo = AnalyticsRepository(db)
        subject_repo = SubjectRepository(db)

        current_streak, longest = await repo.compute_streak(user_id)
        today_completed, today_total = await repo.get_today_lesson_counts(user_id)
        weekly = await repo.get_weekly_study_hours(user_id)
        total_hours = sum([item["hours"] for item in weekly])
        avg_quiz_score = await repo.compute_average_quiz_score(user_id)
        quiz_completion_rate = await repo.compute_quiz_completion_rate(user_id)
        total_completed = await repo.get_lessons_completed(user_id)
        total_lessons = await repo.get_total_lessons(user_id)
        last_active_lesson_id = await repo.get_last_active_lesson(user_id)
        course_completion = await repo.compute_course_completion(user_id)
        total_estimated_hours = await repo.get_total_estimated_study_hours(user_id)
        total_available_hours_this_week = (
            await repo.get_total_available_hours_this_week(user_id)
        )
        study_hours_this_week = await repo.get_total_study_hours_this_week(user_id)

        subjects = await subject_repo.get_all_by_user(user_id)
        subject_progress = []
        for subject in subjects:
            progress_pct = float(
                getattr(subject.progress, "progress_percentage", 0.0) or 0.0
            )
            if progress_pct == 0.0:
                progress_pct = await repo.compute_subject_progress(user_id, subject.id)
            subject_progress.append(
                {
                    "subject_id": subject.id,
                    "subject_name": subject.name,
                    "progress_percentage": int(round(progress_pct)),
                }
            )

        return DashboardInsightsResponse.model_validate(
            {
                "current_streak": int(current_streak),
                "longest_streak": int(longest),
                "today_lessons_completed": int(today_completed),
                "today_lessons_total": int(today_total),
                "total_study_hours": int(round(total_hours)),
                "total_estimated_study_hours": int(round(total_estimated_hours)),
                "total_study_hours_this_week": int(round(study_hours_this_week)),
                "total_study_hours_available_this_week": int(
                    round(total_available_hours_this_week)
                ),
                "total_course_completion": int(round(course_completion)),
                "total_lessons_completed": int(total_completed),
                "total_lessons_available": int(total_lessons),
                "last_active_lesson_id": last_active_lesson_id,
                "avg_quiz_score": int(round(avg_quiz_score)),
                "quiz_completion_rate": int(round(quiz_completion_rate)),
                "subject_progress": subject_progress,
                "weekly_study_hours": weekly,
            }
        )

    async def create_snapshot(self, user_id: str, db: AsyncSession) -> None:
        repo = AnalyticsRepository(db)
        current_streak, longest = await repo.compute_streak(user_id)
        avg_quiz_score = await repo.compute_average_quiz_score(user_id)
        completion_rate = await repo.compute_course_completion(user_id)
        total_hours = await repo.get_total_study_hours(user_id)
        await repo.save_snapshot(
            user_id,
            {
                "streak": int(current_streak),
                "longest_streak": int(longest),
                "avg_quiz_score": int(round(avg_quiz_score)),
                "completion_rate": int(round(completion_rate)),
                "study_hours": int(round(total_hours)),
            },
        )

    async def get_ai_report(self, user_id: str, db: AsyncSession) -> AIInsightsResponse:
        repo = AnalyticsRepository(db)
        snapshot = await repo.get_latest_snapshot(user_id)
        from app.ai.agents import get_insights_agent

        agent = get_insights_agent()
        analytics_payload = {}
        if snapshot is not None:
            analytics_payload = {
                "streak": snapshot.streak,
                "longest_streak": snapshot.longest_streak,
                "avg_quiz_score": snapshot.avg_quiz_score,
                "completion_rate": snapshot.completion_rate,
                "study_hours": snapshot.study_hours,
                "snapshot_date": snapshot.snapshot_date.isoformat(),
            }
        output = await agent.generate(analytics_data=analytics_payload)
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
