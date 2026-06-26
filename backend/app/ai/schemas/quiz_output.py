from typing import Optional
from pydantic import BaseModel


class QuestionOutput(BaseModel):
    id: str
    question_text: str
    question_type: str  # mcq, true_false, subjective
    options: Optional[list[str]]
    correct_answer: str
    explanation: str


class QuizOutput(BaseModel):
    title: str
    questions: list[QuestionOutput]


class EvaluationOutput(BaseModel):
    is_correct: bool
    explanation: str
