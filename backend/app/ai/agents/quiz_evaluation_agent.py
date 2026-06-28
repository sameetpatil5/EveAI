from app.core.exceptions import AIGenerationError
from app.ai.schemas.quiz_output import EvaluationOutput
from app.ai.prompts.quiz_evaluation_prompts import QUIZ_EVALUATION_PROMPT
from app.utils.llm_provider import LLMProvider
from app.core.config import settings
from app.utils.logger import logger
from langchain_google_genai import ChatGoogleGenerativeAI


class QuizEvaluationAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = (llm or get_llm()).with_structured_output(EvaluationOutput)
        self.prompt = QUIZ_EVALUATION_PROMPT
        self.chain = self.prompt | self.llm
        self.provider = LLMProvider(settings)

    async def evaluate(self, question: str, expected_answer: str, user_answer: str):
        payload = {
            "question": question,
            "expected_answer": expected_answer,
            "user_answer": user_answer,
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
                        ).with_structured_output(EvaluationOutput)
                        self.chain = self.prompt | self.llm
                        return await self.chain.ainvoke(payload)
                    except Exception as retry_error:
                        raise AIGenerationError(
                            f"Quiz evaluation failed after key rotation: {retry_error}"
                        ) from retry_error
            raise AIGenerationError(f"Quiz evaluation failed: {e}") from e
