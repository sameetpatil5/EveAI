from datetime import datetime
from pydantic import BaseModel


class SubjectProgressItem(BaseModel):
    subject_id: str
    subject_name: str
    progress_percentage: float


class WeeklyStudyItem(BaseModel):
    date: str
    hours: float


class DashboardInsightsResponse(BaseModel):
    current_streak: int
    longest_streak: int
    today_lessons_completed: int
    today_lessons_total: int
    total_study_hours: float
    avg_quiz_score: float
    quiz_completion_rate: float
    subject_progress: list[SubjectProgressItem]
    weekly_study_hours: list[WeeklyStudyItem]


class AIInsightsResponse(BaseModel):
    insights: list[str]
    generated_at: datetime
