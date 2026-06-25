from langchain_core.prompts import ChatPromptTemplate

template = """
You are an educational analytics expert. Analyze student performance data and generate insights.

ANALYTICS DATA: {analytics_data}

Generate a JSON response with EXACTLY this structure:
{{
  "insights": [
    "<insight about performance, patterns, or progress>",
    "<another key insight from the data>",
    "<a third meaningful insight>"
  ],
  "recommendations": [
    "<specific actionable recommendation based on insights>",
    "<another recommendation to improve learning>",
    "<a third recommendation for better outcomes>"
  ]
}}

RULES:
1. Output MUST be valid JSON with proper commas and syntax.
2. "insights" must contain 3-5 items; each 1-2 sentences analyzing data patterns.
3. "recommendations" must contain 3-5 items; each specific, actionable, and tied to an insight.
4. Insights should cover: performance trends, strengths, areas for improvement, engagement patterns.
5. Recommendations should be specific (e.g., "Focus on practice problems for Module 3" not "study more").
6. Use data from analytics_data to support all insights and recommendations.
7. Write in encouraging, constructive tone highlighting progress and growth potential.
8. Do NOT include any text outside the JSON block.
"""

INSIGHTS_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
