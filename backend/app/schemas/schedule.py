from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ScheduleEntryResponse(BaseModel):
    id: str
    title: str
    start_time: datetime
    end_time: datetime
    activity_type: str
    status: str
    related_subject_id: Optional[str]
    related_lesson_id: Optional[str]
    related_quiz_id: Optional[str]


class ScheduleResponse(BaseModel):
    entries: list[ScheduleEntryResponse]


class UpdateScheduleStatusRequest(BaseModel):
    status: str


class RegenerateScheduleRequest(BaseModel):
    feedback: str
