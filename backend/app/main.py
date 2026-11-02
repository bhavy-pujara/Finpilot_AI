from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.database import engine, Base, SessionLocal
from app.core.seed import seed_database
import app.models

# Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.instruments import router as instruments_router
from app.api.v1.watchlists import router as watchlists_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.research import router as research_router
from app.api.v1.trade_planner import router as trade_planner_router
from app.api.v1.paper_trading import router as paper_trading_router
from app.api.v1.portfolio import router as portfolio_router
from app.api.v1.risk import router as risk_router
from app.api.v1.journal import router as journal_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.broker import router as broker_router
from app.api.v1.admin import router as admin_router
from app.api.v1.legal import router as legal_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup structured logging
    setup_logging()
    logger.info("Initializing FinPilot AI backend services...")
    
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema verified.")

    # Run initial seed
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("Database seed verification complete.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

    yield

    logger.info("FinPilot AI backend shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Production-Structured FinTech SaaS Engine: Market Intelligence, Paper Trading & AI Copilot",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=f"{prefix}/auth", tags=["Authentication"])
app.include_router(dashboard_router, prefix=f"{prefix}/dashboard", tags=["Dashboard"])
app.include_router(instruments_router, prefix=f"{prefix}/instruments", tags=["Instruments & Market Data"])
app.include_router(watchlists_router, prefix=f"{prefix}/watchlists", tags=["Watchlists"])
app.include_router(assistant_router, prefix=f"{prefix}/assistant", tags=["AI Market Copilot"])
app.include_router(research_router, prefix=f"{prefix}/research", tags=["AI Stock Research Engine"])
app.include_router(trade_planner_router, prefix=f"{prefix}/trade-planner", tags=["Trade Planner"])
app.include_router(paper_trading_router, prefix=f"{prefix}/paper-trading", tags=["Paper Trading Engine"])
app.include_router(portfolio_router, prefix=f"{prefix}/portfolio", tags=["Portfolio Intelligence"])
app.include_router(risk_router, prefix=f"{prefix}/risk", tags=["Risk Management Engine"])
app.include_router(journal_router, prefix=f"{prefix}/journal", tags=["Trading Journal"])
app.include_router(notifications_router, prefix=f"{prefix}/notifications", tags=["Notifications"])
app.include_router(broker_router, prefix=f"{prefix}/broker", tags=["Broker Architecture"])
app.include_router(admin_router, prefix=f"{prefix}/admin", tags=["Administration"])
app.include_router(legal_router, prefix=f"{prefix}/legal", tags=["Legal & Regulatory Safety"])

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "ONLINE",
        "tagline": "Understand the trade before you make it.",
        "version": "1.0.0",
        "docs_url": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": "2026-10-31T22:54:00Z"}
