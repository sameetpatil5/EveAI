from langchain_core.prompts import ChatPromptTemplate

template = """
Generate a study schedule given {subjects_summary}, {available_slots}, and {all_lessons}.

Enforce constraints: 
1) include a break every 90 minutes
2) distribute time by subject priority
3) never schedule a lesson before its prerequisites.

Return JSON matching ScheduleOutput: 
{{
  "entries": [
    {{
      "title": "string",
      "day_of_week": "string",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "activity_type": "string",
      "related_lesson_id": "string|null",
      "related_quiz_id": "string|null",
      "related_subject_id": "string|null"
    }}
  ]
}}

Return only JSON.
"""

SCHEDULE_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
