from typing import Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.course_repository import CourseRepository
from app.repositories.lesson_repository import LessonRepository
from app.repositories.subject_repository import SubjectRepository
from app.repositories.analytics_repository import AnalyticsRepository
from app.services.insights_service import InsightsService
from app.vectorstore.lesson_store import lesson_store
from app.core.exceptions import AIGenerationError, NotFoundError
from app.schemas.lesson import LessonResponse
from app.utils.logger import logger


class LessonService:
    async def get_lesson(
        self, lesson_id: str, user_id: str, db: AsyncSession
    ) -> tuple[LessonResponse, bool]:
        repo = LessonRepository(db)
        lesson = await repo.get_by_id(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson not found")

        status = getattr(lesson, "generation_status", "pending")
        progress = await repo.get_progress(user_id, lesson_id)
        completed = bool(progress and getattr(progress, "completed", False))

        logger.debug(f"Lesson {lesson_id} status: {status}, completed: {completed}")

        if status == "complete":
            return (
                LessonResponse.model_validate(
                    {
                        "id": lesson.id,
                        "title": lesson.title,
                        "generation_status": status,
                        "content": getattr(lesson, "content", None),
                        "summary": getattr(lesson, "summary", None),
                        "hobby_explanation": getattr(lesson, "hobby_explanation", None),
                        "references": getattr(lesson, "references", None),
                        "youtube_links": getattr(lesson, "youtube_links", None),
                        "completed": completed,
                    }
                ),
                False,
            )

        if status == "generating":
            logger.debug(f"Lesson {lesson_id} still generating, returning status")
            return (
                LessonResponse.model_validate(
                    {
                        "id": lesson.id,
                        "title": lesson.title,
                        "generation_status": status,
                        "content": None,
                        "summary": None,
                        "hobby_explanation": None,
                        "references": None,
                        "youtube_links": None,
                        "completed": completed,
                    }
                ),
                False,
            )

        if status == "failed":
            return (
                LessonResponse.model_validate(
                    {
                        "id": lesson.id,
                        "title": lesson.title,
                        "generation_status": status,
                        "content": getattr(lesson, "content", None),
                        "summary": getattr(lesson, "summary", None),
                        "hobby_explanation": getattr(lesson, "hobby_explanation", None),
                        "references": getattr(lesson, "references", None),
                        "youtube_links": getattr(lesson, "youtube_links", None),
                        "completed": completed,
                        "error_message": getattr(lesson, "error_message", None),
                    }
                ),
                False,
            )

        # pending -> start background generation
        logger.info(
            f"Triggering background generation for lesson {lesson_id}: {lesson.title}"
        )
        await repo.update_status(lesson_id, "generating")
        return (
            LessonResponse.model_validate(
                {
                    "id": lesson.id,
                    "title": lesson.title,
                    "generation_status": "generating",
                    "content": None,
                    "summary": None,
                    "hobby_explanation": None,
                    "references": None,
                    "youtube_links": None,
                    "completed": completed,
                    "error_message": None,
                }
            ),
            True,
        )

    async def generate_lesson_content(
        self, lesson_id: str, db: AsyncSession, user_id: str = None
    ) -> None:
        """Background task to generate lesson content asynchronously."""
        logger.info(f"[BG] Starting lesson generation for {lesson_id}")
        repo = LessonRepository(db)
        lesson = await repo.get_by_id_with_module(lesson_id)
        if not lesson:
            logger.error(f"[BG] Lesson {lesson_id} not found")
            return

        try:
            from app.ai.agents import get_lesson_agent
            from app.models.course import Module, Course
            from app.repositories.user_repository import UserRepository

            agent = get_lesson_agent()
            logger.info(f"[BG] Agent initialized for lesson {lesson_id}")

            # Extract context from relationships
            module: Module = getattr(lesson, "module", None)
            module_context = getattr(module, "description", "") if module else ""

            course: Course = getattr(module, "course", None) if module else None
            subject_name = (
                getattr(course.subject, "name", "")
                if course and getattr(course, "subject", None)
                else ""
            )

            academic_level = ""
            hobbies = []
            if user_id:
                user_repo = UserRepository(db)
                user_profile = await user_repo.get_profile(user_id)
                if user_profile:
                    academic_level = getattr(user_profile, "academic_level", "")
                hobbies = await user_repo.get_hobbies(user_id)

            logger.info(
                f"[BG] Calling agent.generate for lesson: {lesson.title} "
                f"(module={module_context[:50] if module_context else 'N/A'}, "
                f"subject={subject_name}, level={academic_level})"
            )
            output = await agent.generate(
                lesson_title=lesson.title,
                module_context=module_context,
                subject=subject_name,
                academic_level=academic_level,
                hobbies=hobbies,
            )

            logger.info(
                f"[BG] Agent.generate completed for lesson {lesson_id}. "
                f"Content length: {len(getattr(output, 'content', ''))}"
            )

            content_data = {
                "content": getattr(output, "content", None),
                "summary": getattr(output, "summary", None),
                "hobby_explanation": getattr(output, "hobby_explanation", None),
                "references": getattr(output, "references", None),
                "youtube_links": getattr(output, "youtube_links", None),
            }
            await repo.save_content(lesson_id, content_data)
            logger.info(f"[BG] Saved content for lesson {lesson_id}")

            try:
                logger.info(f"[BG] Upserting to vector store for lesson {lesson_id}")
                metadata = {"lesson_id": lesson_id}
                if course is not None and getattr(course, "subject_id", None):
                    metadata["subject_id"] = course.subject_id

                await lesson_store.upsert(
                    lesson_id,
                    content_data.get("content", ""),
                    metadata,
                )
                logger.info(
                    f"[BG] Vector store upsert completed for lesson {lesson_id}"
                )
            except Exception as e:
                logger.warning(
                    f"[BG] Vector store upsert failed for lesson {lesson_id}: {e}",
                    exc_info=True,
                )

            await repo.update_status(lesson_id, "complete")
            logger.info(f"[BG] Lesson {lesson_id} generation COMPLETE")

        except Exception as e:
            logger.error(
                f"[BG] Lesson {lesson_id} generation FAILED: {e}", exc_info=True
            )
            await repo.update_status(lesson_id, "failed")
            await repo.save_error(lesson_id, str(e))

    async def reset_lesson_generation(self, lesson_id: str, db: AsyncSession) -> None:
        repo = LessonRepository(db)
        logger.info(f"Resetting failed lesson generation state for {lesson_id}")
        await repo.reset_generation(lesson_id)

    async def mark_complete(
        self, lesson_id: str, user_id: str, db: AsyncSession
    ) -> None:
        repo = LessonRepository(db)
        lesson = await repo.get_by_id_with_module(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson not found")

        await repo.mark_complete(user_id, lesson_id)

        module_id = getattr(lesson, "module_id", None)
        if module_id and await repo.is_module_complete_for_user(user_id, module_id):
            course_repo = CourseRepository(db)
            next_module = await course_repo.get_next_module(module_id)
            if next_module and getattr(next_module, "is_locked", True):
                await course_repo.unlock_module(next_module.id)

        # Update subject progress after lesson completion.
        subject_repo = SubjectRepository(db)
        subject_id = None
        module = getattr(lesson, "module", None)
        if module is not None:
            course = getattr(module, "course", None)
            if course is not None:
                subject_id = getattr(course, "subject_id", None)

        if subject_id:
            progress_pct = await AnalyticsRepository(db).compute_subject_progress(
                user_id, subject_id
            )
            await subject_repo.upsert_progress(user_id, subject_id, progress_pct)

        # Save snapshot for analytics history.
        insights_service = InsightsService()
        await insights_service.create_snapshot(user_id, db)

    async def get_next_lesson(
        self, user_id: str, current_lesson_id: str, db: AsyncSession
    ):
        repo = LessonRepository(db)
        lesson = await repo.get_next_lesson(user_id, current_lesson_id)
        if not lesson:
            return None

        progress = await repo.get_progress(user_id, lesson.id)
        completed = bool(progress and getattr(progress, "completed", False))

        return LessonResponse.model_validate(
            {
                "id": lesson.id,
                "title": lesson.title,
                "generation_status": getattr(lesson, "generation_status", "pending"),
                "content": getattr(lesson, "content", None),
                "summary": getattr(lesson, "summary", None),
                "hobby_explanation": getattr(lesson, "hobby_explanation", None),
                "references": getattr(lesson, "references", None),
                "youtube_links": getattr(lesson, "youtube_links", None),
                "completed": completed,
            }
        )
