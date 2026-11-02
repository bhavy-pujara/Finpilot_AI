from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class JournalEntryCreate(BaseModel):
    instrument_id: int
    trade_plan_id: Optional[int] = None
    paper_order_id: Optional[int] = None
    trade_type: str = Field("PAPER", pattern="^(PAPER|MANUAL)$")
    side: str = Field("BUY", pattern="^(BUY|SELL)$")
    entry_date: datetime
    exit_date: Optional[datetime] = None
    entry_price: float = Field(..., gt=0)
    exit_price: Optional[float] = None
    quantity: int = Field(..., gt=0)
    strategy_tag: str = "Breakout"
    emotional_state: str = "Disciplined"
    rationale: str
    mistakes: Optional[str] = None
    lessons_learned: Optional[str] = None
    rating: int = Field(5, ge=1, le=5)

class JournalEntryUpdate(BaseModel):
    exit_date: Optional[datetime] = None
    exit_price: Optional[float] = None
    strategy_tag: Optional[str] = None
    emotional_state: Optional[str] = None
    rationale: Optional[str] = None
    mistakes: Optional[str] = None
    lessons_learned: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)

class JournalEntryOut(BaseModel):
    id: int
    instrument_id: int
    symbol: str
    trade_type: str
    side: str
    entry_date: datetime
    exit_date: Optional[datetime] = None
    entry_price: float
    exit_price: Optional[float] = None
    quantity: int
    realized_pnl: float
    strategy_tag: str
    emotional_state: str
    rationale: str
    mistakes: Optional[str] = None
    lessons_learned: Optional[str] = None
    rating: int
    created_at: datetime

    class Config:
        from_attributes = True

class StrategyPerformance(BaseModel):
    strategy: str
    trade_count: int
    win_rate: float
    net_pnl: float

class JournalAnalyticsOut(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_pct: float
    profit_factor: float
    average_win: float
    average_loss: float
    expectancy: float
    strategy_breakdown: List[StrategyPerformance] = []
