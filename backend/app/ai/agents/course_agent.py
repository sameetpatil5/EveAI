from app.core.exceptions import AIGenerationError
from langchain_core.output_parsers import PydanticOutputParser
from app.ai.schemas.course_output import CourseStructureOutput
from app.ai.prompts.course_prompts import COURSE_GENERATION_PROMPT


class CourseAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = COURSE_GENERATION_PROMPT
        self.parser = PydanticOutputParser(pydantic_object=CourseStructureOutput)
        self.chain = self.prompt | self.llm | self.parser

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
            raise AIGenerationError(f"Course generation failed: {e}") from e
