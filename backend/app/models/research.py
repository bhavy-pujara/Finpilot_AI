from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(Integer, primary_key=True, index=True)
    instrument_id = Column(Integer, ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    company_overview = Column(Text, nullable=False)
    business_model = Column(Text, nullable=False)
    bull_thesis = Column(JSON, nullable=False)  # List of bullish points
    bear_thesis = Column(JSON, nullable=False)  # List of bearish points
    risk_factors = Column(JSON, nullable=False)  # List of specific risks
    financial_analysis = Column(Text, nullable=False)
    technical_summary = Column(Text, nullable=False)
    data_quality_warnings = Column(JSON, nullable=True)  # Warnings about stale or missing data
    metrics_snapshot = Column(JSON, nullable=True)  # Verified snapshot of P/E, EPS, etc.
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    instrument = relationship("Instrument")
    user = relationship("User")
    sources = relationship("ResearchSource", back_populates="report", cascade="all, delete-orphan")

class ResearchSource(Base):
    __tablename__ = "research_sources"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("research_reports.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    url = Column(String(500), nullable=True)
    source_type = Column(String(50), default="financial_filing", nullable=False)  # financial_filing, exchange_data, news
    timestamp_retrieved = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    confidence_score = Column(Float, default=1.0, nullable=False)

    report = relationship("ResearchReport", back_populates="sources")
