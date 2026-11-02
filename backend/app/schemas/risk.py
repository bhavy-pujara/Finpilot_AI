from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class RiskProfileOut(BaseModel):
    max_portfolio_risk_pct: float
    max_single_stock_risk_pct: float
    max_sector_exposure_pct: float
    max_drawdown_limit_pct: float
    updated_at: datetime

    class Config:
        from_attributes = True

class RiskProfileUpdate(BaseModel):
    max_portfolio_risk_pct: Optional[float] = Field(None, gt=0, le=20.0)
    max_single_stock_risk_pct: Optional[float] = Field(None, gt=0, le=50.0)
    max_sector_exposure_pct: Optional[float] = Field(None, gt=0, le=100.0)
    max_drawdown_limit_pct: Optional[float] = Field(None, gt=0, le=50.0)

class RiskMetricsOut(BaseModel):
    currency: str
    var_95_daily: float  # Value at Risk 95% 1-day
    var_99_daily: float  # Value at Risk 99% 1-day
    max_drawdown_pct: float
    max_drawdown_duration_days: int
    annualized_volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    beta_vs_benchmark: float
    benchmark_symbol: str
    current_cash_pct: float
    single_stock_max_exposure_pct: float
    single_stock_max_exposure_symbol: str
    risk_warnings: List[str] = []
    compliance_disclaimer: str = "Risk calculations are indicative and deterministic estimates for educational evaluation only. Not investment advice."
