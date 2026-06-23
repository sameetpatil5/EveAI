from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ValidationError
from app.repositories.user_repository import UserRepository
from app.repositories.subject_repository import SubjectRepository
from app.core.redis import set_json
from app.utils.helpers import generate_uuid


class OnboardingService:
    async def save_academic(self, user_id: str, data, db: AsyncSession) -> None:
        user_repo = UserRepository(db)
        await user_repo.upsert_profile(user_id, data.model_dump())

    async def save_subjects(self, user_id: str, data, db: AsyncSession) -> int:
        subject_repo = SubjectRepository(db)
        # Replace all subjects for user
        count = await subject_repo.replace_all(
            user_id, [s.model_dump() for s in data.subjects]
        )
        return count

    async def save_hobbies(self, user_id: str, data, db: AsyncSession) -> int:
        user_repo = UserRepository(db)
        # Ensure hobbies exist and link to user
        count = await user_repo.upsert_hobbies(user_id, data.hobbies)
        return count

    async def save_availability(self, user_id: str, data, db: AsyncSession) -> None:
        user_repo = UserRepository(db)
        await user_repo.upsert_profile(user_id, data.model_dump())

    async def complete_onboarding(self, user_id: str, db: AsyncSession, redis) -> str:
        user_repo = UserRepository(db)
        subject_repo = SubjectRepository(db)

        profile = await user_repo.get_profile(user_id)
        subjects = await subject_repo.get_all_by_user(user_id)
        hobbies = await user_repo.get_hobbies(user_id)

        if not profile:
            raise ValidationError("Academic info not saved")
        if not subjects:
            raise ValidationError("Subjects not saved")
        if not hobbies:
            raise ValidationError("Hobbies not saved")

        await user_repo.set_onboarding_complete(user_id)
        job_id = generate_uuid()
        await set_json(f"job:{job_id}", {"status": "pending", "error": None}, ttl=86400)
        return job_id
