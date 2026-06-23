from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utcnow


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    hobbies = relationship("UserHobby", back_populates="user")
    subjects = relationship("Subject", back_populates="user")
    lesson_progress = relationship("LessonProgress", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    quick_quiz_history = relationship("QuickQuizHistory", back_populates="user")
    schedules = relationship("Schedule", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")
    notes = relationship("Note", back_populates="user")
    analytics_snapshots = relationship("AnalyticsSnapshot", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    academic_level = Column(String, nullable=True)
    major = Column(String, nullable=True)
    available_time_slots = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="profile")


class Hobby(Base):
    __tablename__ = "hobbies"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)

    user_hobbies = relationship("UserHobby", back_populates="hobby")


class UserHobby(Base):
    __tablename__ = "user_hobbies"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    hobby_id = Column(String, ForeignKey("hobbies.id"), primary_key=True)

    user = relationship("User", back_populates="hobbies")
    hobby = relationship("Hobby", back_populates="user_hobbies")
