from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.broker import BrokerConnection
from app.schemas.broker import BrokerConsentRequest, BrokerConnectionOut, BrokerQuoteSimulated
from app.broker.mock_adapters import MockZerodhaKiteAdapter, MockAngelOneAdapter, MockAlpacaAdapter
from app.broker.consent_manager import record_broker_consent

router = APIRouter()

@router.get("/connections", response_model=List[BrokerConnectionOut])
def get_broker_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conns = db.query(BrokerConnection).filter(
        BrokerConnection.user_id == current_user.id
    ).all()
    return conns

@router.post("/connect", response_model=BrokerConnectionOut, status_code=status.HTTP_201_CREATED)
def connect_mock_broker(
    req_in: BrokerConsentRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid_brokers = ["ZERODHA", "ANGEL_ONE", "ALPACA"]
    b_name = req_in.broker_name.upper()
    if b_name not in valid_brokers:
        raise HTTPException(status_code=400, detail=f"Unsupported broker: {b_name}. Supported: {valid_brokers}")

    ip = request.client.host if request.client else "127.0.0.1"
    conn = record_broker_consent(db, current_user.id, b_name, ip_address=ip)
    return conn

@router.delete("/disconnect/{broker_name}")
def disconnect_broker(
    broker_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conn = db.query(BrokerConnection).filter(
        BrokerConnection.user_id == current_user.id,
        BrokerConnection.broker_name == broker_name.upper()
    ).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Broker connection not found.")

    conn.status = "DISCONNECTED"
    db.commit()
    return {"message": f"Broker connection to {broker_name.upper()} disconnected."}

@router.get("/quote-simulated")
def get_simulated_broker_quote(
    broker: str,
    symbol: str,
    side: str = "BUY",
    quantity: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    b = broker.upper()
    if b == "ZERODHA":
        adapter = MockZerodhaKiteAdapter()
    elif b == "ANGEL_ONE":
        adapter = MockAngelOneAdapter()
    elif b == "ALPACA":
        adapter = MockAlpacaAdapter()
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported broker {b}.")

    quote = adapter.quote_simulated_order(symbol=symbol.upper(), side=side.upper(), quantity=quantity)
    return quote
