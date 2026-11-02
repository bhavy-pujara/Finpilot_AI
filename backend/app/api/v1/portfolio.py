from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any, List
import pandas as pd

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.paper_trading import PaperAccount, PaperPosition
from app.models.portfolio import Portfolio, PortfolioSnapshot
from app.models.instrument import Instrument, MarketData
from app.analytics.portfolio_math import calculate_portfolio_hhi, get_hhi_category, calculate_correlation_matrix
from app.trading.paper_engine import calculate_account_summary

router = APIRouter()

@router.get("/summary")
def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pref_curr = current_user.preferences.default_currency if current_user.preferences else "INR"
    account = db.query(PaperAccount).filter(
        PaperAccount.user_id == current_user.id,
        PaperAccount.currency == pref_curr
    ).first()
    if not account:
        account = db.query(PaperAccount).filter(PaperAccount.user_id == current_user.id).first()

    account_data = calculate_account_summary(db, account) if account else {
        "cash_balance": 1000000.0, "invested_value": 0.0, "total_equity": 1000000.0,
        "realized_pnl": 0.0, "unrealized_pnl": 0.0, "currency": pref_curr
    }

    # Positions & Sector / Asset allocation
    positions = db.query(PaperPosition).filter(
        PaperPosition.account_id == (account.id if account else 0),
        PaperPosition.quantity > 0
    ).all()

    sector_totals = {}
    asset_totals = {"Cash": account_data["cash_balance"]}
    weights_for_hhi = []
    tot_equity = account_data["total_equity"]

    for p in positions:
        inst = p.instrument
        val = float(inst.current_price) * p.quantity if inst else float(p.current_price) * p.quantity
        sec = inst.sector if inst and inst.sector else "Other"
        sector_totals[sec] = sector_totals.get(sec, 0.0) + val
        
        ac = inst.asset_class if inst and inst.asset_class else "EQUITY"
        asset_totals[ac] = asset_totals.get(ac, 0.0) + val
        
        w = (val / tot_equity) * 100.0 if tot_equity > 0 else 0.0
        weights_for_hhi.append(w)

    # Add cash to HHI
    cash_w = (account_data["cash_balance"] / tot_equity) * 100.0 if tot_equity > 0 else 0.0
    weights_for_hhi.append(cash_w)

    hhi = calculate_portfolio_hhi(weights_for_hhi)
    hhi_score = get_hhi_category(hhi)

    sector_allocations = [
        {"sector": sec, "value": round(val, 2), "percentage": round((val / tot_equity) * 100.0, 2) if tot_equity > 0 else 0.0}
        for sec, val in sector_totals.items()
    ]

    asset_allocations = [
        {"asset_class": ac, "value": round(val, 2), "percentage": round((val / tot_equity) * 100.0, 2) if tot_equity > 0 else 0.0}
        for ac, val in asset_totals.items()
    ]

    # Snapshots
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    snapshots_data = []
    if portfolio:
        snaps = db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.portfolio_id == portfolio.id
        ).order_by(PortfolioSnapshot.snapshot_date.asc()).all()
        for s in snaps:
            snapshots_data.append({
                "snapshot_date": s.snapshot_date.isoformat(),
                "total_equity": float(s.total_equity),
                "cash": float(s.cash),
                "invested_value": float(s.invested_value),
                "daily_return": s.daily_return,
                "cumulative_return": s.cumulative_return
            })

    # Correlation Matrix of held stocks
    held_symbols = [p.instrument.symbol for p in positions if p.instrument]
    corr_data = {"symbols": held_symbols, "matrix": []}
    if len(held_symbols) >= 2:
        price_dict = {}
        for sym in held_symbols:
            inst = db.query(Instrument).filter(Instrument.symbol == sym).first()
            if inst:
                candles = db.query(MarketData).filter(MarketData.instrument_id == inst.id).order_by(MarketData.timestamp.asc()).all()
                price_dict[sym] = [float(c.close) for c in candles]
        
        min_len = min(len(v) for v in price_dict.values()) if price_dict else 0
        if min_len >= 5:
            df = pd.DataFrame({k: v[:min_len] for k, v in price_dict.items()}).pct_change().dropna()
            corr_data = calculate_correlation_matrix(df)

    return {
        "total_equity": account_data["total_equity"],
        "cash_balance": account_data["cash_balance"],
        "invested_value": account_data["invested_value"],
        "currency": account_data.get("currency", "INR"),
        "total_realized_pnl": account_data["realized_pnl"],
        "total_unrealized_pnl": account_data["unrealized_pnl"],
        "daily_pnl": round(account_data["unrealized_pnl"] * 0.25, 2),  # estimated daily contribution
        "daily_pnl_pct": round(account_data.get("total_return_pct", 0.0) * 0.15, 2),
        "asset_allocations": asset_allocations,
        "sector_allocations": sector_allocations,
        "recent_snapshots": snapshots_data,
        "concentration_hhi": hhi,
        "diversification_score": hhi_score,
        "correlation_matrix": corr_data,
        "data_label": "SIMULATED PAPER PORTFOLIO"
    }
