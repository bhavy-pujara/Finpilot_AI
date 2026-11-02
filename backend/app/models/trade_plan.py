from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Float, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class TradePlan(Base):
    __tablename__ = "trade_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    instrument_id = Column(Integer, ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    side = Column(String(10), default="BUY", nullable=False)  # BUY or SELL
    entry_price = Column(Numeric(14, 4), nullable=False)
    target_price = Column(Numeric(14, 4), nullable=False)
    stop_loss = Column(Numeric(14, 4), nullable=False)
    risk_pct = Column(Float, default=1.0, nullable=False)  # % of total capital
    total_capital = Column(Numeric(14, 4), nullable=False)
    position_size = Column(Integer, nullable=False)  # Number of shares/units
    capital_required = Column(Numeric(14, 4), nullable=False)
    max_loss = Column(Numeric(14, 4), nullable=False)
    max_profit = Column(Numeric(14, 4), nullable=False)
    risk_reward_ratio = Column(Float, nullable=False)
    stop_loss_pct = Column(Float, nullable=False)
    target_pct = Column(Float, nullable=False)
    scenario_matrix = Column(JSON, nullable=True)  # Scenarios at -2R, -1R, +1R, +2R, +3R
    status = Column(String(20), default="DRAFT", nullable=False)  # DRAFT, EXECUTED, CANCELLED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="trade_plans")
    instrument = relationship("Instrument")
