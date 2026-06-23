from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.course_repository import CourseRepository
from app.repositories.subject_repository import SubjectRepository
from app.repositories.lesson_repository import LessonRepository
from app.core.exceptions import ForbiddenError, NotFoundError
from app.schemas.course import CourseStructureResponse


class CourseService:
    async def get_course_by_subject(
        self, subject_id: str, user_id: str, db: AsyncSession
    ):
        subject_repo = SubjectRepository(db)
        subject = await subject_repo.get_by_id(subject_id)
        if not subject:
            raise NotFoundError("Subject not found")
        if subject.user_id != user_id:
            raise ForbiddenError("Not allowed")
        course_repo = CourseRepository(db)
        course = await course_repo.get_by_subject(subject_id)
        return course

    async def get_course_structure(
        self, course_id: str, user_id: str, db: AsyncSession
    ) -> CourseStructureResponse:
        course_repo = CourseRepository(db)
        lesson_repo = LessonRepository(db)
        course = await course_repo.get_structure(course_id)
        if not course:
            raise NotFoundError("Course not found")

        # Verify ownership via subject
        # course.subject_id may not exist on structure object; attempt safe access
        subj_id = getattr(course, "subject_id", None)
        if subj_id:
            subject_repo = SubjectRepository(db)
            subject = await subject_repo.get_by_id(subj_id)
            if subject and subject.user_id != user_id:
                raise ForbiddenError("Not allowed")

        # Build CourseStructureResponse by mapping modules and lessons
        modules_out = []
        for module in getattr(course, "modules", []):
            lessons_out = []
            for lesson in getattr(module, "lessons", []):
                progress = await lesson_repo.get_progress(
                    user_id, getattr(lesson, "id")
                )
                completed = bool(progress and getattr(progress, "progress", False))
                lessons_out.append(
                    {
                        "id": getattr(lesson, "id"),
                        "title": getattr(lesson, "title"),
                        "lesson_order": getattr(lesson, "lesson_order", 0),
                        "generation_status": getattr(
                            lesson, "generation_status", "pending"
                        ),
                        "completed": completed,
                    }
                )
            modules_out.append(
                {
                    "id": getattr(module, "id"),
                    "title": getattr(module, "title"),
                    "description": getattr(module, "description", None),
                    "module_order": getattr(module, "module_order", 0),
                    "is_locked": getattr(module, "is_locked", True),
                    "lessons": lessons_out,
                }
            )

        course_out = {
            "id": getattr(course, "id"),
            "title": getattr(course, "title"),
            "description": getattr(course, "description", None),
            "total_modules": getattr(course, "total_modules", 0),
            "generation_status": getattr(course, "generation_status", "pending"),
            "modules": modules_out,
        }
        return CourseStructureResponse.model_validate(course_out)
