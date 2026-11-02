import numpy as np
import pandas as pd
from typing import Dict, Any, Union, List

def calculate_sma(prices: Union[pd.Series, List[float], np.ndarray], window: int) -> pd.Series:
    """Calculate Simple Moving Average."""
    s = pd.Series(prices)
    return s.rolling(window=window, min_periods=1).mean()

def calculate_ema(prices: Union[pd.Series, List[float], np.ndarray], window: int) -> pd.Series:
    """Calculate Exponential Moving Average."""
    s = pd.Series(prices)
    return s.ewm(span=window, adjust=False).mean()

def calculate_rsi(prices: Union[pd.Series, List[float], np.ndarray], window: int = 14) -> pd.Series:
    """
    Calculate Relative Strength Index (RSI) using Wilder's Exponential Smoothing.
    Returns series bounded between 0 and 100.
    """
    s = pd.Series(prices, dtype=float)
    delta = s.diff()
    
    gain = delta.clip(lower=0)
    loss = -1 * delta.clip(upper=0)
    
    # Wilder's exponential smoothing: alpha = 1 / window
    avg_gain = gain.ewm(alpha=1.0 / window, min_periods=window, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / window, min_periods=window, adjust=False).mean()
    
    rsi = pd.Series(50.0, index=s.index)
    both_zero = (avg_gain == 0) & (avg_loss == 0)
    loss_zero = (avg_loss == 0) & (avg_gain > 0)
    gain_zero = (avg_gain == 0) & (avg_loss > 0)
    normal = (avg_loss > 0) & (avg_gain > 0)

    rsi[both_zero] = 50.0
    rsi[loss_zero] = 100.0
    rsi[gain_zero] = 0.0
    
    rs = avg_gain[normal] / avg_loss[normal]
    rsi[normal] = 100.0 - (100.0 / (1.0 + rs))
    return rsi.fillna(50.0)

def calculate_macd(
    prices: Union[pd.Series, List[float], np.ndarray],
    fast: int = 12,
    slow: int = 26,
    signal: int = 9
) -> Dict[str, pd.Series]:
    """Calculate MACD line, Signal line, and Histogram."""
    s = pd.Series(prices, dtype=float)
    ema_fast = s.ewm(span=fast, adjust=False).mean()
    ema_slow = s.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return {
        "macd": macd_line,
        "signal": signal_line,
        "histogram": histogram
    }

def calculate_bollinger_bands(
    prices: Union[pd.Series, List[float], np.ndarray],
    window: int = 20,
    num_std: float = 2.0
) -> Dict[str, pd.Series]:
    """Calculate Middle (SMA), Upper, and Lower Bollinger Bands."""
    s = pd.Series(prices, dtype=float)
    middle = s.rolling(window=window, min_periods=1).mean()
    std = s.rolling(window=window, min_periods=1).std().fillna(0)
    upper = middle + (std * num_std)
    lower = middle - (std * num_std)
    return {
        "middle": middle,
        "upper": upper,
        "lower": lower
    }

def calculate_atr(
    high: Union[pd.Series, List[float], np.ndarray],
    low: Union[pd.Series, List[float], np.ndarray],
    close: Union[pd.Series, List[float], np.ndarray],
    window: int = 14
) -> pd.Series:
    """Calculate Average True Range (ATR)."""
    h = pd.Series(high, dtype=float)
    l = pd.Series(low, dtype=float)
    c = pd.Series(close, dtype=float)
    
    prev_close = c.shift(1)
    tr1 = h - l
    tr2 = (h - prev_close).abs()
    tr3 = (l - prev_close).abs()
    
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1.0 / window, min_periods=window, adjust=False).mean()
    return atr.fillna(tr.rolling(window=window, min_periods=1).mean())

def calculate_stochastic(
    high: Union[pd.Series, List[float], np.ndarray],
    low: Union[pd.Series, List[float], np.ndarray],
    close: Union[pd.Series, List[float], np.ndarray],
    k_window: int = 14,
    d_window: int = 3
) -> Dict[str, pd.Series]:
    """Calculate Stochastic %K and %D oscillators."""
    h = pd.Series(high, dtype=float)
    l = pd.Series(low, dtype=float)
    c = pd.Series(close, dtype=float)
    
    lowest_low = l.rolling(window=k_window, min_periods=1).min()
    highest_high = h.rolling(window=k_window, min_periods=1).max()
    
    range_hl = highest_high - lowest_low
    # Avoid zero division
    range_hl = range_hl.replace(0, np.nan)
    
    k = 100.0 * ((c - lowest_low) / range_hl)
    k = k.fillna(50.0)
    d = k.rolling(window=d_window, min_periods=1).mean()
    
    return {"k": k, "d": d}
