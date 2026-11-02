import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from app.market_data.base_provider import BaseMarketDataProvider

# Catalog of verified benchmark reference data
INSTRUMENT_CATALOG = {
    # Indian Market (NSE)
    "RELIANCE": {
        "symbol": "RELIANCE",
        "name": "Reliance Industries Limited",
        "exchange": "NSE",
        "country": "India",
        "currency": "INR",
        "sector": "Energy & Conglomerate",
        "base_price": 2940.50,
        "volatility": 0.016,
        "pe": 26.4,
        "pb": 2.3,
        "roe": 9.4,
        "market_cap": 19800000000000.0,  # ~19.8 Lakh Cr
        "beta": 1.05,
        "dividend_yield": 0.35,
        "lot_size": 1,
        "tick_size": 0.05
    },
    "TCS": {
        "symbol": "TCS",
        "name": "Tata Consultancy Services Limited",
        "exchange": "NSE",
        "country": "India",
        "currency": "INR",
        "sector": "Information Technology",
        "base_price": 4120.00,
        "volatility": 0.014,
        "pe": 31.8,
        "pb": 13.5,
        "roe": 48.2,
        "market_cap": 14900000000000.0,
        "beta": 0.75,
        "dividend_yield": 1.25,
        "lot_size": 1,
        "tick_size": 0.05
    },
    "INFY": {
        "symbol": "INFY",
        "name": "Infosys Limited",
        "exchange": "NSE",
        "country": "India",
        "currency": "INR",
        "sector": "Information Technology",
        "base_price": 1850.25,
        "volatility": 0.017,
        "pe": 27.2,
        "pb": 7.8,
        "roe": 31.5,
        "market_cap": 7650000000000.0,
        "beta": 0.88,
        "dividend_yield": 2.10,
        "lot_size": 1,
        "tick_size": 0.05
    },
    "HDFCBANK": {
        "symbol": "HDFCBANK",
        "name": "HDFC Bank Limited",
        "exchange": "NSE",
        "country": "India",
        "currency": "INR",
        "sector": "Financial Services / Banking",
        "base_price": 1680.75,
        "volatility": 0.015,
        "pe": 19.1,
        "pb": 2.8,
        "roe": 16.5,
        "market_cap": 12800000000000.0,
        "beta": 1.12,
        "dividend_yield": 1.15,
        "lot_size": 1,
        "tick_size": 0.05
    },
    "ICICIBANK": {
        "symbol": "ICICIBANK",
        "name": "ICICI Bank Limited",
        "exchange": "NSE",
        "country": "India",
        "currency": "INR",
        "sector": "Financial Services / Banking",
        "base_price": 1245.30,
        "volatility": 0.016,
        "pe": 18.5,
        "pb": 3.2,
        "roe": 18.2,
        "market_cap": 8750000000000.0,
        "beta": 1.18,
        "dividend_yield": 0.85,
        "lot_size": 1,
        "tick_size": 0.05
    },
    "TATAMOTORS": {
        "symbol": "TATAMOTORS",
        "name": "Tata Motors Limited",
        "exchange": "NSE",
        "country": "India",
        "currency": "INR",
        "sector": "Automobile",
        "base_price": 965.80,
        "volatility": 0.022,
        "pe": 11.2,
        "pb": 3.9,
        "roe": 35.8,
        "market_cap": 3540000000000.0,
        "beta": 1.45,
        "dividend_yield": 0.65,
        "lot_size": 1,
        "tick_size": 0.05
    },

    # US Market (NASDAQ / NYSE)
    "AAPL": {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "exchange": "NASDAQ",
        "country": "United States",
        "currency": "USD",
        "sector": "Consumer Electronics & Technology",
        "base_price": 232.50,
        "volatility": 0.015,
        "pe": 34.2,
        "pb": 46.1,
        "roe": 147.2,
        "market_cap": 3540000000000.0,
        "beta": 1.02,
        "dividend_yield": 0.45,
        "lot_size": 1,
        "tick_size": 0.01
    },
    "MSFT": {
        "symbol": "MSFT",
        "name": "Microsoft Corporation",
        "exchange": "NASDAQ",
        "country": "United States",
        "currency": "USD",
        "sector": "Software & Cloud Services",
        "base_price": 435.20,
        "volatility": 0.016,
        "pe": 35.8,
        "pb": 12.4,
        "roe": 38.6,
        "market_cap": 3230000000000.0,
        "beta": 1.14,
        "dividend_yield": 0.72,
        "lot_size": 1,
        "tick_size": 0.01
    },
    "NVDA": {
        "symbol": "NVDA",
        "name": "NVIDIA Corporation",
        "exchange": "NASDAQ",
        "country": "United States",
        "currency": "USD",
        "sector": "Semiconductors & AI Hardware",
        "base_price": 138.80,
        "volatility": 0.028,
        "pe": 58.4,
        "pb": 48.2,
        "roe": 115.4,
        "market_cap": 3410000000000.0,
        "beta": 1.85,
        "dividend_yield": 0.03,
        "lot_size": 1,
        "tick_size": 0.01
    },
    "TSLA": {
        "symbol": "TSLA",
        "name": "Tesla, Inc.",
        "exchange": "NASDAQ",
        "country": "United States",
        "currency": "USD",
        "sector": "Automotive & Clean Energy",
        "base_price": 258.40,
        "volatility": 0.035,
        "pe": 72.1,
        "pb": 12.8,
        "roe": 18.5,
        "market_cap": 825000000000.0,
        "beta": 2.30,
        "dividend_yield": 0.0,
        "lot_size": 1,
        "tick_size": 0.01
    },
    "SPY": {
        "symbol": "SPY",
        "name": "SPDR S&P 500 ETF Trust",
        "exchange": "NYSE",
        "country": "United States",
        "currency": "USD",
        "sector": "Index ETF",
        "base_price": 582.40,
        "volatility": 0.010,
        "pe": 26.2,
        "pb": 4.8,
        "roe": 18.0,
        "market_cap": 590000000000.0,
        "beta": 1.00,
        "dividend_yield": 1.22,
        "lot_size": 1,
        "tick_size": 0.01
    },
    "QQQ": {
        "symbol": "QQQ",
        "name": "Invesco QQQ Trust (NASDAQ 100 ETF)",
        "exchange": "NASDAQ",
        "country": "United States",
        "currency": "USD",
        "sector": "Tech ETF",
        "base_price": 498.75,
        "volatility": 0.014,
        "pe": 31.5,
        "pb": 6.8,
        "roe": 24.0,
        "market_cap": 295000000000.0,
        "beta": 1.18,
        "dividend_yield": 0.58,
        "lot_size": 1,
        "tick_size": 0.01
    },
    # Indian Market (BSE)
    "SBIN": {
        "symbol": "SBIN",
        "name": "State Bank of India",
        "exchange": "BSE",
        "country": "India",
        "currency": "INR",
        "sector": "Public Sector Banking",
        "base_price": 820.50,
        "volatility": 0.018,
        "pe": 10.4,
        "pb": 1.45,
        "roe": 16.8,
        "market_cap": 7320000000000.0,
        "beta": 1.25,
        "dividend_yield": 1.65,
        "lot_size": 1,
        "tick_size": 0.05
    },
    "ITC": {
        "symbol": "ITC",
        "name": "ITC Limited",
        "exchange": "BSE",
        "country": "India",
        "currency": "INR",
        "sector": "Consumer Goods & FMCG",
        "base_price": 485.60,
        "volatility": 0.012,
        "pe": 28.5,
        "pb": 7.2,
        "roe": 29.4,
        "market_cap": 6050000000000.0,
        "beta": 0.65,
        "dividend_yield": 2.85,
        "lot_size": 1,
        "tick_size": 0.05
    },
    "LT": {
        "symbol": "LT",
        "name": "Larsen & Toubro Limited",
        "exchange": "BSE",
        "country": "India",
        "currency": "INR",
        "sector": "Capital Goods & Infrastructure",
        "base_price": 3620.00,
        "volatility": 0.016,
        "pe": 34.2,
        "pb": 5.1,
        "roe": 15.2,
        "market_cap": 4980000000000.0,
        "beta": 1.05,
        "dividend_yield": 0.95,
        "lot_size": 1,
        "tick_size": 0.05
    },
    "KOTAKBANK": {
        "symbol": "KOTAKBANK",
        "name": "Kotak Mahindra Bank Limited",
        "exchange": "BSE",
        "country": "India",
        "currency": "INR",
        "sector": "Financial Services / Banking",
        "base_price": 1780.40,
        "volatility": 0.015,
        "pe": 19.8,
        "pb": 3.1,
        "roe": 14.5,
        "market_cap": 3540000000000.0,
        "beta": 0.98,
        "dividend_yield": 0.80,
        "lot_size": 1,
        "tick_size": 0.05
    },

    # Additional NYSE / US Equities
    "JPM": {
        "symbol": "JPM",
        "name": "JPMorgan Chase & Co.",
        "exchange": "NYSE",
        "country": "United States",
        "currency": "USD",
        "sector": "Investment Banking & Financial Services",
        "base_price": 224.50,
        "volatility": 0.014,
        "pe": 12.8,
        "pb": 1.85,
        "roe": 16.9,
        "market_cap": 642000000000.0,
        "beta": 1.08,
        "dividend_yield": 2.10,
        "lot_size": 1,
        "tick_size": 0.01
    },
    "WMT": {
        "symbol": "WMT",
        "name": "Walmart Inc.",
        "exchange": "NYSE",
        "country": "United States",
        "currency": "USD",
        "sector": "Retail & Consumer Staples",
        "base_price": 82.30,
        "volatility": 0.011,
        "pe": 32.4,
        "pb": 6.8,
        "roe": 19.8,
        "market_cap": 660000000000.0,
        "beta": 0.52,
        "dividend_yield": 1.02,
        "lot_size": 1,
        "tick_size": 0.01
    }
}

class MockMarketDataProvider(BaseMarketDataProvider):
    """
    Deterministic & high-fidelity market data generator for test, demo, and offline use.
    Produces repeatable historical OHLCV curves and accurate quotes.
    """

    def __init__(self):
        self.catalog = INSTRUMENT_CATALOG

    def _get_clean_symbol(self, symbol: str) -> str:
        s = symbol.upper().replace(".NS", "").replace(".BO", "").strip()
        return s

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        clean = self._get_clean_symbol(symbol)
        info = self.catalog.get(clean)
        if not info:
            # Default placeholder
            return {
                "symbol": symbol.upper(),
                "price": 100.0,
                "change_pct": 0.0,
                "currency": "USD",
                "exchange": "NYSE",
                "day_high": 102.0,
                "day_low": 98.0,
                "volume": 100000,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "data_source_label": "SIMULATED / DEMO"
            }

        # Deterministic small jitter based on hour of day
        hour = datetime.now(timezone.utc).hour
        jitter_pct = (np.sin(hour + hash(clean) % 10) * 0.008)
        current_price = round(info["base_price"] * (1.0 + jitter_pct), 2)
        change_pct = round(jitter_pct * 100.0, 2)
        
        return {
            "symbol": info["symbol"],
            "name": info["name"],
            "price": current_price,
            "change_pct": change_pct,
            "currency": info["currency"],
            "exchange": info["exchange"],
            "day_high": round(current_price * 1.012, 2),
            "day_low": round(current_price * 0.988, 2),
            "volume": int(1500000 + abs(hash(clean)) % 5000000),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data_source_label": "SIMULATED / DEMO"
        }

    def get_historical_candles(
        self,
        symbol: str,
        interval: str = "1d",
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        clean = self._get_clean_symbol(symbol)
        info = self.catalog.get(clean, {
            "symbol": clean,
            "base_price": 150.0,
            "volatility": 0.015,
            "currency": "USD"
        })

        base = info["base_price"]
        daily_vol = info["volatility"]
        
        # Use deterministic random seed per symbol so candles are stable across page refreshes
        seed = abs(hash(clean)) % (2**31 - 1)
        rng = np.random.RandomState(seed)
        
        # Generate returns
        shocks = rng.normal(loc=0.0004, scale=daily_vol, size=limit)
        price_multipliers = np.cumprod(1.0 + shocks)
        # Anchor the end to current base price
        price_series = (base / price_multipliers[-1]) * price_multipliers
        
        now = datetime.now(timezone.utc)
        candles = []
        for i in range(limit):
            t = now - timedelta(days=(limit - 1 - i))
            c = float(price_series[i])
            # Construct realistic open, high, low
            day_noise = rng.uniform(-0.008, 0.008)
            o = float(c * (1.0 + day_noise))
            h = float(max(o, c) * (1.0 + rng.uniform(0.002, 0.015)))
            l = float(min(o, c) * (1.0 - rng.uniform(0.002, 0.015)))
            v = int(rng.uniform(500000, 4500000))
            vwap = float((h + l + c) / 3.0)
            
            candles.append({
                "timestamp": t.isoformat(),
                "open": round(o, 2),
                "high": round(h, 2),
                "low": round(l, 2),
                "close": round(c, 2),
                "volume": v,
                "vwap": round(vwap, 2),
                "is_delayed": True,
                "data_source": "mock"
            })
            
        return candles

    def get_financial_metrics(self, symbol: str) -> Dict[str, Any]:
        clean = self._get_clean_symbol(symbol)
        info = self.catalog.get(clean, {})
        base_price = info.get("base_price", 100.0)
        return {
            "metric_date": datetime.now(timezone.utc).isoformat(),
            "market_cap": info.get("market_cap", 1000000000.0),
            "pe_ratio": info.get("pe", 22.5),
            "pb_ratio": info.get("pb", 3.1),
            "eps": round(base_price / info.get("pe", 22.5), 2) if info.get("pe") else 12.0,
            "roe": info.get("roe", 18.0),
            "roce": round(info.get("roe", 18.0) * 0.9, 1),
            "debt_to_equity": 0.42,
            "dividend_yield": info.get("dividend_yield", 1.0),
            "beta": info.get("beta", 1.0),
            "week_52_high": round(base_price * 1.22, 2),
            "week_52_low": round(base_price * 0.81, 2)
        }

    def search_instruments(self, query: str) -> List[Dict[str, Any]]:
        q = query.upper().strip()
        results = []
        for symbol, info in self.catalog.items():
            if q in symbol or q in info["name"].upper() or q in info["sector"].upper():
                results.append({
                    "symbol": info["symbol"],
                    "name": info["name"],
                    "exchange": info["exchange"],
                    "country": info["country"],
                    "currency": info["currency"],
                    "sector": info["sector"],
                    "current_price": info["base_price"],
                    "data_source_label": "SIMULATED / DEMO"
                })
        return results
