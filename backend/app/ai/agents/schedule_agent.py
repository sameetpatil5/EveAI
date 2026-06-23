from app.core.exceptions import AIGenerationError
from langchain_core.output_parsers import PydanticOutputParser

from app.ai.schemas.schedule_output import ScheduleOutput
from app.ai.prompts.schedule_prompts import SCHEDULE_GENERATION_PROMPT


class ScheduleAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = SCHEDULE_GENERATION_PROMPT
        self.parser = PydanticOutputParser(pydantic_object=ScheduleOutput)
        self.chain = self.prompt | self.llm | self.parser

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
            raise AIGenerationError(f"Schedule generation failed: {e}") from e
