from langchain_core.prompts import ChatPromptTemplate

template = """
You are an educational analytics expert. Analyze student performance data and generate insights.

ANALYTICS DATA: {analytics_data}

Provide structured insights with these fields:

- `insights`: list of 3-5 concise observations about performance, patterns, or progress
- `recommendations`: list of 3-5 actionable recommendations tied to insights

RULES:
1. Each `insight` should be 1-2 sentences analyzing data patterns.
2. Each `recommendation` should be specific, actionable, and tied to an insight.
3. Use `analytics_data` to support insights and recommendations.
4. Write in an encouraging, constructive tone highlighting progress and growth potential.
"""

INSIGHTS_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
