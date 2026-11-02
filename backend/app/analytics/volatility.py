import numpy as np
import pandas as pd
from typing import Union, List

def calculate_historical_volatility(
    returns: Union[pd.Series, List[float], np.ndarray],
    trading_days: int = 252
) -> float:
    """Calculate annualized historical volatility from daily returns."""
    r = pd.Series(returns, dtype=float).dropna()
    if len(r) < 2:
        return 0.0
    daily_std = float(r.std(ddof=1))
    annualized_vol = daily_std * np.sqrt(trading_days)
    return float(annualized_vol)

def calculate_rolling_volatility(
    returns: Union[pd.Series, List[float], np.ndarray],
    window: int = 20,
    trading_days: int = 252
) -> pd.Series:
    """Calculate rolling annualized volatility."""
    r = pd.Series(returns, dtype=float)
    return r.rolling(window=window, min_periods=2).std() * np.sqrt(trading_days)
