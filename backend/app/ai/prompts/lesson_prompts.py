from langchain_core.prompts import ChatPromptTemplate

template = """
You are an assistant that generates lesson content for a single lesson title.
Template variables: {lesson_title}, {module_context}, {subject}, {academic_level}, {hobbies}
Produce JSON matching LessonContentOutput:
- title
- content (Markdown)
- summary
- hobby_explanation (include one analogy tied to user's hobbies)
- references (list of urls/strings)
- youtube_links (list of urls)
Return only JSON.
"""

LESSON_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
