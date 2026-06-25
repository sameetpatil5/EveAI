from app.core.exceptions import AIGenerationError
from app.ai.schemas.lesson_output import LessonContentOutput
from app.ai.prompts.lesson_prompts import LESSON_GENERATION_PROMPT
from app.utils.llm_provider import LLMProvider
from app.core.config import settings
from app.utils.logger import logger
from langchain_google_genai import ChatGoogleGenerativeAI
import json


class LessonAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        # Use structured output to get LessonContentOutput instances directly
        self.llm = (llm or get_llm()).with_structured_output(LessonContentOutput)
        self.prompt = LESSON_GENERATION_PROMPT
        # Chain returns LessonContentOutput instances
        self.chain = self.prompt | self.llm
        self.provider = LLMProvider(settings)

    async def generate(
        self,
        lesson_title: str,
        module_context: str,
        subject: str,
        academic_level: str,
        hobbies: list[str],
    ) -> LessonContentOutput:
        logger.info(
            f"[AGENT] Starting generate() with lesson_title={lesson_title}, "
            f"subject={subject}, academic_level={academic_level}"
        )
        try:
            logger.debug("[AGENT] Invoking LLM chain...")
            inputs = {
                "lesson_title": lesson_title,
                "module_context": module_context,
                "subject": subject,
                "academic_level": academic_level,
                "hobbies": ", ".join(hobbies) if hobbies else "",
            }
            # Structured LLM should return a LessonContentOutput instance
            result = await self.chain.ainvoke(inputs)
            if isinstance(result, LessonContentOutput):
                logger.info(
                    f"[AGENT] Parsed output successfully. content_len={len(getattr(result, 'content',''))}"
                )
                return result
            # Some LLM wrappers may return a container with `.content` or `.text`
            if hasattr(result, "content"):
                maybe = getattr(result, "content")
                if isinstance(maybe, LessonContentOutput):
                    return maybe
            raise AIGenerationError(f"Unexpected LLM output type: {type(result)}")
        except Exception as e:
            logger.error(f"[AGENT] First attempt failed: {e}", exc_info=True)
            error_str = str(e)
            if self.provider.is_quota_error(error_str):
                new_key = self.provider.rotate_key()
                if new_key:
                    logger.info(
                        f"[AGENT] Quota error detected; rotating to backup API key"
                    )
                    try:
                        # Reinitialize structured LLM with rotated key
                        self.llm = ChatGoogleGenerativeAI(
                            model=settings.GEMINI_CHAT_MODEL,
                            google_api_key=new_key,
                            temperature=0.7,
                        ).with_structured_output(LessonContentOutput)
                        self.chain = self.prompt | self.llm
                        logger.info("[AGENT] Retrying with rotated API key...")
                        # Retry flow mirrors the robust parsing above
                        inputs = {
                            "lesson_title": lesson_title,
                            "module_context": module_context,
                            "subject": subject,
                            "academic_level": academic_level,
                            "hobbies": ", ".join(hobbies) if hobbies else "",
                        }

                        result = await self.chain.ainvoke(inputs)
                        if isinstance(result, LessonContentOutput):
                            logger.info(
                                f"[AGENT] Retry parsed successfully. content_len={len(getattr(result,'content',''))}"
                            )
                            return result
                        if hasattr(result, "content") and isinstance(
                            getattr(result, "content"), LessonContentOutput
                        ):
                            return getattr(result, "content")
                        raise AIGenerationError(
                            "Retry returned unexpected LLM output type"
                        )
                    except Exception as retry_error:
                        logger.error(
                            f"[AGENT] Retry failed: {retry_error}", exc_info=True
                        )
                        raise AIGenerationError(
                            f"Lesson generation failed after key rotation: {retry_error}"
                        ) from retry_error
            logger.error(f"[AGENT] Generation failed with error: {e}")
            raise AIGenerationError(f"Lesson generation failed: {e}") from e


def get_lesson_agent():
    return LessonAgent()
