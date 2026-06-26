from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.subject import Subject
from app.repositories.user_repository import UserRepository
from app.repositories.schedule_repository import ScheduleRepository
from app.services.profile_service import ProfileService
from app.services.insights_service import InsightsService
from app.schemas.common import success_response

router = APIRouter()


@router.get("/state")
async def get_state(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    # basic user info
    user_info = {"id": user.id, "email": user.email}

    # profile
    profile_service = ProfileService()
    profile = await profile_service.get_profile(user.id, db)
    profile_out = {
        "full_name": getattr(profile, "full_name", None),
        "academic_level": getattr(profile, "academic_level", None),
        "major": getattr(profile, "major", None),
    }

    # hobbies
    user_repo = UserRepository(db)
    hobbies = await user_repo.get_hobbies(user.id)

    # subjects summary with eager loading of progress
    result = await db.execute(
        select(Subject)
        .where(Subject.user_id == user.id)
        .options(selectinload(Subject.progress))
    )
    subjects = result.scalars().all()
    subjects_summary = []
    for s in subjects:
        progress_pct = 0.0
        if s.progress:
            progress_pct = s.progress.progress_percentage
        subjects_summary.append(
            {
                "id": s.id,
                "name": s.name,
                "level": s.level,
                "priority": s.priority,
                "progress_percentage": progress_pct,
            }
        )

    # upcoming schedule (academic activities only: lessons, quizzes, reviews, practice)
    schedule_repo = ScheduleRepository(db)
    schedule_entries = await schedule_repo.get_by_user(user.id)
    upcoming = []
    academic_types = {"lesson", "quiz", "review", "practice"}
    for entry in schedule_entries[:10]:
        # Only include academic activities, exclude breaks and hobbies
        if entry.activity_type in academic_types:
            upcoming.append(
                {
                    "id": entry.id,
                    "time": entry.start_time.isoformat() if entry.start_time else None,
                    "title": entry.title,
                    "activity_type": entry.activity_type,
                    "related_lesson_id": getattr(entry, "related_lesson_id", None),
                }
            )

    # stats
    insights = InsightsService()
    stats_obj = await insights.get_dashboard_insights(user.id, db)
    stats = {
        "current_streak": stats_obj.current_streak,
        "longest_streak": stats_obj.longest_streak,
        "today_lessons_count": stats_obj.today_lessons_completed,
        "avg_quiz_score": stats_obj.avg_quiz_score,
        "completion_rate": stats_obj.quiz_completion_rate,
    }

    # last active lesson id (not tracked centrally yet) - return None
    last_active_lesson_id = None

    result = {
        "user": user_info,
        "profile": profile_out,
        "hobbies": hobbies,
        "subjects": subjects_summary,
        "upcoming_schedule": upcoming,
        "stats": stats,
        "last_active_lesson_id": last_active_lesson_id,
    }

    return success_response(result)
