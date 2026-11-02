from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="SYSTEM", nullable=False)  # ORDER, RISK, RESEARCH, PRICE, SYSTEM
    is_read = Column(Boolean, default=False, nullable=False)
    data_source_label = Column(String(50), default="SIMULATED", nullable=False)  # LIVE, DELAYED, SIMULATED
    action_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True, nullable=False)

    user = relationship("User", back_populates="notifications")
