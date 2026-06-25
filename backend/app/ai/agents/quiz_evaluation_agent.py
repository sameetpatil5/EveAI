from app.core.exceptions import AIGenerationError
from app.ai.schemas.quiz_output import EvaluationOutput
from app.ai.prompts.quiz_prompts import QUIZ_GENERATION_PROMPT


class QuizEvaluationAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = (llm or get_llm()).with_structured_output(EvaluationOutput)
        self.prompt = QUIZ_GENERATION_PROMPT
        self.chain = self.prompt | self.llm

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
