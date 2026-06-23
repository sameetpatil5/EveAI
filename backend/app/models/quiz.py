from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Text,
    DateTime,
    JSON,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utcnow


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=generate_uuid)
    module_id = Column(String, ForeignKey("modules.id", ondelete="CASCADE"), nullable=True)
    title = Column(String, nullable=False)
    passing_score = Column(Integer, default=70)

    questions = relationship("QuizQuestion", back_populates="quiz")
    attempts = relationship("QuizAttempt", back_populates="quiz")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    quiz_id = Column(String, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)
    options = Column(JSON, nullable=True)
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)

    quiz = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    quiz_id = Column(String, ForeignKey("quizzes.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    attempt_number = Column(Integer, default=1)
    feedback = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=utcnow)

    quiz = relationship("Quiz", back_populates="attempts")
    user = relationship("User", back_populates="quiz_attempts")


class QuickQuizHistory(Base):
    __tablename__ = "quick_quiz_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject_id = Column(
        String, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False
    )
    difficulty = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="quick_quiz_history")
    subject = relationship("Subject", back_populates="quick_quiz_history")
