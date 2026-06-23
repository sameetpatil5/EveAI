from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utcnow


class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, default=generate_uuid)
    subject_id = Column(
        String, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    total_modules = Column(Integer, default=0)
    estimated_weeks = Column(Integer, nullable=True)
    generation_status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), default=utcnow)

    subject = relationship("Subject", back_populates="courses")
    modules = relationship("Module", back_populates="course", passive_deletes=True)


class Module(Base):
    __tablename__ = "modules"

    id = Column(String, primary_key=True, default=generate_uuid)
    course_id = Column(
        String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    module_order = Column(Integer, nullable=False)
    is_locked = Column(Boolean, default=True)

    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", passive_deletes=True)
