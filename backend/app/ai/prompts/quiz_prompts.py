from langchain_core.prompts import ChatPromptTemplate

template = """
Generate a quiz in JSON matching QuizOutput.
Template variables: {content}, {difficulty}, {question_count}, question_types
Include questions with fields: question_text, question_type, options (for MCQ), correct_answer, explanation.
Return only valid JSON.
"""

QUIZ_GENERATION_PROMPT = ChatPromptTemplate.from_template(template)
