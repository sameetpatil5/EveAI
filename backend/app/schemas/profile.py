from pydantic import BaseModel
from typing import Optional


class UserInfo(BaseModel):
    id: str
    email: str
    onboarding_complete: bool
    member_since: str


class ProfileInfo(BaseModel):
    full_name: Optional[str] = None
    academic_level: Optional[str] = None
    major: Optional[str] = None
    available_time_slots: Optional[list[dict]] = None


class SubjectProfileItem(BaseModel):
    id: str
    name: str
    priority: int
    weekly_hours: float
    goal: Optional[str] = None
    progress_percentage: int


class ProfileOut(BaseModel):
    user: UserInfo
    profile: ProfileInfo
    hobbies: list[str] = []
    current_streak: int
    total_lessons_completed: int
    subjects: list[SubjectProfileItem] = []
