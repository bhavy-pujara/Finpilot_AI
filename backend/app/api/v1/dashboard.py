from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.instrument import Instrument
from app.models.paper_trading import PaperAccount
from app.trading.paper_engine import calculate_account_summary

router = APIRouter()

@router.get("/overview")
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    
    # 1. Market Indices
    indian_indices = [
        {"name": "NIFTY 50", "symbol": "NIFTY50", "country": "India", "currency": "INR", "price": 24340.50, "change_pct": 0.42, "is_open": False, "status_label": "Closed"},
        {"name": "BSE SENSEX", "symbol": "SENSEX", "country": "India", "currency": "INR", "price": 79942.20, "change_pct": 0.38, "is_open": False, "status_label": "Closed"},
    ]
    us_indices = [
        {"name": "S&P 500", "symbol": "SPX", "country": "United States", "currency": "USD", "price": 5824.10, "change_pct": 0.65, "is_open": False, "status_label": "Closed"},
        {"name": "NASDAQ 100", "symbol": "NDX", "country": "United States", "currency": "USD", "price": 20410.80, "change_pct": 0.88, "is_open": False, "status_label": "Closed"},
    ]

    # 2. Instruments
    all_instruments = db.query(Instrument).filter(Instrument.is_active == True).all()
    inst_dicts = []
    for inst in all_instruments:
        inst_dicts.append({
            "id": inst.id,
            "symbol": inst.symbol,
            "name": inst.name,
            "sector": inst.sector,
            "currency": inst.currency,
            "current_price": float(inst.current_price),
            "change_pct": float(inst.change_pct),
            "day_high": float(inst.day_high),
            "day_low": float(inst.day_low),
            "volume_24h": float(inst.volume_24h),
            "exchange_code": inst.exchange.code if inst.exchange else "NSE",
            "data_source_label": "SIMULATED / DEMO"
        })

    # Sort gainers and losers
    sorted_by_change = sorted(inst_dicts, key=lambda x: x["change_pct"], reverse=True)
    top_gainers = sorted_by_change[:4]
    top_losers = sorted_by_change[-4:][::-1]

    # 3. Paper account summary
    default_curr = current_user.preferences.default_currency if current_user.preferences else "INR"
    paper_acc = db.query(PaperAccount).filter(
        PaperAccount.user_id == current_user.id,
        PaperAccount.currency == default_curr
    ).first()
    
    if not paper_acc:
        paper_acc = db.query(PaperAccount).filter(PaperAccount.user_id == current_user.id).first()

    paper_summary = None
    if paper_acc:
        paper_summary = calculate_account_summary(db, paper_acc)

    return {
        "indian_indices": indian_indices,
        "us_indices": us_indices,
        "top_gainers": top_gainers,
        "top_losers": top_losers,
        "all_instruments": inst_dicts,
        "paper_account": paper_summary,
        "last_updated": now.isoformat(),
        "data_source_label": "SIMULATED / DEMO DATA"
    }
