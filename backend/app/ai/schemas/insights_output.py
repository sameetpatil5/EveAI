from pydantic import BaseModel


class InsightsOutput(BaseModel):
    insights: list[str]
    recommendations: list[str]
