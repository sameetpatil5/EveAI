import json

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
        profile_summary: str,
        subjects_summary: list[dict],
        available_slots: list[dict],
        hobbies: list[str],
        all_lessons: list[dict],
        feedback: str = "",
        current_week_start: str = "",
        current_datetime: str = "",
    ):
        payload = {
            "profile_summary": profile_summary,
            "subjects_summary": json.dumps(subjects_summary, indent=2, default=str),
            "available_slots": json.dumps(available_slots, indent=2, default=str),
            "hobbies": json.dumps(hobbies, indent=2, default=str),
            "all_lessons": json.dumps(all_lessons, indent=2, default=str),
            "feedback": feedback or "",
            "current_week_start": current_week_start,
            "current_datetime": current_datetime or "",
        }
        try:
            return await self.chain.ainvoke(payload)
        except Exception as e:
            error_str = str(e)
            if self.provider.is_quota_error(error_str):
                new_key = self.provider.rotate_key()
                if new_key:
                    logger.info("Quota error detected; rotating to backup API key")
                    try:
                        self.llm = ChatGoogleGenerativeAI(
                            model=settings.GEMINI_CHAT_MODEL,
                            google_api_key=new_key,
                            temperature=0.7,
                        ).with_structured_output(ScheduleOutput)
                        self.chain = self.prompt | self.llm
                        return await self.chain.ainvoke(payload)
                    except Exception as retry_error:
                        raise AIGenerationError(
                            f"Schedule generation failed after key rotation: {retry_error}"
                        ) from retry_error
            raise AIGenerationError(f"Schedule generation failed: {e}") from e
