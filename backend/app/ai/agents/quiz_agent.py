from app.core.exceptions import AIGenerationError
from langchain_core.output_parsers import PydanticOutputParser

from app.ai.schemas.quiz_output import QuizOutput
from app.ai.prompts.quiz_prompts import QUIZ_GENERATION_PROMPT


class QuizAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = QUIZ_GENERATION_PROMPT
        self.parser = PydanticOutputParser(pydantic_object=QuizOutput)
        self.chain = self.prompt | self.llm | self.parser

    async def generate(self, content: str, difficulty: str, question_count: int):
        try:
            return await self.chain.ainvoke(
                {
                    "content": content,
                    "difficulty": difficulty,
                    "question_count": question_count,
                }
            )
        except Exception as e:
            raise AIGenerationError(f"Quiz generation failed: {e}") from e
