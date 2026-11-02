from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BrokerConsentRequest(BaseModel):
    broker_name: str  # ZERODHA, ANGEL_ONE, ALPACA
    mock_api_key: Optional[str] = None
    agree_to_simulation_terms: bool = True

class BrokerConnectionOut(BaseModel):
    id: int
    broker_name: str
    mock_account_id: str
    status: str
    permission_mode: str
    live_orders_prohibited: bool
    last_synced_at: datetime
    compliance_notice: str = "This connection operates strictly in simulated/mock mode. Real broker order submission is permanently disabled."

    class Config:
        from_attributes = True

class BrokerQuoteSimulated(BaseModel):
    symbol: str
    broker: str
    bid: float
    ask: float
    simulated_slippage_estimate: float
    brokerage_fee_estimate: float
    currency: str
