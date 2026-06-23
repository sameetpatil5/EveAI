from typing import Optional
from pydantic import BaseModel


class QuestionOutput(BaseModel):
    question_text: str
    question_type: str  # mcq, truefalse, subjective
    options: Optional[list[str]]
    correct_answer: str
    explanation: str


class QuizOutput(BaseModel):
    title: str
    questions: list[QuestionOutput]


class EvaluationOutput(BaseModel):
    score: float  # 0-100
    feedback: str
