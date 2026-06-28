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
    total_estimated_study_hours: float
    total_study_hours_this_week: float
    total_study_hours_available_this_week: float
    total_course_completion: float
    total_lessons_completed: int
    total_lessons_available: int
    last_active_lesson_id: str | None = None
    avg_quiz_score: float
    quiz_completion_rate: float
    subject_progress: list[SubjectProgressItem]
    weekly_study_hours: list[WeeklyStudyItem]


class AIInsightsResponse(BaseModel):
    insights: list[str]
    recommendations: list[str]
    generated_at: datetime
