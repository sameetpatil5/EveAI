from langchain_core.prompts import ChatPromptTemplate

template = """
You are an educational content expert. Generate a comprehensive lesson for the following topic.

LESSON DETAILS:
- Title: {lesson_title}
- Subject: {subject}
- Academic Level: {academic_level}
- Module Context: {module_context}
- User Hobbies: {hobbies}

Generate a JSON response with EXACTLY these fields (ensure valid JSON with proper commas):
{{
  "title": "<lesson title>",
  "content": "<detailed markdown content explaining the topic thoroughly>",
  "summary": "<concise 2-3 sentence summary>",
  "hobby_explanation": "<one analogy connecting the topic to user hobbies>",
  "references": [<list of relevant URLs or resource names>],
  "youtube_links": [<list of relevant YouTube video URLs>]
}}

RULES:
1. Content must be in valid Markdown format.
2. Output MUST be valid JSON (check for missing commas between fields).
3. All list fields must contain actual items (at least 2-3 references/links).
4. The hobby_explanation should be a brief analogy if hobbies are provided, otherwise a general relatable comparison.
5. Do NOT include any text outside the JSON block.
"""

LESSON_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
