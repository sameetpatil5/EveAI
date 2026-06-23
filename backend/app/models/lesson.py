from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    DateTime,
    JSON,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utcnow


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String, primary_key=True, default=generate_uuid)
    module_id = Column(
        String, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String, nullable=False)
    lesson_order = Column(Integer, nullable=False)
    content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    references = Column(JSON, nullable=True)
    youtube_links = Column(JSON, nullable=True)
    hobby_explanation = Column(Text, nullable=True)
    generation_status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), default=utcnow)

    module = relationship("Module", back_populates="lessons")
    progress = relationship("LessonProgress", back_populates="lesson", uselist=False)
    chat_sessions = relationship("ChatSession", back_populates="lesson")
    schedules = relationship("Schedule", back_populates="related_lesson")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(String, ForeignKey("lessons.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress")
