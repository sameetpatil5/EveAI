from app.core.exceptions import AIGenerationError
from langchain_core.output_parsers import PydanticOutputParser
from app.ai.schemas.course_output import CourseStructureOutput
from app.ai.prompts.course_prompts import COURSE_GENERATION_PROMPT
from app.utils.llm_provider import LLMProvider
from app.core.config import settings
from app.utils.logger import logger
from langchain_google_genai import ChatGoogleGenerativeAI


class CourseAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = COURSE_GENERATION_PROMPT
        self.parser = PydanticOutputParser(pydantic_object=CourseStructureOutput)
        self.chain = self.prompt | self.llm | self.parser
        self.provider = LLMProvider(settings)

    async def generate(
        self,
        subject_name: str,
        academic_level: str,
        major: str,
        goal: str,
        target_weeks: int,
        weekly_hours: float,
        user_level: str,
    ) -> CourseStructureOutput:
        try:
            return await self.chain.ainvoke(
                {
                    "subject_name": subject_name,
                    "academic_level": academic_level,
                    "major": major,
                    "goal": goal,
                    "target_weeks": target_weeks,
                    "weekly_hours": weekly_hours,
                    "user_level": user_level,
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
                        self.llm = ChatGoogleGenerativeAI(
                            model=settings.GEMINI_CHAT_MODEL,
                            google_api_key=new_key,
                            temperature=0.7,
                        )
                        self.chain = self.prompt | self.llm | self.parser

                        # Retry generation with new key
                        return await self.chain.ainvoke(
                            {
                                "subject_name": subject_name,
                                "academic_level": academic_level,
                                "major": major,
                                "goal": goal,
                                "target_weeks": target_weeks,
                                "weekly_hours": weekly_hours,
                                "user_level": user_level,
                            }
                        )
                    except Exception as retry_error:
                        raise AIGenerationError(
                            f"Course generation failed after key rotation: {retry_error}"
                        ) from retry_error
            raise AIGenerationError(f"Course generation failed: {e}") from e
