from typing import Optional
from pydantic import BaseModel


class LessonResponse(BaseModel):
    id: str
    title: str
    generation_status: str
    content: Optional[str]
    summary: Optional[str]
    hobby_explanation: Optional[str]
    references: Optional[list]
    youtube_links: Optional[list]
    completed: bool
    course_id: Optional[str] = None
    error_message: Optional[str] = None
