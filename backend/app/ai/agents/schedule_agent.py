from app.core.exceptions import AIGenerationError
from app.ai.schemas.schedule_output import ScheduleOutput
from app.ai.prompts.schedule_prompts import SCHEDULE_GENERATION_PROMPT
from app.utils.llm_provider import LLMProvider
from app.core.config import settings
from app.utils.logger import logger
from langchain_google_genai import ChatGoogleGenerativeAI


class ScheduleAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        # Use structured output model to return ScheduleOutput instances
        self.llm = (llm or get_llm()).with_structured_output(ScheduleOutput)
        self.prompt = SCHEDULE_GENERATION_PROMPT
        self.chain = self.prompt | self.llm
        self.provider = LLMProvider(settings)

    async def generate(
        self,
        subjects_summary: list[dict],
        available_slots: list[dict],
        all_lessons: list[dict],
    ):
        try:
            return await self.chain.ainvoke(
                {
                    "subjects_summary": str(subjects_summary),
                    "available_slots": str(available_slots),
                    "all_lessons": str(all_lessons),
                }
            )
        except Exception as e:
            error_str = str(e)
            if self.provider.is_quota_error(error_str):
                new_key = self.provider.rotate_key()
                if new_key:
                    logger.info(f"Quota error detected; rotating to backup API key")
                    try:
                        # Reinitialize LLM with new key
                        # Reinitialize structured LLM with rotated key
                        self.llm = ChatGoogleGenerativeAI(
                            model=settings.GEMINI_CHAT_MODEL,
                            google_api_key=new_key,
                            temperature=0.7,
                        ).with_structured_output(ScheduleOutput)
                        self.chain = self.prompt | self.llm

                        # Retry generation with new key
                        return await self.chain.ainvoke(
                            {
                                "subjects_summary": str(subjects_summary),
                                "available_slots": str(available_slots),
                                "all_lessons": str(all_lessons),
                            }
                        )
                    except Exception as retry_error:
                        raise AIGenerationError(
                            f"Schedule generation failed after key rotation: {retry_error}"
                        ) from retry_error
            raise AIGenerationError(f"Schedule generation failed: {e}") from e
