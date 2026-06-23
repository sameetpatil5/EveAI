from app.core.exceptions import AIGenerationError
from langchain_core.output_parsers import PydanticOutputParser
from app.ai.schemas.lesson_output import LessonContentOutput
from app.ai.prompts.lesson_prompts import LESSON_GENERATION_PROMPT
from app.utils.llm_provider import LLMProvider
from app.core.config import settings
from app.utils.logger import logger
from langchain_google_genai import ChatGoogleGenerativeAI


class LessonAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = LESSON_GENERATION_PROMPT
        self.parser = PydanticOutputParser(pydantic_object=LessonContentOutput)
        self.chain = self.prompt | self.llm | self.parser
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
            result = await self.chain.ainvoke(
                {
                    "lesson_title": lesson_title,
                    "module_context": module_context,
                    "subject": subject,
                    "academic_level": academic_level,
                    "hobbies": ", ".join(hobbies) if hobbies else "",
                }
            )
            logger.info(
                f"[AGENT] LLM chain completed successfully. "
                f"Output type={type(result).__name__}, "
                f"content_len={len(getattr(result, 'content', ''))}"
            )
            return result
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
                        self.llm = ChatGoogleGenerativeAI(
                            model=settings.GEMINI_CHAT_MODEL,
                            google_api_key=new_key,
                            temperature=0.7,
                        )
                        self.chain = self.prompt | self.llm | self.parser
                        logger.info("[AGENT] Retrying with rotated API key...")
                        result = await self.chain.ainvoke(
                            {
                                "lesson_title": lesson_title,
                                "module_context": module_context,
                                "subject": subject,
                                "academic_level": academic_level,
                                "hobbies": ", ".join(hobbies) if hobbies else "",
                            }
                        )
                        logger.info(
                            f"[AGENT] Retry successful! "
                            f"content_len={len(getattr(result, 'content', ''))}"
                        )
                        return result
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
