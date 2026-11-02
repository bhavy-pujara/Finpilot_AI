from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Float, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), default="Main Portfolio", nullable=False)
    description = Column(Text, nullable=True)
    is_primary = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="portfolios")
    snapshots = relationship("PortfolioSnapshot", back_populates="portfolio", cascade="all, delete-orphan", order_by="PortfolioSnapshot.snapshot_date")

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    snapshot_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    total_equity = Column(Numeric(14, 4), nullable=False)
    cash = Column(Numeric(14, 4), nullable=False)
    invested_value = Column(Numeric(14, 4), nullable=False)
    daily_return = Column(Float, default=0.0, nullable=False)
    cumulative_return = Column(Float, default=0.0, nullable=False)

    portfolio = relationship("Portfolio", back_populates="snapshots")

class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    max_portfolio_risk_pct = Column(Float, default=2.0, nullable=False)  # max risk per trade
    max_single_stock_risk_pct = Column(Float, default=10.0, nullable=False)  # max single stock concentration
    max_sector_exposure_pct = Column(Float, default=25.0, nullable=False)  # max sector exposure
    max_drawdown_limit_pct = Column(Float, default=15.0, nullable=False)  # alert on drawdown exceed
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="risk_profile")
