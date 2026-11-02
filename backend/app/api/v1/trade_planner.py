from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.instrument import Instrument
from app.models.trade_plan import TradePlan
from app.schemas.trade_planner import (
    TradePlanCalculateRequest,
    TradePlanCalculateResponse,
    TradePlanSaveRequest,
    TradePlanOut
)
from app.analytics.position_sizing import calculate_fixed_fractional_position_size

router = APIRouter()

@router.post("/calculate", response_model=TradePlanCalculateResponse)
def calculate_trade_plan(
    req: TradePlanCalculateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inst = db.query(Instrument).filter(Instrument.id == req.instrument_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found.")

    res = calculate_fixed_fractional_position_size(
        entry_price=req.entry_price,
        stop_loss=req.stop_loss,
        target_price=req.target_price,
        total_capital=req.total_capital,
        risk_pct=req.risk_pct,
        side=req.side
    )

    if not res["is_valid"]:
        return TradePlanCalculateResponse(
            instrument_id=inst.id,
            symbol=inst.symbol,
            currency=inst.currency,
            side=req.side,
            entry_price=req.entry_price,
            target_price=req.target_price,
            stop_loss=req.stop_loss,
            total_capital=req.total_capital,
            risk_pct=req.risk_pct,
            risk_amount=res.get("risk_amount", 0.0),
            position_size=0,
            capital_required=0.0,
            exposure_pct_of_capital=0.0,
            max_loss=0.0,
            max_profit=0.0,
            risk_reward_ratio=0.0,
            stop_loss_pct=res.get("stop_loss_pct", 0.0),
            target_pct=res.get("target_pct", 0.0),
            is_valid=False,
            validation_message=res["validation_message"],
            scenarios=[],
            educational_notes=res.get("educational_notes", [])
        )

    return TradePlanCalculateResponse(
        instrument_id=inst.id,
        symbol=inst.symbol,
        currency=inst.currency,
        side=req.side,
        entry_price=req.entry_price,
        target_price=req.target_price,
        stop_loss=req.stop_loss,
        total_capital=req.total_capital,
        risk_pct=req.risk_pct,
        risk_amount=res["risk_amount"],
        position_size=res["position_size"],
        capital_required=res["capital_required"],
        exposure_pct_of_capital=res["exposure_pct"],
        max_loss=res["max_loss"],
        max_profit=res["max_profit"],
        risk_reward_ratio=res["risk_reward_ratio"],
        stop_loss_pct=res["stop_loss_pct"],
        target_pct=res["target_pct"],
        is_valid=True,
        validation_message="Trade plan calculated successfully.",
        scenarios=res["scenarios"],
        educational_notes=res["educational_notes"]
    )

@router.post("/save", response_model=TradePlanOut, status_code=status.HTTP_201_CREATED)
def save_trade_plan(
    req: TradePlanSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inst = db.query(Instrument).filter(Instrument.id == req.instrument_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found.")

    res = calculate_fixed_fractional_position_size(
        entry_price=req.entry_price,
        stop_loss=req.stop_loss,
        target_price=req.target_price,
        total_capital=req.total_capital,
        risk_pct=req.risk_pct,
        side=req.side
    )

    if not res["is_valid"]:
        raise HTTPException(status_code=400, detail=res["validation_message"])

    plan = TradePlan(
        user_id=current_user.id,
        instrument_id=inst.id,
        side=req.side,
        entry_price=req.entry_price,
        target_price=req.target_price,
        stop_loss=req.stop_loss,
        risk_pct=req.risk_pct,
        total_capital=req.total_capital,
        position_size=res["position_size"],
        capital_required=res["capital_required"],
        max_loss=res["max_loss"],
        max_profit=res["max_profit"],
        risk_reward_ratio=res["risk_reward_ratio"],
        stop_loss_pct=res["stop_loss_pct"],
        target_pct=res["target_pct"],
        scenario_matrix=res["scenarios"],
        status="DRAFT",
        notes=req.notes
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return TradePlanOut(
        id=plan.id,
        instrument_id=plan.instrument_id,
        symbol=inst.symbol,
        currency=inst.currency,
        side=plan.side,
        entry_price=float(plan.entry_price),
        target_price=float(plan.target_price),
        stop_loss=float(plan.stop_loss),
        risk_pct=plan.risk_pct,
        total_capital=float(plan.total_capital),
        position_size=plan.position_size,
        capital_required=float(plan.capital_required),
        max_loss=float(plan.max_loss),
        max_profit=float(plan.max_profit),
        risk_reward_ratio=plan.risk_reward_ratio,
        status=plan.status,
        notes=plan.notes,
        created_at=plan.created_at
    )

@router.get("/", response_model=List[TradePlanOut])
def list_trade_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plans = db.query(TradePlan).filter(
        TradePlan.user_id == current_user.id
    ).order_by(TradePlan.created_at.desc()).all()

    results = []
    for p in plans:
        inst = p.instrument
        results.append(TradePlanOut(
            id=p.id,
            instrument_id=p.instrument_id,
            symbol=inst.symbol if inst else "",
            currency=inst.currency if inst else "INR",
            side=p.side,
            entry_price=float(p.entry_price),
            target_price=float(p.target_price),
            stop_loss=float(p.stop_loss),
            risk_pct=p.risk_pct,
            total_capital=float(p.total_capital),
            position_size=p.position_size,
            capital_required=float(p.capital_required),
            max_loss=float(p.max_loss),
            max_profit=float(p.max_profit),
            risk_reward_ratio=p.risk_reward_ratio,
            status=p.status,
            notes=p.notes,
            created_at=p.created_at
        ))
    return results
