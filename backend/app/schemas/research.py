from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResearchReportRequest(BaseModel):
    instrument_id: int

class ResearchSourceOut(BaseModel):
    title: str
    url: Optional[str] = None
    source_type: str
    timestamp_retrieved: datetime
    confidence_score: float

    class Config:
        from_attributes = True

class ResearchReportOut(BaseModel):
    id: int
    instrument_id: int
    symbol: str
    name: str
    title: str
    company_overview: str
    business_model: str
    bull_thesis: List[str]
    bear_thesis: List[str]
    risk_factors: List[str]
    financial_analysis: str
    technical_summary: str
    data_quality_warnings: List[str] = []
    metrics_snapshot: Optional[Dict[str, Any]] = None
    sources: List[ResearchSourceOut] = []
    generated_at: datetime
    data_freshness_label: str = "HISTORICAL / DEMO"

    class Config:
        from_attributes = True
