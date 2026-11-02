from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timezone
from typing import List
import time

from app.api.deps import get_db, require_admin
from app.models.user import User, UserRole
from app.models.paper_trading import PaperOrder, PaperPosition
from app.models.trade_plan import TradePlan
from app.models.ai import AIUsage
from app.models.audit import AuditLog
from app.schemas.admin import AdminStatsOut, AuditLogOut, SystemHealthOut
from app.core.config import settings

router = APIRouter()
START_TIME = time.time()

@router.get("/health", response_model=SystemHealthOut)
def get_system_health(db: Session = Depends(get_db)):
    db_connected = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_connected = False

    return SystemHealthOut(
        status="HEALTHY" if db_connected else "DEGRADED",
        environment=settings.ENVIRONMENT,
        database_connected=db_connected,
        database_type="SQLite (Local Dev)" if "sqlite" in settings.DATABASE_URL else "PostgreSQL / Neon",
        redis_connected=settings.REDIS_ENABLED,
        active_ai_provider=settings.DEFAULT_LLM_PROVIDER,
        active_market_provider=settings.PRIMARY_MARKET_DATA_PROVIDER,
        uptime_seconds=round(time.time() - START_TIME, 2),
        timestamp=datetime.now(timezone.utc)
    )

@router.get("/stats", response_model=AdminStatsOut)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_paper_orders = db.query(PaperOrder).count()
    total_paper_positions = db.query(PaperPosition).count()
    total_trade_plans = db.query(TradePlan).count()
    
    ai_usages = db.query(AIUsage).all()
    total_tokens = sum(u.total_tokens for u in ai_usages)
    total_cost = sum(float(u.estimated_cost_usd) for u in ai_usages)
    total_audits = db.query(AuditLog).count()

    health = get_system_health(db)

    return AdminStatsOut(
        total_users=total_users,
        active_users=active_users,
        total_paper_orders=total_paper_orders,
        total_paper_positions=total_paper_positions,
        total_trade_plans=total_trade_plans,
        total_ai_tokens_consumed=total_tokens,
        total_ai_estimated_cost_usd=round(total_cost, 4),
        total_audit_events=total_audits,
        system_health=health
    )

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    users = db.query(User).order_by(User.id.asc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat()
        } for u in users
    ]

@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot toggle your own administrative account.")

    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {user.email} status toggled to {'active' if user.is_active else 'inactive'}."}

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return logs
