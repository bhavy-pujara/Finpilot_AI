from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ExchangeOut(BaseModel):
    id: int
    code: str
    name: str
    country: str
    currency: str
    timezone: str

    class Config:
        from_attributes = True

class InstrumentOut(BaseModel):
    id: int
    symbol: str
    name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    asset_class: str
    currency: str
    current_price: float
    change_pct: float
    day_high: float
    day_low: float
    volume_24h: float
    exchange_code: str
    data_source_label: str = "SIMULATED / DEMO"

    class Config:
        from_attributes = True

class MarketDataPoint(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    vwap: Optional[float] = None
    is_delayed: bool = True
    data_source: str = "mock"

    class Config:
        from_attributes = True

class FinancialMetricOut(BaseModel):
    metric_date: datetime
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    eps: Optional[float] = None
    roe: Optional[float] = None
    roce: Optional[float] = None
    debt_to_equity: Optional[float] = None
    dividend_yield: Optional[float] = None
    beta: Optional[float] = None
    week_52_high: Optional[float] = None
    week_52_low: Optional[float] = None

    class Config:
        from_attributes = True

class NewsArticleOut(BaseModel):
    id: int
    title: str
    summary: str
    content: Optional[str] = None
    source: str
    url: Optional[str] = None
    sentiment_score: float
    published_at: datetime

    class Config:
        from_attributes = True

class InstrumentDetail(BaseModel):
    instrument: InstrumentOut
    metrics: Optional[FinancialMetricOut] = None
    candles: List[MarketDataPoint] = []
    news: List[NewsArticleOut] = []
    data_freshness: str
    last_updated: datetime

class MarketIndexItem(BaseModel):
    name: str
    symbol: str
    country: str
    currency: str
    price: float
    change_pct: float
    is_open: bool
    status_label: str

class MarketOverviewOut(BaseModel):
    indian_indices: List[MarketIndexItem]
    us_indices: List[MarketIndexItem]
    top_gainers: List[InstrumentOut]
    top_losers: List[InstrumentOut]
    most_active: List[InstrumentOut]
    last_updated: datetime
    data_source_label: str = "SIMULATED / DEMO"
