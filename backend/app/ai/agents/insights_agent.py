from app.core.exceptions import AIGenerationError
from app.ai.schemas.insights_output import InsightsOutput
from app.ai.prompts.insights_prompts import INSIGHTS_GENERATION_PROMPT


class InsightsAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = (llm or get_llm()).with_structured_output(InsightsOutput)
        self.prompt = INSIGHTS_GENERATION_PROMPT
        self.chain = self.prompt | self.llm

    async def generate(self, analytics_data: dict):
        try:
            return await self.chain.ainvoke({"analytics_data": str(analytics_data)})
        except Exception as e:
            raise AIGenerationError(f"Insights generation failed: {e}") from e
