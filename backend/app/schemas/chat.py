from typing import Optional
from pydantic import BaseModel


class TutorChatRequest(BaseModel):
    message: str
    lesson_id: str
    session_id: Optional[str] = None


class TutorChatResponse(BaseModel):
    session_id: str
    response: str
    references: list = []


class QuickAskRequest(BaseModel):
    message: str
    subject_id: Optional[str] = None


class QuickAskResponse(BaseModel):
    response: str
    references: list = []
