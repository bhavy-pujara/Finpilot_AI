from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TradePlanCalculateRequest(BaseModel):
    instrument_id: int
    side: str = Field("BUY", pattern="^(BUY|SELL)$")
    entry_price: float = Field(..., gt=0)
    target_price: float = Field(..., gt=0)
    stop_loss: float = Field(..., gt=0)
    total_capital: float = Field(..., gt=0)
    risk_pct: float = Field(1.0, gt=0, le=20.0)  # 0.1% to 20% max

class ScenarioOutcome(BaseModel):
    label: str  # e.g., "-1R Stop Loss", "Break-Even", "+1R Target", "+2R Target"
    exit_price: float
    pnl: float
    pnl_pct: float
    account_impact_pct: float

class TradePlanCalculateResponse(BaseModel):
    instrument_id: int
    symbol: str
    currency: str
    side: str
    entry_price: float
    target_price: float
    stop_loss: float
    total_capital: float
    risk_pct: float
    risk_amount: float
    position_size: int
    capital_required: float
    exposure_pct_of_capital: float
    max_loss: float
    max_profit: float
    risk_reward_ratio: float
    stop_loss_pct: float
    target_pct: float
    is_valid: bool
    validation_message: Optional[str] = None
    scenarios: List[ScenarioOutcome] = []
    educational_notes: List[str] = []

class TradePlanSaveRequest(TradePlanCalculateRequest):
    notes: Optional[str] = None

class TradePlanOut(BaseModel):
    id: int
    instrument_id: int
    symbol: str
    currency: str
    side: str
    entry_price: float
    target_price: float
    stop_loss: float
    risk_pct: float
    total_capital: float
    position_size: int
    capital_required: float
    max_loss: float
    max_profit: float
    risk_reward_ratio: float
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
