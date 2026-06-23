from app.core.exceptions import AIGenerationError
from langchain_core.output_parsers import PydanticOutputParser
from app.ai.schemas.lesson_output import LessonContentOutput
from app.ai.prompts.lesson_prompts import LESSON_GENERATION_PROMPT


class LessonAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = LESSON_GENERATION_PROMPT
        self.parser = PydanticOutputParser(pydantic_object=LessonContentOutput)
        self.chain = self.prompt | self.llm | self.parser

    async def generate(
        self,
        lesson_title: str,
        module_context: str,
        subject: str,
        academic_level: str,
        hobbies: list[str],
    ) -> LessonContentOutput:
        try:
            return await self.chain.ainvoke(
                {
                    "lesson_title": lesson_title,
                    "module_context": module_context,
                    "subject": subject,
                    "academic_level": academic_level,
                    "hobbies": ", ".join(hobbies) if hobbies else "",
                }
            )
        except Exception as e:
            raise AIGenerationError(f"Lesson generation failed: {e}") from e
