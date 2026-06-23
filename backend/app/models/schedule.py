from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    activity_type = Column(String, nullable=False)
    related_subject_id = Column(
        String, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=True
    )
    related_lesson_id = Column(String, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=True)
    related_quiz_id = Column(String, ForeignKey("quizzes.id",   ondelete="CASCADE"), nullable=True)
    status = Column(String, default="pending")

    user = relationship("User", back_populates="schedules")
    related_subject = relationship("Subject", back_populates="schedules")
    related_lesson = relationship("Lesson", back_populates="schedules")
