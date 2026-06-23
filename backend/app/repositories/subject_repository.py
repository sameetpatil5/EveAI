from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.orm import selectinload

from app.models.subject import Subject, SubjectProgress
from app.utils.helpers import generate_uuid


class SubjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_by_user(self, user_id: str) -> list[Subject]:
        result = await self.db.execute(
            select(Subject)
            .where(Subject.user_id == user_id)
            .options(selectinload(Subject.progress), selectinload(Subject.courses))
        )
        return result.scalars().all()

    async def get_by_id(self, subject_id: str) -> Subject | None:
        result = await self.db.execute(
            select(Subject)
            .where(Subject.id == subject_id)
            .options(selectinload(Subject.progress), selectinload(Subject.courses))
        )
        return result.scalars().first()

    async def create(self, user_id: str, data: dict) -> Subject:
        subject = Subject(user_id=user_id, **data)
        self.db.add(subject)
        await self.db.commit()
        await self.db.refresh(subject)
        return subject

    async def update(self, subject_id: str, data: dict) -> Subject:
        subject = await self.get_by_id(subject_id)
        if subject:
            for key, value in data.items():
                if hasattr(subject, key):
                    setattr(subject, key, value)
            await self.db.commit()
            await self.db.refresh(subject)
        return subject

    async def delete(self, subject_id: str) -> None:
        await self.db.execute(delete(Subject).where(Subject.id == subject_id))
        await self.db.commit()

    async def replace_all(self, user_id: str, subjects_data: list[dict]) -> int:
        # Delete existing subjects for user
        await self.db.execute(delete(Subject).where(Subject.user_id == user_id))
        # Create new ones
        for data in subjects_data:
            subject = Subject(user_id=user_id, **data)
            self.db.add(subject)
        await self.db.commit()
        return len(subjects_data)

    async def get_progress(self, subject_id: str) -> SubjectProgress | None:
        result = await self.db.execute(
            select(SubjectProgress).where(SubjectProgress.subject_id == subject_id)
        )
        return result.scalars().first()

    async def upsert_progress(
        self, user_id: str, subject_id: str, percentage: float
    ) -> None:
        progress = await self.get_progress(subject_id)
        if progress:
            await self.db.execute(
                update(SubjectProgress)
                .where(SubjectProgress.subject_id == subject_id)
                .values(progress_percentage=percentage)
            )
        else:
            progress = SubjectProgress(
                user_id=user_id, subject_id=subject_id, progress_percentage=percentage
            )
            self.db.add(progress)
        await self.db.commit()
