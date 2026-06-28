from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.subject_repository import SubjectRepository
from app.repositories.analytics_repository import AnalyticsRepository
from app.core.exceptions import NotFoundError
from app.schemas.profile import ProfileOut


class ProfileService:
    async def get_profile(self, user_id: str, db: AsyncSession) -> ProfileOut:
        user_repo = UserRepository(db)
        profile = await user_repo.get_profile(user_id)
        if not profile:
            raise NotFoundError("Profile not found")
        user = await user_repo.get_by_id(user_id)
        subject_repo = SubjectRepository(db)
        analytics_repo = AnalyticsRepository(db)
        hobbies = await user_repo.get_hobbies(user_id)
        subjects = await subject_repo.get_all_by_user(user_id)

        subject_items = []
        for subject in subjects:
            progress_pct = float(
                getattr(subject.progress, "progress_percentage", 0.0) or 0.0
            )
            if progress_pct == 0.0:
                progress_pct = await analytics_repo.compute_subject_progress(
                    user_id, subject.id
                )
            subject_items.append(
                {
                    "id": subject.id,
                    "name": subject.name,
                    "priority": subject.priority,
                    "weekly_hours": subject.weekly_hours,
                    "goal": subject.goal,
                    "progress_percentage": int(round(progress_pct)),
                }
            )

        current_streak, _ = await analytics_repo.compute_streak(user_id)
        total_lessons_completed = await analytics_repo.get_lessons_completed(user_id)

        out = {
            "user": {
                "id": user.id,
                "email": user.email,
                "onboarding_complete": getattr(user, "onboarding_complete", False),
                "member_since": (
                    getattr(user, "created_at", None).isoformat()
                    if getattr(user, "created_at", None)
                    else None
                ),
            },
            "profile": {
                "academic_level": getattr(profile, "academic_level", None),
                "major": getattr(profile, "major", None),
                "full_name": getattr(profile, "full_name", None),
                "available_time_slots": getattr(profile, "available_time_slots", None)
                or [],
            },
            "hobbies": hobbies or [],
            "current_streak": int(current_streak),
            "total_lessons_completed": int(total_lessons_completed),
            "subjects": subject_items,
        }
        return ProfileOut.model_validate(out)

    async def update_profile(self, user_id: str, data: dict, db: AsyncSession) -> None:
        user_repo = UserRepository(db)
        subject_repo = SubjectRepository(db)
        # Update profile fields
        await user_repo.upsert_profile(
            user_id,
            {
                k: v
                for k, v in data.items()
                if k in ["full_name", "academic_level", "major", "available_time_slots"]
            },
        )
        # Update hobbies if provided
        if data.get("hobbies"):
            await user_repo.upsert_hobbies(data.get("hobbies"))
        # Update subject fields if provided (do not create/delete subjects)
        if data.get("subjects"):
            for s in data.get("subjects"):
                await subject_repo.update(s.get("id"), s)
