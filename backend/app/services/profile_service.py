from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.subject_repository import SubjectRepository
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
        hobbies = await user_repo.get_hobbies(user_id)
        subjects = await subject_repo.get_all_by_user(user_id)

        out = {
            "user": {
                "id": user.id,
                "email": user.email,
                "onboarding_complete": getattr(user, "onboarding_complete", False),
            },
            "profile": {
                "academic_level": getattr(profile, "academic_level", None),
                "major": getattr(profile, "major", None),
                "full_name": getattr(profile, "full_name", None),
                "available_time_slots": getattr(profile, "available_time_slots", None)
                or [],
            },
            "hobbies": hobbies or [],
            "subjects": [
                {
                    "id": subject.id,
                    "name": subject.name,
                    "priority": subject.priority,
                    "weekly_hours": subject.weekly_hours,
                    "goal": subject.goal,
                }
                for subject in subjects
            ],
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
