from langchain_core.prompts import ChatPromptTemplate

template = """
Given analytics_data, produce insights and recommendations in JSON matching InsightsOutput.
Fields: insights (list of strings), recommendations (list of strings).
Return only JSON.
"""

INSIGHTS_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
