import uuid
import pytest
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.instrument import Instrument
from app.models.paper_trading import PaperAccount, PaperPosition, PaperOrder
from app.trading.paper_engine import (
    get_or_create_paper_account,
    execute_paper_order,
    calculate_account_summary
)
from app.core.security import get_password_hash

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="module")
def paper_user(db):
    uid = uuid.uuid4().hex[:8]
    user = User(
        email=f"paper_test_{uid}@finpilot.ai",
        hashed_password=get_password_hash("pass123"),
        role=UserRole.USER
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_paper_account_creation_and_balance(db, paper_user):
    account = get_or_create_paper_account(db, paper_user.id, currency="INR")
    assert account.user_id == paper_user.id
    assert float(account.initial_balance) == 1000000.00
    assert float(account.cash_balance) == 1000000.00
    assert float(account.realized_pnl) == 0.00

def test_paper_order_execution_and_position_lifecycle(db, paper_user):
    account = get_or_create_paper_account(db, paper_user.id, currency="INR")
    
    inst = db.query(Instrument).first()
    assert inst is not None

    initial_cash = float(account.cash_balance)
    order_qty = 10

    # 1. Execute BUY Order
    order, filled = execute_paper_order(
        db=db,
        account=account,
        instrument=inst,
        side="BUY",
        order_type="MARKET",
        quantity=order_qty
    )
    assert filled is True
    assert order.status == "FILLED"
    assert order.filled_quantity == order_qty
    assert float(order.slippage) >= 0.0
    assert float(order.commission) > 0.0
    assert float(account.cash_balance) < initial_cash

    # Verify Position was created
    pos = db.query(PaperPosition).filter(
        PaperPosition.account_id == account.id,
        PaperPosition.instrument_id == inst.id
    ).first()
    assert pos is not None
    assert pos.quantity == order_qty

    # 2. Execute SELL Order for half quantity (5 shares)
    sell_order, sell_filled = execute_paper_order(
        db=db,
        account=account,
        instrument=inst,
        side="SELL",
        order_type="MARKET",
        quantity=5
    )
    assert sell_filled is True
    assert sell_order.status == "FILLED"
    assert pos.quantity == 5

    # 3. Test Insufficient Balance Rejection
    huge_order, huge_filled = execute_paper_order(
        db=db,
        account=account,
        instrument=inst,
        side="BUY",
        order_type="MARKET",
        quantity=10000000  # huge quantity
    )
    assert huge_filled is False
    assert huge_order.status == "REJECTED"
    assert "Insufficient virtual cash balance" in huge_order.rejection_reason
