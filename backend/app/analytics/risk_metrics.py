import numpy as np
import pandas as pd
from typing import Dict, Any, Union, List, Tuple

def calculate_max_drawdown(prices_or_equity: Union[pd.Series, List[float], np.ndarray]) -> Dict[str, Any]:
    """
    Calculate Maximum Drawdown (percentage) and Max Drawdown Duration (periods).
    """
    s = pd.Series(prices_or_equity, dtype=float)
    if len(s) == 0:
        return {"max_drawdown_pct": 0.0, "max_drawdown_duration": 0}
    
    running_max = s.cummax()
    drawdown = (s - running_max) / running_max
    max_dd = float(drawdown.min())  # negative float, e.g. -0.15 for 15%
    
    # Calculate duration (number of periods spent in drawdown)
    is_in_dd = drawdown < 0
    duration = 0
    max_duration = 0
    for in_dd in is_in_dd:
        if in_dd:
            duration += 1
            if duration > max_duration:
                max_duration = duration
        else:
            duration = 0
            
    return {
        "max_drawdown_pct": abs(max_dd) * 100.0,  # return positive percentage
        "max_drawdown_duration": max_duration
    }

def calculate_parametric_var(
    returns: Union[pd.Series, List[float], np.ndarray],
    confidence_level: float = 0.95
) -> float:
    """
    Calculate Parametric (Variance-Covariance) 1-day Value at Risk (VaR).
    Assumes standard normal distribution:
    confidence 0.95 -> z = 1.6449
    confidence 0.99 -> z = 2.3263
    """
    r = pd.Series(returns, dtype=float).dropna()
    if len(r) < 2:
        return 0.0
    
    mean = float(r.mean())
    std = float(r.std(ddof=1))
    
    # Z-score approximations
    if confidence_level >= 0.99:
        z = 2.3263
    elif confidence_level >= 0.95:
        z = 1.6449
    elif confidence_level >= 0.90:
        z = 1.2816
    else:
        z = 1.6449
        
    var = -(mean - z * std)
    return float(max(0.0, var * 100.0))  # as positive percentage

def calculate_historical_var(
    returns: Union[pd.Series, List[float], np.ndarray],
    confidence_level: float = 0.95
) -> float:
    """Calculate non-parametric historical simulation 1-day Value at Risk (VaR)."""
    r = pd.Series(returns, dtype=float).dropna()
    if len(r) < 5:
        return 0.0
    percentile = (1.0 - confidence_level) * 100.0
    var = -np.percentile(r, percentile)
    return float(max(0.0, var * 100.0))

def calculate_sharpe_ratio(
    returns: Union[pd.Series, List[float], np.ndarray],
    risk_free_rate: float = 0.06,  # 6% annual risk-free rate
    trading_days: int = 252
) -> float:
    """Calculate Annualized Sharpe Ratio."""
    r = pd.Series(returns, dtype=float).dropna()
    if len(r) < 2:
        return 0.0
    
    daily_rf = (1.0 + risk_free_rate) ** (1.0 / trading_days) - 1.0
    excess_returns = r - daily_rf
    mean_excess = float(excess_returns.mean())
    std_excess = float(excess_returns.std(ddof=1))
    
    if std_excess == 0:
        return 0.0
    
    daily_sharpe = mean_excess / std_excess
    return float(daily_sharpe * np.sqrt(trading_days))

def calculate_sortino_ratio(
    returns: Union[pd.Series, List[float], np.ndarray],
    risk_free_rate: float = 0.06,
    trading_days: int = 252
) -> float:
    """Calculate Annualized Sortino Ratio using downside deviation."""
    r = pd.Series(returns, dtype=float).dropna()
    if len(r) < 2:
        return 0.0
        
    daily_rf = (1.0 + risk_free_rate) ** (1.0 / trading_days) - 1.0
    excess_returns = r - daily_rf
    mean_excess = float(excess_returns.mean())
    
    downside_returns = excess_returns[excess_returns < 0]
    if len(downside_returns) < 2:
        return 0.0
        
    downside_std = float(np.sqrt((downside_returns ** 2).mean()))
    if downside_std == 0:
        return 0.0
        
    return float((mean_excess / downside_std) * np.sqrt(trading_days))

def calculate_beta(
    asset_returns: Union[pd.Series, List[float], np.ndarray],
    benchmark_returns: Union[pd.Series, List[float], np.ndarray]
) -> float:
    """Calculate Beta coefficient: Cov(Asset, Benchmark) / Var(Benchmark)."""
    a = pd.Series(asset_returns, dtype=float)
    b = pd.Series(benchmark_returns, dtype=float)
    
    df = pd.concat([a, b], axis=1).dropna()
    if len(df) < 5:
        return 1.0  # default to market beta
        
    cov = float(df.iloc[:, 0].cov(df.iloc[:, 1]))
    var = float(df.iloc[:, 1].var())
    
    if var == 0:
        return 1.0
    return float(cov / var)
