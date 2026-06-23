from typing import Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.lesson_repository import LessonRepository
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

    async def generate_lesson_content(self, lesson_id: str, db: AsyncSession) -> None:
        """Background task to generate lesson content asynchronously."""
        logger.info(f"[BG] Starting lesson generation for {lesson_id}")
        repo = LessonRepository(db)
        lesson = await repo.get_by_id(lesson_id)
        if not lesson:
            logger.error(f"[BG] Lesson {lesson_id} not found")
            return

        try:
            from app.ai.agents import get_lesson_agent

            agent = get_lesson_agent()
            logger.info(f"[BG] Agent initialized for lesson {lesson_id}")

            logger.info(
                f"[BG] Calling agent.generate for lesson: {lesson.title} "
                f"(context={getattr(lesson, 'module_context', '')}, "
                f"subject={getattr(lesson, 'subject_id', '')}, "
                f"level={getattr(lesson, 'academic_level', '')})"
            )
            output = await agent.generate(
                lesson_title=lesson.title,
                module_context=getattr(lesson, "module_context", ""),
                subject=getattr(lesson, "subject_id", ""),
                academic_level=getattr(lesson, "academic_level", ""),
                hobbies=[],
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
                await lesson_store.upsert(
                    lesson_id,
                    content_data.get("content", ""),
                    {"lesson_id": lesson_id},
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
        await repo.mark_complete(user_id, lesson_id)

    async def get_next_lesson(
        self, user_id: str, current_lesson_id: str, db: AsyncSession
    ):
        repo = LessonRepository(db)
        return await repo.get_next_lesson(user_id, current_lesson_id)
