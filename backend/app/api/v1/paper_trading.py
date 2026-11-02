from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.instrument import Instrument
from app.models.paper_trading import PaperAccount, PaperOrder, PaperPosition, PaperTransaction
from app.schemas.paper_trading import (
    PaperOrderCreate,
    PaperOrderOut,
    PaperPositionOut,
    PaperAccountOut,
    PaperTransactionOut
)
from app.trading.paper_engine import (
    get_or_create_paper_account,
    execute_paper_order,
    calculate_account_summary
)

router = APIRouter()

@router.get("/account", response_model=PaperAccountOut)
def get_paper_account(
    currency: Optional[str] = "INR",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = get_or_create_paper_account(db, current_user.id, currency=currency)
    summary = calculate_account_summary(db, account)
    return PaperAccountOut(**summary)

@router.post("/orders", response_model=PaperOrderOut, status_code=status.HTTP_201_CREATED)
def submit_paper_order(
    order_in: PaperOrderCreate,
    currency: Optional[str] = "INR",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inst = db.query(Instrument).filter(Instrument.id == order_in.instrument_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found.")

    # Match currency
    target_currency = inst.currency or currency
    account = get_or_create_paper_account(db, current_user.id, currency=target_currency)

    order, was_filled = execute_paper_order(
        db=db,
        account=account,
        instrument=inst,
        side=order_in.side,
        order_type=order_in.order_type,
        quantity=order_in.quantity,
        price=order_in.price,
        trigger_price=order_in.trigger_price
    )

    events_out = [
        {"event_type": e.event_type, "details": e.details, "timestamp": e.timestamp}
        for e in order.events
    ]

    return PaperOrderOut(
        id=order.id,
        account_id=order.account_id,
        instrument_id=order.instrument_id,
        symbol=inst.symbol,
        side=order.side,
        order_type=order.order_type,
        price=float(order.price) if order.price else None,
        trigger_price=float(order.trigger_price) if order.trigger_price else None,
        quantity=order.quantity,
        filled_quantity=order.filled_quantity,
        execution_price=float(order.execution_price) if order.execution_price else None,
        slippage=float(order.slippage),
        commission=float(order.commission),
        status=order.status,
        rejection_reason=order.rejection_reason,
        simulation_label="PAPER TRADE",
        created_at=order.created_at,
        executed_at=order.executed_at,
        events=events_out
    )

@router.delete("/orders/{order_id}")
def cancel_paper_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(PaperOrder).join(PaperAccount).filter(
        PaperOrder.id == order_id,
        PaperAccount.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    if order.status not in ("PENDING", "OPEN"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel order with status '{order.status}'.")

    order.status = "CANCELLED"
    db.commit()
    return {"message": f"Order #{order_id} cancelled successfully."}

@router.get("/orders", response_model=List[PaperOrderOut])
def get_order_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(PaperOrder).join(PaperAccount).filter(
        PaperAccount.user_id == current_user.id
    ).order_by(PaperOrder.created_at.desc()).limit(50).all()

    results = []
    for o in orders:
        events = [{"event_type": e.event_type, "details": e.details, "timestamp": e.timestamp} for e in o.events]
        results.append(PaperOrderOut(
            id=o.id,
            account_id=o.account_id,
            instrument_id=o.instrument_id,
            symbol=o.instrument.symbol if o.instrument else "",
            side=o.side,
            order_type=o.order_type,
            price=float(o.price) if o.price else None,
            trigger_price=float(o.trigger_price) if o.trigger_price else None,
            quantity=o.quantity,
            filled_quantity=o.filled_quantity,
            execution_price=float(o.execution_price) if o.execution_price else None,
            slippage=float(o.slippage),
            commission=float(o.commission),
            status=o.status,
            rejection_reason=o.rejection_reason,
            simulation_label="PAPER TRADE",
            created_at=o.created_at,
            executed_at=o.executed_at,
            events=events
        ))
    return results

@router.get("/positions", response_model=List[PaperPositionOut])
def get_open_positions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    positions = db.query(PaperPosition).join(PaperAccount).filter(
        PaperAccount.user_id == current_user.id,
        PaperPosition.quantity > 0
    ).all()

    results = []
    for p in positions:
        inst = p.instrument
        cur_price = float(inst.current_price) if inst else float(p.current_price)
        avg_entry = float(p.average_entry_price)
        invested = avg_entry * p.quantity
        cur_val = cur_price * p.quantity
        unrealized = cur_val - invested
        unrealized_pct = (unrealized / invested * 100.0) if invested > 0 else 0.0

        results.append(PaperPositionOut(
            id=p.id,
            instrument_id=p.instrument_id,
            symbol=inst.symbol if inst else "",
            name=inst.name if inst else "",
            currency=inst.currency if inst else "INR",
            side=p.side,
            quantity=p.quantity,
            average_entry_price=round(avg_entry, 2),
            current_price=round(cur_price, 2),
            invested_amount=round(invested, 2),
            current_value=round(cur_val, 2),
            unrealized_pnl=round(unrealized, 2),
            unrealized_pnl_pct=round(unrealized_pct, 2),
            simulation_label="PAPER POSITION",
            updated_at=p.updated_at
        ))
    return results

@router.get("/transactions", response_model=List[PaperTransactionOut])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txs = db.query(PaperTransaction).join(PaperAccount).filter(
        PaperAccount.user_id == current_user.id
    ).order_by(PaperTransaction.timestamp.desc()).limit(50).all()

    return [
        PaperTransactionOut(
            id=t.id,
            order_id=t.order_id,
            instrument_id=t.instrument_id,
            symbol=t.instrument.symbol if t.instrument else "",
            side=t.side,
            quantity=t.quantity,
            price=float(t.price),
            fee=float(t.fee),
            realized_pnl=float(t.realized_pnl),
            timestamp=t.timestamp
        ) for t in txs
    ]
