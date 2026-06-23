from langchain_core.prompts import ChatPromptTemplate

template = """
You are an assistant that generates a structured course outline in JSON.
Inputs:
- {subject_name}
- {academic_level}
- {major}
- {goal}
- {target_weeks}
- {weekly_hours}
- {user_level}

Produce a JSON object matching CourseStructureOutput with fields: title, description, estimated_weeks, modules (array of {{title, description, module_order, lessons:[{{title, lesson_order}}] }}).
Return only JSON. Do not add extra commentary.
"""

COURSE_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
