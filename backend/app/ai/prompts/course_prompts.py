from langchain_core.prompts import ChatPromptTemplate

template = """
You are a curriculum design expert. Create a comprehensive course structure for the given subject.

COURSE PARAMETERS:
- Subject: {subject_name}
- Academic Level: {academic_level}
- Major/Focus: {major}
- Learning Goal: {goal}
- Duration: {target_weeks} weeks
- Weekly Hours: {weekly_hours} hours
- User Level: {user_level}

Generate a JSON response with EXACTLY this structure:
{{
  "title": "<descriptive course title>",
  "description": "<comprehensive course description explaining scope and outcomes>",
  "estimated_weeks": <integer weeks>,
  "modules": [
    {{
      "title": "<module title>",
      "description": "<module description and learning objectives>",
      "module_order": <integer 1+>,
      "lessons": [
        {{
          "title": "<lesson title>",
          "lesson_order": <integer 1+>
        }}
      ]
    }}
  ]
}}

RULES:
1. Output MUST be valid JSON with proper commas between all fields and array elements.
2. Modules must be ordered sequentially by module_order (1, 2, 3...).
3. Each module must have 4-8 lessons ordered sequentially.
4. Lesson titles should be specific learning outcomes (e.g., "Understanding API Design Patterns").
5. Total modules should align with {target_weeks} weeks (typically 1 module per 1-2 weeks).
6. Ensure learning progression from foundational to advanced concepts.
7. Do NOT include any text outside the JSON block.
"""

COURSE_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
