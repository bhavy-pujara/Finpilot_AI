from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class TradingJournalEntry(Base):
    __tablename__ = "trading_journals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    instrument_id = Column(Integer, ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    trade_plan_id = Column(Integer, ForeignKey("trade_plans.id", ondelete="SET NULL"), nullable=True)
    paper_order_id = Column(Integer, ForeignKey("paper_orders.id", ondelete="SET NULL"), nullable=True)
    
    trade_type = Column(String(20), default="PAPER", nullable=False)  # PAPER or MANUAL
    side = Column(String(10), default="BUY", nullable=False)
    entry_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    exit_date = Column(DateTime(timezone=True), nullable=True)
    entry_price = Column(Numeric(14, 4), nullable=False)
    exit_price = Column(Numeric(14, 4), nullable=True)
    quantity = Column(Integer, nullable=False)
    realized_pnl = Column(Numeric(14, 4), default=0.0, nullable=False)
    
    strategy_tag = Column(String(100), default="Breakout", nullable=False)  # Breakout, Trend Following, Mean Reversion, etc.
    emotional_state = Column(String(50), default="Disciplined", nullable=False)  # Disciplined, FOMO, Anxious, Greedy
    rationale = Column(Text, nullable=False)
    mistakes = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    rating = Column(Integer, default=5, nullable=False)  # 1 to 5 stars execution rating
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="journal_entries")
    instrument = relationship("Instrument")
