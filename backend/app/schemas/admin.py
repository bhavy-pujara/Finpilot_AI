from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class SystemHealthOut(BaseModel):
    status: str
    environment: str
    database_connected: bool
    database_type: str
    redis_connected: bool
    active_ai_provider: str
    active_market_provider: str
    uptime_seconds: float
    timestamp: datetime

class AdminStatsOut(BaseModel):
    total_users: int
    active_users: int
    total_paper_orders: int
    total_paper_positions: int
    total_trade_plans: int
    total_ai_tokens_consumed: int
    total_ai_estimated_cost_usd: float
    total_audit_events: int
    system_health: SystemHealthOut
