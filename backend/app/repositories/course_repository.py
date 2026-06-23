from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.course import Course, Module
from app.models.lesson import Lesson
from app.utils.helpers import generate_uuid


class CourseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_subject(self, subject_id: str) -> Course | None:
        result = await self.db.execute(
            select(Course).where(Course.subject_id == subject_id)
        )
        return result.scalars().first()

    async def get_by_id(self, course_id: str) -> Course | None:
        result = await self.db.execute(select(Course).where(Course.id == course_id))
        return result.scalars().first()

    async def create(self, subject_id: str, data: dict) -> Course:
        course = Course(subject_id=subject_id, **data)
        self.db.add(course)
        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def update_status(self, course_id: str, status: str) -> None:
        from sqlalchemy import update

        await self.db.execute(
            update(Course)
            .where(Course.id == course_id)
            .values(generation_status=status)
        )
        await self.db.commit()

    async def get_structure(self, course_id: str) -> Course:
        result = await self.db.execute(
            select(Course)
            .where(Course.id == course_id)
            .options(selectinload(Course.modules).selectinload(Module.lessons))
        )
        return result.scalars().first()

    async def create_module(self, course_id: str, data: dict) -> Module:
        module = Module(course_id=course_id, **data)
        self.db.add(module)
        await self.db.commit()
        await self.db.refresh(module)
        return module

    async def create_lesson_metadata(self, module_id: str, data: dict) -> Lesson:
        lesson = Lesson(module_id=module_id, **data)
        self.db.add(lesson)
        await self.db.commit()
        await self.db.refresh(lesson)
        return lesson
