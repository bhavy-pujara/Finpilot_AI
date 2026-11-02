from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, List
import uuid

from app.models.paper_trading import PaperAccount, PaperOrder, PaperOrderEvent, PaperPosition, PaperTransaction
from app.models.instrument import Instrument
from app.trading.order_validation import validate_paper_order

def get_or_create_paper_account(db: Session, user_id: int, currency: str = "INR") -> PaperAccount:
    account = db.query(PaperAccount).filter(PaperAccount.user_id == user_id, PaperAccount.currency == currency).first()
    if not account:
        # Default virtual balances: ₹1,000,000 INR or $100,000 USD
        initial_val = 1000000.00 if currency == "INR" else 100000.00
        account = PaperAccount(
            user_id=user_id,
            account_number=f"SIM-{uuid.uuid4().hex[:8].upper()}",
            currency=currency,
            initial_balance=initial_val,
            cash_balance=initial_val,
            realized_pnl=0.0
        )
        db.add(account)
        db.commit()
        db.refresh(account)
    return account

def execute_paper_order(
    db: Session,
    account: PaperAccount,
    instrument: Instrument,
    side: str,
    order_type: str,
    quantity: int,
    price: Optional[float] = None,
    trigger_price: Optional[float] = None
) -> Tuple[PaperOrder, bool]:
    """
    Simulates paper order execution with slippage, commissions, and position updates.
    Returns (PaperOrder, was_filled).
    """
    now = datetime.now(timezone.utc)
    
    # 1. Create order record in PENDING state
    order = PaperOrder(
        account_id=account.id,
        instrument_id=instrument.id,
        side=side,
        order_type=order_type,
        price=price,
        trigger_price=trigger_price,
        quantity=quantity,
        filled_quantity=0,
        status="PENDING",
        simulation_label="PAPER TRADE",
        created_at=now
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Log creation event
    db.add(PaperOrderEvent(
        order_id=order.id,
        event_type="CREATED",
        details={"side": side, "type": order_type, "qty": quantity},
        timestamp=now
    ))
    db.commit()

    # 2. Validation
    is_valid, validation_error = validate_paper_order(
        account=account,
        instrument=instrument,
        side=side,
        order_type=order_type,
        quantity=quantity,
        price=price,
        trigger_price=trigger_price
    )

    if not is_valid:
        order.status = "REJECTED"
        order.rejection_reason = validation_error
        db.add(PaperOrderEvent(
            order_id=order.id,
            event_type="REJECTED",
            details={"reason": validation_error},
            timestamp=datetime.now(timezone.utc)
        ))
        db.commit()
        db.refresh(order)
        return order, False

    # 3. Execution price calculation with realistic simulation slippage
    market_price = float(instrument.current_price)
    slippage_pct = 0.0005  # 0.05% realistic execution slippage

    if side == "BUY":
        execution_price = market_price * (1.0 + slippage_pct)
        if order_type == "LIMIT" and price and price < execution_price:
            # Limit not reached
            order.status = "OPEN"
            db.commit()
            return order, False
    else:  # SELL
        execution_price = market_price * (1.0 - slippage_pct)
        if order_type == "LIMIT" and price and price > execution_price:
            order.status = "OPEN"
            db.commit()
            return order, False

    execution_price = round(execution_price, 2)
    slippage_amount = round(abs(execution_price - market_price) * quantity, 2)
    trade_value = execution_price * quantity
    
    # Commission: 0.03% or minimum 20 INR / 1 USD
    min_fee = 20.0 if account.currency == "INR" else 1.0
    commission = round(max(min_fee, trade_value * 0.0003), 2)

    # 4. Update Position & Cash
    position = db.query(PaperPosition).filter(
        PaperPosition.account_id == account.id,
        PaperPosition.instrument_id == instrument.id
    ).first()

    realized_pnl_trade = 0.0

    if side == "BUY":
        # Deduct cash
        total_debit = trade_value + commission
        account.cash_balance = float(account.cash_balance) - total_debit

        if not position:
            position = PaperPosition(
                account_id=account.id,
                instrument_id=instrument.id,
                side="LONG",
                quantity=quantity,
                average_entry_price=execution_price,
                current_price=market_price,
                unrealized_pnl=(market_price - execution_price) * quantity,
                updated_at=datetime.now(timezone.utc)
            )
            db.add(position)
        else:
            # Weighted average cost calculation
            existing_qty = position.quantity
            existing_cost = float(position.average_entry_price) * existing_qty
            new_qty = existing_qty + quantity
            new_avg_cost = (existing_cost + trade_value) / new_qty
            position.quantity = new_qty
            position.average_entry_price = round(new_avg_cost, 2)
            position.current_price = market_price
            position.unrealized_pnl = round((market_price - new_avg_cost) * new_qty, 2)
            position.updated_at = datetime.now(timezone.utc)

    else:  # SELL
        if not position or position.quantity < quantity:
            # Short-selling or insufficient position
            order.status = "REJECTED"
            order.rejection_reason = f"Cannot sell {quantity} shares. Existing position is {position.quantity if position else 0}."
            db.commit()
            return order, False

        # Calculate realized P&L on the sold shares
        avg_cost = float(position.average_entry_price)
        gross_pnl = (execution_price - avg_cost) * quantity
        realized_pnl_trade = gross_pnl - commission

        # Add cash: trade value minus commission
        account.cash_balance = float(account.cash_balance) + (trade_value - commission)
        account.realized_pnl = float(account.realized_pnl) + realized_pnl_trade

        # Update position
        remaining_qty = position.quantity - quantity
        if remaining_qty == 0:
            db.delete(position)
        else:
            position.quantity = remaining_qty
            position.unrealized_pnl = round((market_price - avg_cost) * remaining_qty, 2)
            position.updated_at = datetime.now(timezone.utc)

    # 5. Finalize Order & Transaction
    order.status = "FILLED"
    order.filled_quantity = quantity
    order.execution_price = execution_price
    order.slippage = slippage_amount
    order.commission = commission
    order.executed_at = datetime.now(timezone.utc)

    # Record transaction
    transaction = PaperTransaction(
        account_id=account.id,
        order_id=order.id,
        instrument_id=instrument.id,
        side=side,
        quantity=quantity,
        price=execution_price,
        fee=commission,
        realized_pnl=round(realized_pnl_trade, 2),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(transaction)

    # Record event
    db.add(PaperOrderEvent(
        order_id=order.id,
        event_type="EXECUTED",
        details={
            "execution_price": execution_price,
            "commission": commission,
            "slippage": slippage_amount,
            "pnl": realized_pnl_trade
        },
        timestamp=datetime.now(timezone.utc)
    ))

    db.commit()
    db.refresh(order)
    return order, True

def calculate_account_summary(db: Session, account: PaperAccount) -> Dict[str, Any]:
    """Calculate total equity, unrealized P&L, and position count for a paper account."""
    positions = db.query(PaperPosition).filter(PaperPosition.account_id == account.id).all()
    
    invested_value = 0.0
    total_unrealized_pnl = 0.0

    for pos in positions:
        inst = db.query(Instrument).filter(Instrument.id == pos.instrument_id).first()
        cur_price = float(inst.current_price) if inst else float(pos.current_price)
        pos.current_price = cur_price
        pos.unrealized_pnl = round((cur_price - float(pos.average_entry_price)) * pos.quantity, 2)
        invested_value += cur_price * pos.quantity
        total_unrealized_pnl += pos.unrealized_pnl

    db.commit()

    cash = float(account.cash_balance)
    total_equity = cash + invested_value
    realized_pnl = float(account.realized_pnl)
    total_pnl = realized_pnl + total_unrealized_pnl
    initial = float(account.initial_balance)
    total_return_pct = round((total_pnl / initial) * 100.0, 2) if initial > 0 else 0.0

    return {
        "id": account.id,
        "account_number": account.account_number,
        "currency": account.currency,
        "initial_balance": round(initial, 2),
        "cash_balance": round(cash, 2),
        "invested_value": round(invested_value, 2),
        "total_equity": round(total_equity, 2),
        "realized_pnl": round(realized_pnl, 2),
        "unrealized_pnl": round(total_unrealized_pnl, 2),
        "total_pnl": round(total_pnl, 2),
        "total_return_pct": total_return_pct,
        "open_positions_count": len(positions),
        "simulation_label": "SIMULATED PAPER ACCOUNT",
        "created_at": account.created_at
    }
