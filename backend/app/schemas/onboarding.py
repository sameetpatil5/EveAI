from typing import Optional
from pydantic import BaseModel


class AcademicInfoRequest(BaseModel):
    academic_level: str
    major: str


class SubjectInput(BaseModel):
    name: str
    level: str
    priority: int
    weekly_hours: float
    target_weeks: int
    goal: Optional[str] = None


class SubjectsRequest(BaseModel):
    subjects: list[SubjectInput]


class HobbiesRequest(BaseModel):
    hobbies: list[str]


class AvailabilitySlot(BaseModel):
    start: str
    end: str


class AvailabilityRequest(BaseModel):
    available_time_slots: list[AvailabilitySlot]


class OnboardingCompleteResponse(BaseModel):
    job_id: str
    message: str
