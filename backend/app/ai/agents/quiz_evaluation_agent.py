from app.core.exceptions import AIGenerationError
from langchain_core.output_parsers import PydanticOutputParser

from app.ai.schemas.quiz_output import EvaluationOutput
from app.ai.prompts.quiz_prompts import QUIZ_GENERATION_PROMPT


class QuizEvaluationAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = QUIZ_GENERATION_PROMPT
        self.parser = PydanticOutputParser(pydantic_object=EvaluationOutput)
        self.chain = self.prompt | self.llm | self.parser

    async def evaluate(self, question: str, expected_answer: str, user_answer: str):
        try:
            return await self.chain.ainvoke(
                {
                    "question": question,
                    "expected_answer": expected_answer,
                    "user_answer": user_answer,
                }
            )
        except Exception as e:
            raise AIGenerationError(f"Quiz evaluation failed: {e}") from e
