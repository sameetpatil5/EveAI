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

Provide a structured course representation matching the fields below.

- `title`: descriptive course title
- `description`: comprehensive course description explaining scope and outcomes
- `estimated_weeks`: integer number of weeks
- `modules`: list of modules, each with:
  - `title`: module title
  - `description`: module description and learning objectives
  - `module_order`: integer 1+
  - `lessons`: list of lessons with `title` and `lesson_order`

RULES:
1. Modules must be ordered sequentially by `module_order` (1, 2, 3...).
2. Each module should have 4-8 lessons ordered sequentially.
3. Lesson titles should be specific learning outcomes (e.g., "Understanding API Design Patterns").
4. Total modules should align with {target_weeks} weeks (typically 1 module per 1-2 weeks).
5. Ensure learning progression from foundational to advanced concepts.
"""

COURSE_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
