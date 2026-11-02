from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.models.broker import BrokerConnection
from app.models.audit import AuditLog

def record_broker_consent(
    db: Session,
    user_id: int,
    broker_name: str,
    ip_address: Optional[str] = None
) -> BrokerConnection:
    """
    Records explicit user consent for simulated broker connection and writes immutable audit log.
    Strictly enforces live_orders_prohibited = True.
    """
    connection = db.query(BrokerConnection).filter(
        BrokerConnection.user_id == user_id,
        BrokerConnection.broker_name == broker_name.upper()
    ).first()

    now = datetime.now(timezone.utc)
    mock_id = f"MOCK_{broker_name.upper()}_{user_id}"

    if not connection:
        connection = BrokerConnection(
            user_id=user_id,
            broker_name=broker_name.upper(),
            mock_account_id=mock_id,
            status="MOCK_CONNECTED",
            permission_mode="READ_ONLY",
            consent_recorded=True,
            consent_timestamp=now,
            live_orders_prohibited=True,
            last_synced_at=now
        )
        db.add(connection)
    else:
        connection.status = "MOCK_CONNECTED"
        connection.last_synced_at = now

    # Write audit log
    audit_event = AuditLog(
        user_id=user_id,
        action="BROKER_MOCK_CONSENT_RECORDED",
        resource=f"BrokerConnection:{broker_name.upper()}",
        details={
            "broker": broker_name.upper(),
            "live_orders_prohibited": True,
            "disclaimer_accepted": True
        },
        ip_address=ip_address,
        timestamp=now
    )
    db.add(audit_event)
    db.commit()
    db.refresh(connection)
    return connection
