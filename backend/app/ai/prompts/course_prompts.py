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
- `description`: comprehensive course description explaining the course scope, objectives, and expected learning outcomes
- `estimated_weeks`: integer representing the intended course duration
- `modules`: list of modules, each with:
  - `title`: module title
  - `module_order`: integer starting from 1
  - `activities`: ordered list of learning activities, each with:
    - `title`: activity title
    - `activity_order`: integer starting from 1 indicating the order within the module
    - `activity_type`: one of `lesson`, `quiz`, `review`, or `practice`
    - `estimated_minutes`: estimated time required to complete the activity
    - `resources`: optional list of helpful articles, documentation, tutorials, videos, or references
RULES:
1. Design modules around the logical structure of the topic, not around weeks.
2. Create as many modules as needed for clear conceptual progression and engagement.
3. Each module should contain 3-6 lessons ordered sequentially.
4. Every module should include a mix of activities that supports understanding and retention.
5. Include lessons to introduce new concepts.
6. Include quizzes to test recent material.
7. Include review activities that revisit earlier concepts from the current module and previous modules using spaced repetition principles.
8. Include practice activities that are hands-on or reflective, with helpful resources for self-discovery and verification.
9. Review and practice activities should appear strategically, not as a rigid pattern like Lesson -> Quiz.
10. Make reviews more comprehensive as the learner progresses.
11. Ensure the course is educationally coherent and can be scheduled later across the target duration.
12. The scheduling system will distribute the course across {target_weeks} weeks; do not force one module per week.
"""

COURSE_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
