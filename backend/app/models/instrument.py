from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Text, Float, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Exchange(Base):
    __tablename__ = "exchanges"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)  # NSE, BSE, NYSE, NASDAQ
    name = Column(String(100), nullable=False)
    country = Column(String(50), nullable=False)  # India, United States
    currency = Column(String(10), nullable=False)  # INR, USD
    timezone = Column(String(50), nullable=False)  # Asia/Kolkata, America/New_York
    is_active = Column(Boolean, default=True, nullable=False)

    instruments = relationship("Instrument", back_populates="exchange")

class Instrument(Base):
    __tablename__ = "instruments"

    id = Column(Integer, primary_key=True, index=True)
    exchange_id = Column(Integer, ForeignKey("exchanges.id"), nullable=False)
    symbol = Column(String(50), index=True, nullable=False)
    name = Column(String(200), nullable=False)
    isin = Column(String(50), unique=True, nullable=True)
    sector = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    asset_class = Column(String(50), default="EQUITY", nullable=False)  # EQUITY, ETF, INDEX
    currency = Column(String(10), nullable=False)  # INR or USD
    lot_size = Column(Integer, default=1, nullable=False)
    tick_size = Column(Numeric(10, 4), default=0.05, nullable=False)
    current_price = Column(Numeric(14, 4), default=0.0, nullable=False)
    change_pct = Column(Float, default=0.0, nullable=False)
    day_high = Column(Numeric(14, 4), default=0.0, nullable=False)
    day_low = Column(Numeric(14, 4), default=0.0, nullable=False)
    volume_24h = Column(Numeric(18, 0), default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    exchange = relationship("Exchange", back_populates="instruments")
    market_data = relationship("MarketData", back_populates="instrument", cascade="all, delete-orphan")
    financial_metrics = relationship("FinancialMetric", back_populates="instrument", cascade="all, delete-orphan")
    news_articles = relationship("NewsArticle", back_populates="instrument", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_symbol_exchange", "symbol", "exchange_id", unique=True),
    )

class MarketData(Base):
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    instrument_id = Column(Integer, ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), index=True, nullable=False)
    open = Column(Numeric(14, 4), nullable=False)
    high = Column(Numeric(14, 4), nullable=False)
    low = Column(Numeric(14, 4), nullable=False)
    close = Column(Numeric(14, 4), nullable=False)
    volume = Column(Numeric(18, 0), nullable=False)
    vwap = Column(Numeric(14, 4), nullable=True)
    interval = Column(String(10), default="1d", nullable=False)  # 1m, 5m, 15m, 1h, 1d
    data_source = Column(String(50), default="mock", nullable=False)  # mock, twelvedata, alphavantage
    is_delayed = Column(Boolean, default=True, nullable=False)

    instrument = relationship("Instrument", back_populates="market_data")

    __table_args__ = (
        Index("idx_inst_timestamp_interval", "instrument_id", "timestamp", "interval", unique=True),
    )

class FinancialMetric(Base):
    __tablename__ = "financial_metrics"

    id = Column(Integer, primary_key=True, index=True)
    instrument_id = Column(Integer, ForeignKey("instruments.id", ondelete="CASCADE"), nullable=False)
    metric_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    market_cap = Column(Numeric(18, 2), nullable=True)
    pe_ratio = Column(Float, nullable=True)
    pb_ratio = Column(Float, nullable=True)
    eps = Column(Float, nullable=True)
    roe = Column(Float, nullable=True)  # Return on Equity %
    roce = Column(Float, nullable=True)
    debt_to_equity = Column(Float, nullable=True)
    dividend_yield = Column(Float, nullable=True)
    beta = Column(Float, nullable=True)
    week_52_high = Column(Numeric(14, 4), nullable=True)
    week_52_low = Column(Numeric(14, 4), nullable=True)

    instrument = relationship("Instrument", back_populates="financial_metrics")

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    instrument_id = Column(Integer, ForeignKey("instruments.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=True)
    source = Column(String(100), nullable=False)
    url = Column(String(500), nullable=True)
    sentiment_score = Column(Float, default=0.0, nullable=False)  # -1.0 to 1.0
    published_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    instrument = relationship("Instrument", back_populates="news_articles")
