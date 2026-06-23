from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utcnow


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    priority = Column(Integer, nullable=False)
    level = Column(String, nullable=False)
    weekly_hours = Column(Float, nullable=False)
    target_weeks = Column(Integer, nullable=False)
    goal = Column(String, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="subjects")
    progress = relationship(
        "SubjectProgress", back_populates="subject", uselist=False, passive_deletes=True
    )
    courses = relationship("Course", back_populates="subject", passive_deletes=True)
    quick_quiz_history = relationship(
        "QuickQuizHistory", back_populates="subject", passive_deletes=True
    )
    schedules = relationship(
        "Schedule", back_populates="related_subject", passive_deletes=True
    )
    notes = relationship("Note", back_populates="subject", passive_deletes=True)


class SubjectProgress(Base):
    __tablename__ = "subject_progress"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject_id = Column(
        String,
        ForeignKey("subjects.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    progress_percentage = Column(Float, default=0.0)
    updated_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User")
    subject = relationship("Subject", back_populates="progress")
