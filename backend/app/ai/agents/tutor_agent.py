from app.core.exceptions import AIGenerationError
from app.ai.prompts.tutor_prompts import TUTOR_SYSTEM_PROMPT
from app.utils.llm_provider import LLMProvider
from app.core.config import settings
from app.utils.logger import logger
from langchain_google_genai import ChatGoogleGenerativeAI


class TutorAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = TUTOR_SYSTEM_PROMPT
        self.chain = self.prompt | self.llm
        self.provider = LLMProvider(settings)

    async def chat(
        self,
        message: str,
        lesson_content: str,
        chat_history: list[dict],
        retrieved_chunks: list[str],
        user_level: str,
        hobbies: list[str],
    ) -> str:
        inputs = {
            "lesson_content": lesson_content,
            "user_level": user_level,
            "hobbies": ", ".join(hobbies) if hobbies else "",
            "message": message,
            "retrieved_chunks": (
                "\n".join(retrieved_chunks) if retrieved_chunks else ""
            ),
        }

        try:
            result = await self.chain.ainvoke(inputs)
            if isinstance(result, str):
                return result
            if hasattr(result, "content"):
                return getattr(result, "content")
            if hasattr(result, "text"):
                return getattr(result, "text")
            return str(result)
        except Exception as e:
            error_str = str(e)
            logger.error(f"[AGENT] Tutor chat failed: {error_str}", exc_info=True)
            if self.provider.is_quota_error(error_str):
                new_key = self.provider.rotate_key()
                if new_key:
                    logger.info(
                        "[AGENT] Quota error detected; rotating tutor API key and retrying"
                    )
                    try:
                        self.llm = ChatGoogleGenerativeAI(
                            model=settings.GEMINI_CHAT_MODEL,
                            google_api_key=new_key,
                            temperature=0.7,
                        )
                        self.chain = self.prompt | self.llm
                        result = await self.chain.ainvoke(inputs)
                        if isinstance(result, str):
                            return result
                        if hasattr(result, "content"):
                            return getattr(result, "content")
                        if hasattr(result, "text"):
                            return getattr(result, "text")
                        return str(result)
                    except Exception as retry_error:
                        logger.error(
                            f"[AGENT] Tutor retry failed: {retry_error}", exc_info=True
                        )
                        raise AIGenerationError(
                            f"Tutor chat failed after key rotation: {retry_error}"
                        ) from retry_error
            raise AIGenerationError(f"Tutor chat failed: {e}") from e
