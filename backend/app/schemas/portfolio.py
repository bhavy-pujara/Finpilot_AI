from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class AssetAllocationItem(BaseModel):
    asset_class: str
    value: float
    percentage: float

class SectorAllocationItem(BaseModel):
    sector: str
    value: float
    percentage: float

class SnapshotOut(BaseModel):
    snapshot_date: datetime
    total_equity: float
    cash: float
    invested_value: float
    daily_return: float
    cumulative_return: float

    class Config:
        from_attributes = True

class CorrelationMatrixOut(BaseModel):
    symbols: List[str]
    matrix: List[List[float]]

class PortfolioSummaryOut(BaseModel):
    total_equity: float
    cash_balance: float
    invested_value: float
    currency: str
    total_realized_pnl: float
    total_unrealized_pnl: float
    daily_pnl: float
    daily_pnl_pct: float
    asset_allocations: List[AssetAllocationItem] = []
    sector_allocations: List[SectorAllocationItem] = []
    recent_snapshots: List[SnapshotOut] = []
    concentration_hhi: float
    diversification_score: str  # Excellent, Good, Moderate, High Concentration
    data_label: str = "SIMULATED PAPER PORTFOLIO"
