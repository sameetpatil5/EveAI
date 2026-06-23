from typing import Optional
from pydantic import BaseModel


class SubjectCreate(BaseModel):
    name: str
    level: str
    priority: int
    weekly_hours: float
    target_weeks: int
    goal: Optional[str] = None


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None
    priority: Optional[int] = None
    weekly_hours: Optional[float] = None
    target_weeks: Optional[int] = None
    goal: Optional[str] = None
    status: Optional[str] = None


class SubjectResponse(BaseModel):
    id: str
    name: str
    priority: int
    level: str
    weekly_hours: float
    target_weeks: int
    goal: Optional[str]
    status: str
    progress_percentage: float
    course_id: Optional[str]
    course_generation_status: Optional[str]
