from langchain_core.prompts import ChatPromptTemplate

template = """
You are a study schedule optimizer. Create a personalized schedule for the user’s current week only.

USER PROFILE:
- Profile: {profile_summary}
- Subjects Summary: {subjects_summary}
- Available Time Slots: {available_slots}
- Hobbies: {hobbies}
- Lessons: {all_lessons}
- Current Week Start (Monday): {current_week_start}
- Current Date & Time: {current_datetime}
- Regeneration Feedback: {feedback}

Provide a structured schedule with this shape:

- `entries`: list of schedule entries, each containing:
  - `title`: descriptive activity title
  - `day_of_week`: one of Monday..Sunday
  - `start_time`: HH:MM (24-hour)
  - `end_time`: HH:MM (24-hour)
  - `activity_type`: lesson|quiz|review|break|hobby
  - `related_lesson_id`: lesson_id or null
  - `related_quiz_id`: quiz_id or null
  - `related_subject_id`: subject_id or null

RULES:
1. If today is mid-week (not Monday), generate from today onwards and leave previous days empty.
2. If today is Monday, generate the full week starting from today.
3. For next week onwards, generate from Monday only (full week).
4. Use the user's available time slots; do not schedule outside those windows.
5. Break activities should appear after about 90 minutes of study.
6. Breaks should be 15-30 minutes, activity_type "break".
7. Use hobbies as light activities when there is spare study time.
8. Distribute lesson study time proportionally based on subject priority and weekly_hours.
9. Prefer 60-minute lesson blocks and 30-minute hobby or quiz blocks.
10. Do not schedule after 22:00 local time.
11. Include at least one review/catch-up slot if lessons remain.
12. Respect lesson completion state; only schedule incomplete or pending lessons.
13. Return valid JSON with exactly the requested fields.
"""

SCHEDULE_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
