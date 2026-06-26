from langchain_core.prompts import ChatPromptTemplate

template = """
You are an expert grading assistant. Evaluate a learner's answer against the expected answer and return a structured response.

INPUT:
- question: {question}
- expected_answer: {expected_answer}
- user_answer: {user_answer}

OUTPUT:
- is_correct: true or false
- explanation: short teaching feedback explaining whether the answer is correct and why

Return the output as JSON only.
"""

QUIZ_EVALUATION_PROMPT = ChatPromptTemplate.from_template(template)
