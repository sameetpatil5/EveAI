from langchain_core.prompts import ChatPromptTemplate

template = """
You are an expert assessment designer. Create a quiz based on the provided content.

QUIZ PARAMETERS:
- Content Topic: {content}
- Difficulty Level: {difficulty}
- Number of Questions: {question_count}
- Question Types: Multiple choice, True/False, Short answer (mix based on difficulty)

Generate a JSON response with EXACTLY this structure:
{{
  "title": "<descriptive quiz title>",
  "questions": [
    {{
      "question_text": "<clear, specific question>",
      "question_type": "mcq|truefalse|subjective",
      "options": ["<option1>", "<option2>", "<option3>", "<option4>"],
      "correct_answer": "<exact answer or best option>",
      "explanation": "<detailed explanation of why this is correct>"
    }}
  ]
}}

RULES:
1. Output MUST be valid JSON with proper commas and syntax.
2. For "mcq" type: must have 4 options; correct_answer should be one of the options.
3. For "truefalse" type: options should be ["True", "False"]; correct_answer is "True" or "False".
4. For "subjective" type: options can be null/empty; correct_answer is a sample answer.
5. All explanations must be 2-3 sentences, educational, and clear.
6. Questions should test understanding, not just memorization.
7. Difficulty should scale: easy questions test recall, medium test application, hard test analysis.
8. Do NOT include any text outside the JSON block.
"""

QUIZ_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
