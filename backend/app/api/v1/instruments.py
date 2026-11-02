from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from app.api.deps import get_db, get_current_user, get_market_provider
from app.models.user import User
from app.models.instrument import Instrument, MarketData, FinancialMetric, NewsArticle
from app.analytics.indicators import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands
)
import pandas as pd

router = APIRouter()

@router.get("/")
def list_or_search_instruments(
    q: Optional[str] = Query(None, description="Search query by symbol or company name"),
    exchange: Optional[str] = Query(None, description="Filter by exchange code (NSE, BSE, NASDAQ, NYSE)"),
    db: Session = Depends(get_db)
):
    query = db.query(Instrument).filter(Instrument.is_active == True)
    if exchange:
        query = query.join(Instrument.exchange).filter(Instrument.exchange.has(code=exchange.upper()))
    if q:
        search_term = f"%{q}%"
        query = query.filter((Instrument.symbol.ilike(search_term)) | (Instrument.name.ilike(search_term)))

    instruments = query.all()
    results = []
    for inst in instruments:
        results.append({
            "id": inst.id,
            "symbol": inst.symbol,
            "name": inst.name,
            "sector": inst.sector,
            "currency": inst.currency,
            "current_price": float(inst.current_price),
            "change_pct": float(inst.change_pct),
            "day_high": float(inst.day_high),
            "day_low": float(inst.day_low),
            "volume_24h": float(inst.volume_24h),
            "exchange_code": inst.exchange.code if inst.exchange else "NSE",
            "data_source_label": "SIMULATED / DEMO"
        })
    return results

@router.get("/{symbol}")
def get_instrument_detail(
    symbol: str,
    db: Session = Depends(get_db),
    market_provider = Depends(get_market_provider)
):
    clean_symbol = symbol.upper().replace(".NS", "").replace(".BO", "").strip()
    inst = db.query(Instrument).filter(Instrument.symbol == clean_symbol).first()
    if not inst:
        raise HTTPException(status_code=404, detail=f"Instrument '{symbol}' not found.")

    # 1. Fetch candles from DB (ordered by timestamp)
    db_candles = db.query(MarketData).filter(
        MarketData.instrument_id == inst.id
    ).order_by(MarketData.timestamp.asc()).all()

    candles_data = []
    close_prices = []
    for c in db_candles:
        cl = float(c.close)
        close_prices.append(cl)
        candles_data.append({
            "timestamp": c.timestamp.isoformat(),
            "open": float(c.open),
            "high": float(c.high),
            "low": float(c.low),
            "close": cl,
            "volume": float(c.volume),
            "vwap": float(c.vwap) if c.vwap else cl,
            "is_delayed": c.is_delayed,
            "data_source": c.data_source
        })

    # 2. Calculate Technical Indicators via NumPy & Pandas
    indicators = {}
    if len(close_prices) >= 14:
        series = pd.Series(close_prices)
        sma_20 = calculate_sma(series, window=20)
        ema_20 = calculate_ema(series, window=20)
        rsi_14 = calculate_rsi(series, window=14)
        macd_dict = calculate_macd(series)
        bb_dict = calculate_bollinger_bands(series, window=20)

        indicators = {
            "sma_20": round(float(sma_20.iloc[-1]), 2),
            "ema_20": round(float(ema_20.iloc[-1]), 2),
            "rsi_14": round(float(rsi_14.iloc[-1]), 2),
            "macd": round(float(macd_dict["macd"].iloc[-1]), 2),
            "macd_signal": round(float(macd_dict["signal"].iloc[-1]), 2),
            "macd_histogram": round(float(macd_dict["histogram"].iloc[-1]), 2),
            "bollinger_upper": round(float(bb_dict["upper"].iloc[-1]), 2),
            "bollinger_middle": round(float(bb_dict["middle"].iloc[-1]), 2),
            "bollinger_lower": round(float(bb_dict["lower"].iloc[-1]), 2),
        }

    # 3. Financial Metrics
    metric = db.query(FinancialMetric).filter(
        FinancialMetric.instrument_id == inst.id
    ).order_by(FinancialMetric.metric_date.desc()).first()

    metrics_data = None
    if metric:
        metrics_data = {
            "metric_date": metric.metric_date.isoformat(),
            "market_cap": float(metric.market_cap) if metric.market_cap else None,
            "pe_ratio": metric.pe_ratio,
            "pb_ratio": metric.pb_ratio,
            "eps": metric.eps,
            "roe": metric.roe,
            "roce": metric.roce,
            "debt_to_equity": metric.debt_to_equity,
            "dividend_yield": metric.dividend_yield,
            "beta": metric.beta,
            "week_52_high": float(metric.week_52_high) if metric.week_52_high else None,
            "week_52_low": float(metric.week_52_low) if metric.week_52_low else None,
        }

    # 4. News Articles
    news_items = db.query(NewsArticle).filter(
        NewsArticle.instrument_id == inst.id
    ).order_by(NewsArticle.published_at.desc()).limit(5).all()

    news_data = [
        {
            "id": n.id,
            "title": n.title,
            "summary": n.summary,
            "source": n.source,
            "url": n.url,
            "sentiment_score": n.sentiment_score,
            "published_at": n.published_at.isoformat()
        } for n in news_items
    ]

    return {
        "instrument": {
            "id": inst.id,
            "symbol": inst.symbol,
            "name": inst.name,
            "sector": inst.sector,
            "currency": inst.currency,
            "current_price": float(inst.current_price),
            "change_pct": float(inst.change_pct),
            "day_high": float(inst.day_high),
            "day_low": float(inst.day_low),
            "volume_24h": float(inst.volume_24h),
            "exchange_code": inst.exchange.code if inst.exchange else "NSE",
            "data_source_label": "SIMULATED / DEMO"
        },
        "metrics": metrics_data,
        "indicators": indicators,
        "candles": candles_data,
        "news": news_data,
        "data_freshness": "HISTORICAL / DEMO (End-of-Day Refreshed)",
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
