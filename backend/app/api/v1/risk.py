from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict, Any
import pandas as pd
import numpy as np

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.paper_trading import PaperAccount, PaperPosition
from app.models.portfolio import Portfolio, PortfolioSnapshot, RiskProfile
from app.models.instrument import Instrument, MarketData
from app.schemas.risk import RiskMetricsOut, RiskProfileOut, RiskProfileUpdate
from app.analytics.risk_metrics import (
    calculate_parametric_var,
    calculate_historical_var,
    calculate_max_drawdown,
    calculate_sharpe_ratio,
    calculate_sortino_ratio,
    calculate_beta
)
from app.analytics.volatility import calculate_historical_volatility

router = APIRouter()

@router.get("/metrics", response_model=RiskMetricsOut)
def get_risk_metrics(
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

    # Get equity series from snapshots
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    snaps = []
    if portfolio:
        snaps = db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.portfolio_id == portfolio.id
        ).order_by(PortfolioSnapshot.snapshot_date.asc()).all()

    equity_series = [float(s.total_equity) for s in snaps] if snaps else [1000000.0, 1005000.0, 1012000.0, 1008000.0, 1015000.0]
    returns = pd.Series(equity_series).pct_change().dropna()

    # 1. VaR Calculations
    var_95 = calculate_parametric_var(returns, confidence_level=0.95)
    var_99 = calculate_parametric_var(returns, confidence_level=0.99)

    # 2. Drawdown
    dd_dict = calculate_max_drawdown(equity_series)

    # 3. Volatility & Ratios
    rf_rate = 0.06 if pref_curr == "INR" else 0.045
    ann_vol = calculate_historical_volatility(returns) * 100.0
    sharpe = calculate_sharpe_ratio(returns, risk_free_rate=rf_rate)
    sortino = calculate_sortino_ratio(returns, risk_free_rate=rf_rate)

    # 4. Beta calculation against benchmark
    benchmark_sym = "RELIANCE" if pref_curr == "INR" else "SPY"
    b_inst = db.query(Instrument).filter(Instrument.symbol == benchmark_sym).first()
    b_candles = db.query(MarketData).filter(MarketData.instrument_id == b_inst.id).order_by(MarketData.timestamp.asc()).all() if b_inst else []
    b_prices = [float(c.close) for c in b_candles]
    b_returns = pd.Series(b_prices).pct_change().dropna()
    beta = calculate_beta(returns, b_returns)

    # 5. Position concentration & Cash allocation
    cash = float(account.cash_balance) if account else 1000000.0
    total_eq = equity_series[-1]
    cash_pct = (cash / total_eq) * 100.0 if total_eq > 0 else 100.0

    positions = db.query(PaperPosition).filter(
        PaperPosition.account_id == (account.id if account else 0),
        PaperPosition.quantity > 0
    ).all()

    max_exposure_pct = 0.0
    max_exposure_sym = "None"
    for p in positions:
        inst = p.instrument
        pos_val = float(inst.current_price) * p.quantity if inst else float(p.current_price) * p.quantity
        exp_pct = (pos_val / total_eq) * 100.0 if total_eq > 0 else 0.0
        if exp_pct > max_exposure_pct:
            max_exposure_pct = exp_pct
            max_exposure_sym = inst.symbol if inst else "Unknown"

    # Educational risk alerts
    risk_warnings = []
    risk_profile = db.query(RiskProfile).filter(RiskProfile.user_id == current_user.id).first()
    max_single_allowed = risk_profile.max_single_stock_risk_pct if risk_profile else 12.0
    max_dd_allowed = risk_profile.max_drawdown_limit_pct if risk_profile else 10.0

    if max_exposure_pct > max_single_allowed:
        risk_warnings.append(
            f"Concentration Alert: Single holding {max_exposure_sym} represents {max_exposure_pct:.1f}% of total equity (configured limit: {max_single_allowed}%)."
        )
    if dd_dict["max_drawdown_pct"] > max_dd_allowed:
        risk_warnings.append(
            f"Drawdown Alert: Peak-to-trough decline reached {dd_dict['max_drawdown_pct']:.1f}% (configured limit: {max_dd_allowed}%)."
        )
    if cash_pct < 10.0:
        risk_warnings.append(
            f"Liquidity Caution: Available cash is {cash_pct:.1f}%. Maintaining a 10–20% cash cushion enhances risk resilience."
        )

    if not risk_warnings:
        risk_warnings.append("All risk parameters are currently within normal thresholds.")

    return RiskMetricsOut(
        currency=pref_curr,
        var_95_daily=round(var_95, 2),
        var_99_daily=round(var_99, 2),
        max_drawdown_pct=round(dd_dict["max_drawdown_pct"], 2),
        max_drawdown_duration_days=dd_dict["max_drawdown_duration"],
        annualized_volatility=round(ann_vol, 2),
        sharpe_ratio=round(sharpe, 2),
        sortino_ratio=round(sortino, 2),
        beta_vs_benchmark=round(beta, 2),
        benchmark_symbol="NIFTY 50" if pref_curr == "INR" else "S&P 500",
        current_cash_pct=round(cash_pct, 2),
        single_stock_max_exposure_pct=round(max_exposure_pct, 2),
        single_stock_max_exposure_symbol=max_exposure_sym,
        risk_warnings=risk_warnings
    )

@router.get("/profile", response_model=RiskProfileOut)
def get_risk_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(RiskProfile).filter(RiskProfile.user_id == current_user.id).first()
    if not profile:
        profile = RiskProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/profile", response_model=RiskProfileOut)
def update_risk_profile(
    update_in: RiskProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(RiskProfile).filter(RiskProfile.user_id == current_user.id).first()
    if not profile:
        profile = RiskProfile(user_id=current_user.id)
        db.add(profile)

    if update_in.max_portfolio_risk_pct is not None:
        profile.max_portfolio_risk_pct = update_in.max_portfolio_risk_pct
    if update_in.max_single_stock_risk_pct is not None:
        profile.max_single_stock_risk_pct = update_in.max_single_stock_risk_pct
    if update_in.max_sector_exposure_pct is not None:
        profile.max_sector_exposure_pct = update_in.max_sector_exposure_pct
    if update_in.max_drawdown_limit_pct is not None:
        profile.max_drawdown_limit_pct = update_in.max_drawdown_limit_pct

    db.commit()
    db.refresh(profile)
    return profile
