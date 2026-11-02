import numpy as np
import pandas as pd
from typing import Union, List

def calculate_simple_returns(prices: Union[pd.Series, List[float], np.ndarray]) -> pd.Series:
    """Calculate percentage change simple returns."""
    s = pd.Series(prices, dtype=float)
    return s.pct_change().fillna(0.0)

def calculate_log_returns(prices: Union[pd.Series, List[float], np.ndarray]) -> pd.Series:
    """Calculate continuous logarithmic returns."""
    s = pd.Series(prices, dtype=float)
    return np.log(s / s.shift(1)).fillna(0.0)

def calculate_cumulative_returns(returns: Union[pd.Series, List[float], np.ndarray]) -> pd.Series:
    """Calculate cumulative compounded return from periodic returns."""
    r = pd.Series(returns, dtype=float)
    return (1.0 + r).cumprod() - 1.0

def calculate_rolling_returns(prices: Union[pd.Series, List[float], np.ndarray], window: int = 21) -> pd.Series:
    """Calculate rolling N-period percentage returns."""
    s = pd.Series(prices, dtype=float)
    return s.pct_change(periods=window).fillna(0.0)
