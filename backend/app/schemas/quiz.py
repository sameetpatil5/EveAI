from typing import Optional
from pydantic import BaseModel


class QuizGenerateModuleRequest(BaseModel):
    module_id: str
    difficulty: str = "medium"
    question_count: int = 10
    prompt: Optional[str] = None


class QuizGenerateQuickRequest(BaseModel):
    subject_id: str
    difficulty: str = "medium"
    question_count: int = 10
    prompt: Optional[str] = None


class QuestionResponse(BaseModel):
    id: str
    question_text: str
    question_type: str
    options: Optional[list[str]]


class QuizResponse(BaseModel):
    id: str
    title: str
    questions: list[QuestionResponse]


class SubmitAnswerItem(BaseModel):
    question_id: str
    answer: str


class QuizSubmitRequest(BaseModel):
    answers: list[SubmitAnswerItem]


class QuizResultResponse(BaseModel):
    quiz_id: str
    score: float
    passed: bool
    feedback: Optional[str]
    question_results: list[dict]
