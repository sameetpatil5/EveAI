from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.models.course import Course, Module
from app.models.lesson import Lesson, LessonProgress
from app.models.subject import Subject
from app.utils.helpers import utcnow


class LessonRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, lesson_id: str) -> Lesson | None:
        result = await self.db.execute(select(Lesson).where(Lesson.id == lesson_id))
        return result.scalars().first()

    async def get_by_id_with_module(self, lesson_id: str) -> Lesson | None:
        from app.models.course import Module, Course

        result = await self.db.execute(
            select(Lesson)
            .where(Lesson.id == lesson_id)
            .options(
                selectinload(Lesson.module)
                .selectinload(Module.course)
                .selectinload(Course.subject)
            )
        )
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

    async def save_error(self, lesson_id: str, error_message: str) -> None:
        await self.db.execute(
            update(Lesson)
            .where(Lesson.id == lesson_id)
            .values(error_message=error_message)
        )
        await self.db.commit()

    async def reset_generation(self, lesson_id: str) -> None:
        await self.db.execute(
            update(Lesson)
            .where(Lesson.id == lesson_id)
            .values(
                generation_status="pending",
                error_message=None,
                content=None,
                summary=None,
                hobby_explanation=None,
                references=None,
                youtube_links=None,
            )
        )
        await self.db.commit()

    async def get_lessons_for_user(self, user_id: str) -> list[dict[str, Any]]:
        result = await self.db.execute(
            select(
                Lesson.id,
                Lesson.title,
                Lesson.lesson_order,
                Module.module_order.label("module_order"),
                Course.subject_id.label("subject_id"),
                Subject.name.label("subject_name"),
                Subject.priority.label("subject_priority"),
                LessonProgress.completed.label("completed"),
            )
            .join(Module, Lesson.module_id == Module.id)
            .join(Course, Module.course_id == Course.id)
            .join(Subject, Course.subject_id == Subject.id)
            .outerjoin(
                LessonProgress,
                (LessonProgress.lesson_id == Lesson.id)
                & (LessonProgress.user_id == user_id),
            )
            .order_by(Subject.priority.desc(), Module.module_order, Lesson.lesson_order)
        )

        lessons = []
        for row in result.all():
            lessons.append(
                {
                    "id": row.id,
                    "title": row.title,
                    "lesson_order": row.lesson_order,
                    "module_order": row.module_order,
                    "subject_id": row.subject_id,
                    "subject_name": row.subject_name,
                    "subject_priority": row.subject_priority,
                    "completed": (
                        bool(row.completed) if row.completed is not None else False
                    ),
                }
            )
        return lessons

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
        next_lesson = result.scalars().first()
        if next_lesson:
            return next_lesson

        # If this is the last lesson in the module, return the first lesson of the next module.
        from app.models.course import Module

        module_result = await self.db.execute(
            select(Module).where(Module.id == module_id)
        )
        module = module_result.scalars().first()
        if not module:
            return None

        result = await self.db.execute(
            select(Lesson)
            .where(Lesson.module_id == module.id, Lesson.lesson_order > current_order)
            .order_by(Lesson.lesson_order)
            .limit(1)
        )
        next_lesson = result.scalars().first()
        if next_lesson:
            return next_lesson

        next_module_result = await self.db.execute(
            select(Module)
            .where(
                Module.course_id == module.course_id,
                Module.module_order > module.module_order,
            )
            .order_by(Module.module_order)
            .limit(1)
        )
        next_module = next_module_result.scalars().first()
        if not next_module:
            return None

        result = await self.db.execute(
            select(Lesson)
            .where(Lesson.module_id == next_module.id)
            .order_by(Lesson.lesson_order)
            .limit(1)
        )
        return result.scalars().first()

    async def is_module_complete_for_user(self, user_id: str, module_id: str) -> bool:
        from app.models.course import Module

        module_result = await self.db.execute(
            select(Module).where(Module.id == module_id)
        )
        module = module_result.scalars().first()
        if not module:
            return False

        lessons = await self.db.execute(
            select(Lesson.id).where(Lesson.module_id == module_id)
        )
        lesson_ids = [row[0] for row in lessons.fetchall()]
        if not lesson_ids:
            return False

        progress_count = await self.db.execute(
            select(LessonProgress).where(
                LessonProgress.user_id == user_id,
                LessonProgress.lesson_id.in_(lesson_ids),
                LessonProgress.completed == True,
            )
        )
        completed_rows = progress_count.scalars().all()
        return len(completed_rows) == len(lesson_ids)
