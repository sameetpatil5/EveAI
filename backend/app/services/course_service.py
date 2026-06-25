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

        # If the outline exists, treat the course as ready even if the DB flag is stale.
        course_status = getattr(course, "generation_status", "pending")
        if course_status == "pending" and getattr(course, "modules", None):
            course_status = "complete"

        # Build CourseStructureResponse by mapping modules and lessons.
        # Compute module locks dynamically so the next module unlocks as soon as the prior one is complete.
        modules = sorted(
            getattr(course, "modules", []),
            key=lambda mod: getattr(mod, "module_order", 0),
        )
        modules_out = []
        previous_module_complete = True

        for module in modules:
            lessons = sorted(
                getattr(module, "lessons", []),
                key=lambda lesson: getattr(lesson, "lesson_order", 0),
            )
            lessons_out = []
            for lesson in lessons:
                progress = await lesson_repo.get_progress(
                    user_id, getattr(lesson, "id")
                )
                completed = bool(progress and getattr(progress, "completed", False))
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

            current_module_complete = bool(lessons_out) and all(
                lesson["completed"] for lesson in lessons_out
            )
            modules_out.append(
                {
                    "id": getattr(module, "id"),
                    "title": getattr(module, "title"),
                    "description": getattr(module, "description", None),
                    "module_order": getattr(module, "module_order", 0),
                    "is_locked": not previous_module_complete,
                    "lessons": lessons_out,
                }
            )
            previous_module_complete = current_module_complete

        course_out = {
            "id": getattr(course, "id"),
            "title": getattr(course, "title"),
            "description": getattr(course, "description", None),
            "total_modules": getattr(course, "total_modules", 0),
            "generation_status": course_status,
            "modules": modules_out,
        }
        return CourseStructureResponse.model_validate(course_out)
