from langchain_core.prompts import ChatPromptTemplate

template = """
You are an educational content expert. Generate a comprehensive lesson for the following topic.

LESSON DETAILS:
- Title: {lesson_title}
- Subject: {subject}
- Academic Level: {academic_level}
- Module Context: {module_context}
- User Hobbies: {hobbies}

Provide a structured lesson representation with the following fields:

- `title`: lesson title
- `content`: detailed markdown content explaining the topic thoroughly
- `summary`: concise 2-3 sentence summary
- `hobby_explanation`: one analogy connecting the topic to user hobbies (or a general comparison)
- `references`: list of relevant URLs or resource names (2-3 items)
- `youtube_links`: list of relevant YouTube video URLs (2-3 items)

RULES:
1. Content must be in valid Markdown format.
2. All list fields should contain actual items (2-3 references/links when appropriate).
3. The `hobby_explanation` should be a brief analogy if hobbies are provided.
"""

LESSON_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
