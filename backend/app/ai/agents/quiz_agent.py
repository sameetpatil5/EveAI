from app.core.exceptions import AIGenerationError
from app.ai.schemas.quiz_output import QuizOutput
from app.ai.prompts.quiz_prompts import QUIZ_GENERATION_PROMPT


class QuizAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = (llm or get_llm()).with_structured_output(QuizOutput)
        self.prompt = QUIZ_GENERATION_PROMPT
        self.chain = self.prompt | self.llm

    async def generate(
        self,
        content: str,
        difficulty: str,
        question_count: int,
        prompt: str | None = None,
    ):
        try:
            return await self.chain.ainvoke(
                {
                    "content": content,
                    "difficulty": difficulty,
                    "question_count": question_count,
                    "prompt": prompt
                    or "Create a balanced quiz that covers the core ideas clearly and fairly.",
                }
            )
        except Exception as e:
            raise AIGenerationError(f"Quiz generation failed: {e}") from e
