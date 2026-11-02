from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import uuid
import numpy as np

from app.core.security import get_password_hash
from app.core.config import settings
from app.models.user import User, UserProfile, UserPreference, UserRole
from app.models.instrument import Exchange, Instrument, MarketData, FinancialMetric, NewsArticle
from app.models.watchlist import Watchlist, WatchlistItem
from app.models.paper_trading import PaperAccount, PaperPosition
from app.models.portfolio import Portfolio, PortfolioSnapshot, RiskProfile
from app.models.journal import TradingJournalEntry
from app.models.notification import Notification
from app.models.broker import BrokerConnection
from app.models.audit import AuditLog
from app.market_data.mock_provider import INSTRUMENT_CATALOG, MockMarketDataProvider

def seed_database(db: Session) -> None:
    """Initializes and seeds initial database records if empty."""
    
    # 1. Exchanges
    if db.query(Exchange).count() == 0:
        exchanges = [
            Exchange(code="NSE", name="National Stock Exchange of India", country="India", currency="INR", timezone="Asia/Kolkata"),
            Exchange(code="BSE", name="Bombay Stock Exchange", country="India", currency="INR", timezone="Asia/Kolkata"),
            Exchange(code="NASDAQ", name="Nasdaq Stock Market", country="United States", currency="USD", timezone="America/New_York"),
            Exchange(code="NYSE", name="New York Stock Exchange", country="United States", currency="USD", timezone="America/New_York"),
        ]
        db.add_all(exchanges)
        db.commit()

    exchange_map = {e.code: e.id for e in db.query(Exchange).all()}
    mock_provider = MockMarketDataProvider()

    # 2. Instruments, Historical Market Data & Financial Metrics
    for sym, item in INSTRUMENT_CATALOG.items():
        if db.query(Instrument).filter(Instrument.symbol == sym).first():
            continue
        ex_id = exchange_map.get(item["exchange"], 1)
        inst = Instrument(
            exchange_id=ex_id,
            symbol=sym,
            name=item["name"],
            sector=item["sector"],
            asset_class="ETF" if "ETF" in item["sector"] else "EQUITY",
            currency=item["currency"],
            lot_size=item["lot_size"],
            tick_size=item["tick_size"],
            current_price=item["base_price"],
            change_pct=1.24 if hash(sym) % 2 == 0 else -0.85,
            day_high=round(item["base_price"] * 1.015, 2),
            day_low=round(item["base_price"] * 0.985, 2),
            volume_24h=2500000 + abs(hash(sym)) % 4000000,
            is_active=True
        )
        db.add(inst)
        db.commit()
        db.refresh(inst)

        # Add Financial Metrics
        metrics = mock_provider.get_financial_metrics(sym)
        db.add(FinancialMetric(
            instrument_id=inst.id,
            metric_date=datetime.now(timezone.utc),
            market_cap=metrics["market_cap"],
            pe_ratio=metrics["pe_ratio"],
            pb_ratio=metrics["pb_ratio"],
            eps=metrics["eps"],
            roe=metrics["roe"],
            roce=metrics["roce"],
            debt_to_equity=metrics["debt_to_equity"],
            dividend_yield=metrics["dividend_yield"],
            beta=metrics["beta"],
            week_52_high=metrics["week_52_high"],
            week_52_low=metrics["week_52_low"]
        ))

        # Add 60 days of historical candles
        candles = mock_provider.get_historical_candles(sym, limit=60)
        for c in candles:
            db.add(MarketData(
                instrument_id=inst.id,
                timestamp=datetime.fromisoformat(c["timestamp"]),
                open=c["open"],
                high=c["high"],
                low=c["low"],
                close=c["close"],
                volume=c["volume"],
                vwap=c["vwap"],
                interval="1d",
                data_source="mock",
                is_delayed=True
            ))

        # Add a verified news summary
        db.add(NewsArticle(
            instrument_id=inst.id,
            title=f"{item['name']} announces quarterly performance review and strategic guidance",
            summary=f"Institutional analysts review operational efficiency and sector demand drivers for {sym}.",
            source="FinPilot Financial Intelligence Feed",
            sentiment_score=0.35,
            published_at=datetime.now(timezone.utc) - timedelta(hours=abs(hash(sym)) % 48)
        ))

        db.commit()

    # 3. Users (Admin & Trader)
    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            full_name="FinPilot Chief Administrator",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        db.add(UserProfile(
            user_id=admin.id,
            bio="FinPilot System & Risk Administrator",
            default_market="IN",
            experience_level="advanced",
            risk_tolerance="conservative"
        ))
        db.add(UserPreference(user_id=admin.id, theme="dark", default_currency="INR"))
        db.commit()

    trader = db.query(User).filter(User.email == settings.DEMO_USER_EMAIL).first()
    if not trader:
        trader = User(
            email=settings.DEMO_USER_EMAIL,
            hashed_password=get_password_hash(settings.DEMO_USER_PASSWORD),
            full_name="Alex Vance (Demo Trader)",
            role=UserRole.USER,
            is_active=True,
            is_verified=True
        )
        db.add(trader)
        db.commit()
        db.refresh(trader)

        db.add(UserProfile(
            user_id=trader.id,
            bio="Active quantitative swing trader focusing on large-cap NSE equities and US tech ETFs.",
            default_market="IN",
            experience_level="intermediate",
            risk_tolerance="moderate"
        ))
        db.add(UserPreference(user_id=trader.id, theme="dark", default_currency="INR"))

        # Paper Account
        paper_acc = PaperAccount(
            user_id=trader.id,
            account_number="SIM-IN-88902",
            currency="INR",
            initial_balance=1000000.00,
            cash_balance=850000.00,
            realized_pnl=14500.00
        )
        db.add(paper_acc)
        db.commit()
        db.refresh(paper_acc)

        # Seed sample paper positions (RELIANCE and TCS)
        rel_inst = db.query(Instrument).filter(Instrument.symbol == "RELIANCE").first()
        tcs_inst = db.query(Instrument).filter(Instrument.symbol == "TCS").first()
        if rel_inst:
            db.add(PaperPosition(
                account_id=paper_acc.id,
                instrument_id=rel_inst.id,
                side="LONG",
                quantity=35,
                average_entry_price=2890.00,
                current_price=float(rel_inst.current_price),
                unrealized_pnl=(float(rel_inst.current_price) - 2890.00) * 35,
                updated_at=datetime.now(timezone.utc)
            ))
        if tcs_inst:
            db.add(PaperPosition(
                account_id=paper_acc.id,
                instrument_id=tcs_inst.id,
                side="LONG",
                quantity=12,
                average_entry_price=4050.00,
                current_price=float(tcs_inst.current_price),
                unrealized_pnl=(float(tcs_inst.current_price) - 4050.00) * 12,
                updated_at=datetime.now(timezone.utc)
            ))

        # Risk Profile
        db.add(RiskProfile(
            user_id=trader.id,
            max_portfolio_risk_pct=1.5,
            max_single_stock_risk_pct=12.0,
            max_sector_exposure_pct=30.0,
            max_drawdown_limit_pct=10.0
        ))

        # Portfolio & Snapshots
        portfolio = Portfolio(
            user_id=trader.id,
            name="Alpha Growth Portfolio",
            description="Swing trading multi-asset portfolio with strict stop-losses",
            is_primary=1
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

        # 14 days of historical snapshots
        base_eq = 1000000.0
        for d in range(14, 0, -1):
            snap_date = datetime.now(timezone.utc) - timedelta(days=d)
            daily_shock = (np.sin(d * 1.5) * 0.007) + 0.002
            base_eq *= (1.0 + daily_shock)
            db.add(PortfolioSnapshot(
                portfolio_id=portfolio.id,
                snapshot_date=snap_date,
                total_equity=round(base_eq, 2),
                cash=850000.0,
                invested_value=round(base_eq - 850000.0, 2),
                daily_return=round(daily_shock * 100, 2),
                cumulative_return=round(((base_eq - 1000000.0) / 1000000.0) * 100, 2)
            ))

        # Watchlist
        wl = Watchlist(user_id=trader.id, name="Core Focus Watchlist", is_default=True)
        db.add(wl)
        db.commit()
        db.refresh(wl)

        if rel_inst:
            db.add(WatchlistItem(watchlist_id=wl.id, instrument_id=rel_inst.id, added_price=2910.0, target_price=3100.0, notes="Breakout above resistance"))
        if tcs_inst:
            db.add(WatchlistItem(watchlist_id=wl.id, instrument_id=tcs_inst.id, added_price=4100.0, target_price=4350.0, notes="Strong earnings expected"))
        aapl_inst = db.query(Instrument).filter(Instrument.symbol == "AAPL").first()
        if aapl_inst:
            db.add(WatchlistItem(watchlist_id=wl.id, instrument_id=aapl_inst.id, added_price=225.0, target_price=245.0, notes="Product upgrade cycle"))

        # Trading Journal Entries
        if rel_inst:
            db.add(TradingJournalEntry(
                user_id=trader.id,
                instrument_id=rel_inst.id,
                trade_type="PAPER",
                side="BUY",
                entry_date=datetime.now(timezone.utc) - timedelta(days=4),
                exit_date=datetime.now(timezone.utc) - timedelta(days=1),
                entry_price=2880.00,
                exit_price=2935.00,
                quantity=30,
                realized_pnl=1650.00,
                strategy_tag="Support Bounce",
                emotional_state="Disciplined",
                rationale="Price held 50 EMA with high volume expansion. Followed 2:1 R:R plan.",
                mistakes="Exited slightly early before hitting exact target price.",
                lessons_learned="Trust the trailing stop instead of manually closing early.",
                rating=4
            ))

        # Sample Notifications
        db.add(Notification(
            user_id=trader.id,
            title="Paper Order Executed: RELIANCE",
            message="Simulated BUY order for 35 shares filled at ₹2,890.00 with 0.05% estimated slippage.",
            category="ORDER",
            data_source_label="SIMULATED",
            action_url="/paper-trading"
        ))
        db.add(Notification(
            user_id=trader.id,
            title="Risk Check Passed: Sector Diversification",
            message="Your portfolio HHI is 1,840. Sector exposure is within your 30% limit.",
            category="RISK",
            data_source_label="SIMULATED",
            action_url="/risk"
        ))

        # Mock Broker Connection
        db.add(BrokerConnection(
            user_id=trader.id,
            broker_name="ZERODHA",
            mock_account_id="MOCK_ZERODHA_TRADER1",
            status="MOCK_CONNECTED",
            permission_mode="READ_ONLY",
            consent_recorded=True,
            consent_timestamp=datetime.now(timezone.utc),
            live_orders_prohibited=True,
            last_synced_at=datetime.now(timezone.utc)
        ))

        # Initial Audit Event
        db.add(AuditLog(
            user_id=trader.id,
            action="SYSTEM_INITIAL_SEED",
            resource="UserAccount",
            details={"account": trader.email, "role": "USER"},
            timestamp=datetime.now(timezone.utc)
        ))

        db.commit()


if __name__ == "__main__":
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database seeded successfully.")
    finally:
        db.close()
