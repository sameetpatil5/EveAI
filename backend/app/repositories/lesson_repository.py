from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.models.lesson import Lesson, LessonProgress
from app.utils.helpers import utcnow


class LessonRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, lesson_id: str) -> Lesson | None:
        result = await self.db.execute(select(Lesson).where(Lesson.id == lesson_id))
        return result.scalars().first()

    async def update_status(self, lesson_id: str, status: str) -> None:
        await self.db.execute(
            update(Lesson)
            .where(Lesson.id == lesson_id)
            .values(generation_status=status)
        )
        await self.db.commit()

    async def save_content(self, lesson_id: str, content_data: dict) -> None:
        await self.db.execute(
            update(Lesson).where(Lesson.id == lesson_id).values(**content_data)
        )
        await self.db.commit()

    async def get_progress(self, user_id: str, lesson_id: str) -> LessonProgress | None:
        result = await self.db.execute(
            select(LessonProgress).where(
                LessonProgress.user_id == user_id, LessonProgress.lesson_id == lesson_id
            )
        )
        return result.scalars().first()

    async def mark_complete(self, user_id: str, lesson_id: str) -> None:
        progress = await self.get_progress(user_id, lesson_id)
        if progress:
            await self.db.execute(
                update(LessonProgress)
                .where(LessonProgress.id == progress.id)
                .values(completed=True, completed_at=utcnow())
            )
        else:
            progress = LessonProgress(
                user_id=user_id,
                lesson_id=lesson_id,
                completed=True,
                completed_at=utcnow(),
            )
            self.db.add(progress)
        await self.db.commit()

    async def get_next_lesson(
        self, user_id: str, current_lesson_id: str
    ) -> Lesson | None:
        # Get current lesson to find module and order
        current = await self.get_by_id(current_lesson_id)
        if not current:
            return None
        module_id = current.module_id
        current_order = current.lesson_order

        # Get next lesson in same module or first lesson of next module
        result = await self.db.execute(
            select(Lesson)
            .where(Lesson.module_id == module_id, Lesson.lesson_order > current_order)
            .order_by(Lesson.lesson_order)
            .limit(1)
        )
        return result.scalars().first()
