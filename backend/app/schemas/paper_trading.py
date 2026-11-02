from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PaperOrderCreate(BaseModel):
    instrument_id: int
    side: str = Field(..., pattern="^(BUY|SELL)$")
    order_type: str = Field("MARKET", pattern="^(MARKET|LIMIT|STOP_MARKET|STOP_LIMIT)$")
    price: Optional[float] = Field(None, gt=0)
    trigger_price: Optional[float] = Field(None, gt=0)
    quantity: int = Field(..., gt=0)

class PaperOrderEventOut(BaseModel):
    event_type: str
    details: Optional[dict] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class PaperOrderOut(BaseModel):
    id: int
    account_id: int
    instrument_id: int
    symbol: str
    side: str
    order_type: str
    price: Optional[float] = None
    trigger_price: Optional[float] = None
    quantity: int
    filled_quantity: int
    execution_price: Optional[float] = None
    slippage: float
    commission: float
    status: str
    rejection_reason: Optional[str] = None
    simulation_label: str = "PAPER TRADE"
    created_at: datetime
    executed_at: Optional[datetime] = None
    events: List[PaperOrderEventOut] = []

    class Config:
        from_attributes = True

class PaperPositionOut(BaseModel):
    id: int
    instrument_id: int
    symbol: str
    name: str
    currency: str
    side: str
    quantity: int
    average_entry_price: float
    current_price: float
    invested_amount: float
    current_value: float
    unrealized_pnl: float
    unrealized_pnl_pct: float
    simulation_label: str = "PAPER POSITION"
    updated_at: datetime

    class Config:
        from_attributes = True

class PaperAccountOut(BaseModel):
    id: int
    account_number: str
    currency: str
    initial_balance: float
    cash_balance: float
    invested_value: float
    total_equity: float
    realized_pnl: float
    unrealized_pnl: float
    total_pnl: float
    total_return_pct: float
    open_positions_count: int
    simulation_label: str = "SIMULATED PAPER ACCOUNT"
    created_at: datetime

class PaperTransactionOut(BaseModel):
    id: int
    order_id: Optional[int]
    instrument_id: int
    symbol: str
    side: str
    quantity: int
    price: float
    fee: float
    realized_pnl: float
    timestamp: datetime

    class Config:
        from_attributes = True
