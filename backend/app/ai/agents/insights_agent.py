from app.core.exceptions import AIGenerationError
from langchain_core.output_parsers import PydanticOutputParser

from app.ai.schemas.insights_output import InsightsOutput
from app.ai.prompts.insights_prompts import INSIGHTS_GENERATION_PROMPT


class InsightsAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = INSIGHTS_GENERATION_PROMPT
        self.parser = PydanticOutputParser(pydantic_object=InsightsOutput)
        self.chain = self.prompt | self.llm | self.parser

    async def generate(self, analytics_data: dict):
        try:
            return await self.chain.ainvoke({"analytics_data": str(analytics_data)})
        except Exception as e:
            raise AIGenerationError(f"Insights generation failed: {e}") from e
