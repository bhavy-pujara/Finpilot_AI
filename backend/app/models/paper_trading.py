from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Float, JSON, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class PaperAccount(Base):
    __tablename__ = "paper_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    account_number = Column(String(50), unique=True, index=True, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)  # INR or USD
    initial_balance = Column(Numeric(14, 4), default=1000000.00, nullable=False)
    cash_balance = Column(Numeric(14, 4), default=1000000.00, nullable=False)
    realized_pnl = Column(Numeric(14, 4), default=0.00, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="paper_accounts")
    orders = relationship("PaperOrder", back_populates="account", cascade="all, delete-orphan")
    positions = relationship("PaperPosition", back_populates="account", cascade="all, delete-orphan")
    transactions = relationship("PaperTransaction", back_populates="account", cascade="all, delete-orphan")

class PaperOrder(Base):
    __tablename__ = "paper_orders"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("paper_accounts.id", ondelete="CASCADE"), nullable=False)
    instrument_id = Column(Integer, ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    side = Column(String(10), nullable=False)  # BUY or SELL
    order_type = Column(String(20), nullable=False)  # MARKET, LIMIT, STOP_MARKET, STOP_LIMIT
    price = Column(Numeric(14, 4), nullable=True)  # Limit price
    trigger_price = Column(Numeric(14, 4), nullable=True)  # Stop trigger price
    quantity = Column(Integer, nullable=False)
    filled_quantity = Column(Integer, default=0, nullable=False)
    execution_price = Column(Numeric(14, 4), nullable=True)
    slippage = Column(Numeric(10, 4), default=0.0, nullable=False)
    commission = Column(Numeric(10, 4), default=0.0, nullable=False)
    status = Column(String(20), default="PENDING", nullable=False)  # PENDING, FILLED, REJECTED, CANCELLED
    rejection_reason = Column(String(255), nullable=True)
    simulation_label = Column(String(50), default="PAPER TRADE", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    executed_at = Column(DateTime(timezone=True), nullable=True)

    account = relationship("PaperAccount", back_populates="orders")
    instrument = relationship("Instrument")
    events = relationship("PaperOrderEvent", back_populates="order", cascade="all, delete-orphan")

class PaperOrderEvent(Base):
    __tablename__ = "paper_order_events"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("paper_orders.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)  # CREATED, VALIDATED, MATCHED, EXECUTED, REJECTED, CANCELLED
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("PaperOrder", back_populates="events")

class PaperPosition(Base):
    __tablename__ = "paper_positions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("paper_accounts.id", ondelete="CASCADE"), nullable=False)
    instrument_id = Column(Integer, ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    side = Column(String(10), default="LONG", nullable=False)  # LONG or SHORT
    quantity = Column(Integer, default=0, nullable=False)
    average_entry_price = Column(Numeric(14, 4), default=0.0, nullable=False)
    current_price = Column(Numeric(14, 4), default=0.0, nullable=False)
    unrealized_pnl = Column(Numeric(14, 4), default=0.0, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    account = relationship("PaperAccount", back_populates="positions")
    instrument = relationship("Instrument")

    __table_args__ = (
        Index("idx_account_instrument_pos", "account_id", "instrument_id", unique=True),
    )

class PaperTransaction(Base):
    __tablename__ = "paper_transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("paper_accounts.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(Integer, ForeignKey("paper_orders.id", ondelete="SET NULL"), nullable=True)
    instrument_id = Column(Integer, ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    side = Column(String(10), nullable=False)  # BUY or SELL
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(14, 4), nullable=False)
    fee = Column(Numeric(10, 4), default=0.0, nullable=False)
    realized_pnl = Column(Numeric(14, 4), default=0.0, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    account = relationship("PaperAccount", back_populates="transactions")
    instrument = relationship("Instrument")
