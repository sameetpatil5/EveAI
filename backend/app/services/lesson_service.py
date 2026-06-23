from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.lesson_repository import LessonRepository
from app.vectorstore.lesson_store import lesson_store
from app.core.exceptions import AIGenerationError, NotFoundError
from app.schemas.lesson import LessonResponse


class LessonService:
    async def get_lesson(
        self, lesson_id: str, user_id: str, db: AsyncSession
    ) -> LessonResponse:
        repo = LessonRepository(db)
        lesson = await repo.get_by_id(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson not found")

        status = getattr(lesson, "generation_status", "pending")
        progress = await repo.get_progress(user_id, lesson_id)
        completed = bool(progress and getattr(progress, "progress", False))

        if status == "complete":
            return LessonResponse.model_validate(
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
            )

        if status == "generating":
            return LessonResponse.model_validate(
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
            )

        # pending or failed -> generate
        await repo.update_status(lesson_id, "generating")
        from app.ai.agents import get_lesson_agent

        agent = get_lesson_agent()
        try:
            output = await agent.generate(
                lesson_title=lesson.title,
                module_context=getattr(lesson, "module_context", ""),
                subject=getattr(lesson, "subject_id", ""),
                academic_level=getattr(lesson, "academic_level", ""),
                hobbies=[],
            )
        except Exception as e:
            await repo.update_status(lesson_id, "failed")
            raise AIGenerationError(f"Lesson generation failed: {e}") from e

        content_data = {
            "content": getattr(output, "content", None),
            "summary": getattr(output, "summary", None),
            "hobby_explanation": getattr(output, "hobby_explanation", None),
            "references": getattr(output, "references", None),
            "youtube_links": getattr(output, "youtube_links", None),
        }
        await repo.save_content(lesson_id, content_data)
        # upsert into vectorstore
        await lesson_store.upsert(
            lesson_id, content_data.get("content", ""), {"lesson_id": lesson_id}
        )
        await repo.update_status(lesson_id, "complete")

        return LessonResponse.model_validate(
            {
                "id": lesson.id,
                "title": lesson.title,
                "generation_status": "complete",
                "content": content_data.get("content"),
                "summary": content_data.get("summary"),
                "hobby_explanation": content_data.get("hobby_explanation"),
                "references": content_data.get("references"),
                "youtube_links": content_data.get("youtube_links"),
                "completed": completed,
            }
        )

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
