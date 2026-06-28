from langchain_core.prompts import ChatPromptTemplate

template = """
You are an expert assessment designer. Create a quiz based on the provided content.

QUIZ PARAMETERS:
- Content Topic: {content}
- Difficulty Level: {difficulty}
- Number of Questions: {question_count}
- Question Types: Multiple choice, True/False, Short answer (mix based on difficulty)
- Additional Instructions: {prompt}

Goal:
Create a quiz that matches the requested topic, difficulty, and instructional focus. If the additional instructions mention a specific style, concept, or learning goal, follow them closely.

Provide a structured quiz representation with the following fields:

- `title`: descriptive quiz title
- `questions`: list of question objects containing:
  - `question_text`
  - `question_type`: mcq|true_false|subjective
  - `options`: list of options (for mcq/true_false)
  - `correct_answer`: exact answer or best option
  - `explanation`: detailed explanation

RULES:
1. For `mcq` type: include 4 options; `correct_answer` must be one of them.
2. For `true_false` type: options should be ["True", "False"]; `correct_answer` is "True" or "False".
3. For `subjective` type: `options` can be null/empty; `correct_answer` is a sample answer.
4. All explanations must be 2-3 sentences and educational.
5. Questions should test understanding, not just memorization.
6. Difficulty should scale: easy recall, medium application, hard analysis.
7. If the prompt asks for a specific emphasis, make sure that emphasis is visible across the questions.
"""

QUIZ_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
