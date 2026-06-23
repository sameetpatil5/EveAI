from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utcnow


class Note(Base):
    __tablename__ = "notes"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    subject_id = Column(
        String, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=True
    )
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="notes")
    subject = relationship("Subject", back_populates="notes")
