from sqlalchemy import Column, String, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    avg_quiz_score = Column(Float, default=0.0)
    completion_rate = Column(Float, default=0.0)
    study_hours = Column(Float, default=0.0)
    snapshot_date = Column(Date, nullable=False)

    user = relationship("User", back_populates="analytics_snapshots")
