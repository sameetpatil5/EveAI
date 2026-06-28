from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.lesson_repository import LessonRepository
from app.repositories.user_repository import UserRepository
from app.vectorstore.lesson_store import lesson_store
from app.core.exceptions import NotFoundError
from app.core.redis import get_json, set_json
from app.schemas.chat import TutorChatResponse, QuickAskResponse
from app.ai.base import get_llm
from app.utils.helpers import generate_uuid
import datetime


class ChatService:
    async def tutor_chat(
        self,
        user_id: str,
        message: str,
        lesson_id: str,
        session_id: str | None,
        db: AsyncSession,
        redis,
    ) -> TutorChatResponse:
        # manage session id
        sid = session_id or generate_uuid()
        history = await get_json(f"chat:{sid}", redis=redis) or []

        lesson_repo = LessonRepository(db)
        lesson = await lesson_repo.get_by_id_with_module(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson not found")

        module = getattr(lesson, "module", None)
        course = getattr(module, "course", None) if module else None
        subject_id = getattr(course, "subject_id", None) if course else None

        chunks = await lesson_store.search(message, subject_id)
        user_repo = UserRepository(db)
        profile = await user_repo.get_profile(user_id)
        from app.ai.agents import get_tutor_agent

        agent = get_tutor_agent()
        reply = await agent.chat(
            message=message,
            lesson_content=getattr(lesson, "content", ""),
            chat_history=history,
            retrieved_chunks=chunks,
            user_level=getattr(profile, "academic_level", ""),
            hobbies=await user_repo.get_hobbies(user_id) or [],
        )

        # append to history and save
        history.append(
            {
                "user": message,
                "assistant": reply,
                "ts": datetime.datetime.utcnow().isoformat(),
            }
        )
        await set_json(f"chat:{sid}", history, ttl=7200, redis=redis)

        # Note: chat DB persistence not implemented in repositories; skip DB save
        return TutorChatResponse.model_validate({"session_id": sid, "response": reply})

    async def quick_ask(
        self,
        user_id: str,
        message: str,
        db: AsyncSession,
    ) -> QuickAskResponse:
        user_repo = UserRepository(db)
        profile = await user_repo.get_profile(user_id)
        hobbies = await user_repo.get_hobbies(user_id) or []

        # retrieve relevant chunks across lessons/courses
        chunks = await lesson_store.search(message, None)

        from app.ai.agents import get_tutor_agent

        agent = get_tutor_agent()
        reply = await agent.chat(
            message=message,
            lesson_content="",
            chat_history=[],
            retrieved_chunks=chunks,
            user_level=getattr(profile, "academic_level", ""),
            hobbies=hobbies,
        )

        return QuickAskResponse.model_validate({"response": reply})
