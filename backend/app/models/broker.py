from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class BrokerConnection(Base):
    __tablename__ = "broker_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    broker_name = Column(String(50), nullable=False)  # ZERODHA, ANGEL_ONE, ALPACA
    mock_account_id = Column(String(100), nullable=False)
    status = Column(String(50), default="MOCK_CONNECTED", nullable=False)  # MOCK_CONNECTED, DISCONNECTED, ERROR
    permission_mode = Column(String(50), default="READ_ONLY", nullable=False)  # READ_ONLY, SIMULATED_EXECUTION
    consent_recorded = Column(Boolean, default=True, nullable=False)
    consent_timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    live_orders_prohibited = Column(Boolean, default=True, nullable=False)  # Strictly True for compliance
    last_synced_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="broker_connections")
