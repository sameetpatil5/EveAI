from typing import Optional
from pydantic import BaseModel


class ScheduleEntryOutput(BaseModel):
    title: str
    day_of_week: str
    start_time: str  # HH:MM
    end_time: str
    activity_type: str
    related_lesson_id: Optional[str]
    related_quiz_id: Optional[str]
    related_subject_id: Optional[str]


class ScheduleOutput(BaseModel):
    entries: list[ScheduleEntryOutput]
