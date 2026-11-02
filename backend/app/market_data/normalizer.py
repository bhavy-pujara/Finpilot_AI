from typing import Dict, Any, Tuple

def normalize_symbol(symbol: str) -> Tuple[str, str, str]:
    """
    Normalizes stock symbol and returns (clean_symbol, exchange, default_currency).
    E.g.
    'RELIANCE.NS' -> ('RELIANCE', 'NSE', 'INR')
    'AAPL' -> ('AAPL', 'NASDAQ', 'USD')
    """
    s = symbol.strip().upper()
    if s.endswith(".NS"):
        return s[:-3], "NSE", "INR"
    elif s.endswith(".BO"):
        return s[:-3], "BSE", "INR"
    
    # Common Indian symbols
    indian_tickers = {"RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "TATAMOTORS", "NIFTY50", "SENSEX"}
    if s in indian_tickers:
        return s, "NSE", "INR"
        
    return s, "NASDAQ", "USD"

def format_currency(value: float, currency: str = "INR") -> str:
    """Format monetary numbers cleanly."""
    if currency == "INR":
        return f"₹{value:,.2f}"
    return f"${value:,.2f}"
