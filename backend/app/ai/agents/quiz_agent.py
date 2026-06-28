from app.core.exceptions import AIGenerationError
from app.ai.schemas.quiz_output import QuizOutput
from app.ai.prompts.quiz_prompts import QUIZ_GENERATION_PROMPT
from app.utils.llm_provider import LLMProvider
from app.core.config import settings
from app.utils.logger import logger
from langchain_google_genai import ChatGoogleGenerativeAI


class QuizAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = (llm or get_llm()).with_structured_output(QuizOutput)
        self.prompt = QUIZ_GENERATION_PROMPT
        self.chain = self.prompt | self.llm
        self.provider = LLMProvider(settings)

    async def generate(
        self,
        content: str,
        difficulty: str,
        question_count: int,
        prompt: str | None = None,
    ):
        payload = {
            "content": content,
            "difficulty": difficulty,
            "question_count": question_count,
            "prompt": prompt
            or "Create a balanced quiz that covers the core ideas clearly and fairly.",
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
                        ).with_structured_output(QuizOutput)
                        self.chain = self.prompt | self.llm
                        return await self.chain.ainvoke(payload)
                    except Exception as retry_error:
                        raise AIGenerationError(
                            f"Quiz generation failed after key rotation: {retry_error}"
                        ) from retry_error
            raise AIGenerationError(f"Quiz generation failed: {e}") from e
