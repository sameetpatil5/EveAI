from app.core.exceptions import AIGenerationError
from app.ai.prompts.tutor_prompts import TUTOR_SYSTEM_PROMPT


class TutorAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = TUTOR_SYSTEM_PROMPT
        self.chain = self.prompt | self.llm

    async def chat(
        self,
        message: str,
        lesson_content: str,
        chat_history: list[dict],
        retrieved_chunks: list[str],
        user_level: str,
        hobbies: list[str],
    ) -> str:
        try:
            result = await self.chain.ainvoke(
                {
                    "lesson_content": lesson_content,
                    "user_level": user_level,
                    "hobbies": ", ".join(hobbies) if hobbies else "",
                    "message": message,
                    "retrieved_chunks": (
                        "\n".join(retrieved_chunks) if retrieved_chunks else ""
                    ),
                }
            )
            return result
        except Exception as e:
            raise AIGenerationError(f"Tutor chat failed: {e}") from e
