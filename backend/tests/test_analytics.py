import pytest
import numpy as np
import pandas as pd
from app.analytics.indicators import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands,
    calculate_atr
)
from app.analytics.returns import calculate_simple_returns, calculate_cumulative_returns
from app.analytics.volatility import calculate_historical_volatility
from app.analytics.risk_metrics import (
    calculate_parametric_var,
    calculate_max_drawdown,
    calculate_sharpe_ratio,
    calculate_sortino_ratio,
    calculate_beta
)
from app.analytics.position_sizing import calculate_fixed_fractional_position_size
from app.analytics.portfolio_math import calculate_portfolio_hhi, get_hhi_category

def test_sma_calculation():
    prices = [10.0, 11.0, 12.0, 13.0, 14.0]
    sma = calculate_sma(prices, window=3)
    # The 3-period SMA of 12, 13, 14 is (12+13+14)/3 = 13.0
    assert round(float(sma.iloc[-1]), 4) == 13.0

def test_ema_calculation():
    prices = [10.0, 10.0, 10.0, 12.0, 14.0]
    ema = calculate_ema(prices, window=3)
    assert len(ema) == len(prices)
    assert float(ema.iloc[-1]) > 10.0

def test_rsi_bounds_and_values():
    # Constant ascending series should have high RSI
    up_prices = [10 + i * 2 for i in range(25)]
    rsi_up = calculate_rsi(up_prices, window=14)
    assert float(rsi_up.iloc[-1]) > 90.0

    # Constant descending series should have low RSI
    down_prices = [100 - i * 2 for i in range(25)]
    rsi_down = calculate_rsi(down_prices, window=14)
    assert float(rsi_down.iloc[-1]) < 15.0

def test_macd_calculation():
    prices = [100.0 + np.sin(i / 3.0) * 10 for i in range(50)]
    macd_res = calculate_macd(prices)
    assert "macd" in macd_res
    assert "signal" in macd_res
    assert "histogram" in macd_res
    assert len(macd_res["macd"]) == 50

def test_bollinger_bands_calculation():
    prices = [100.0] * 20
    bb = calculate_bollinger_bands(prices, window=20, num_std=2.0)
    # Flat series: std is 0, middle == upper == lower == 100.0
    assert round(float(bb["middle"].iloc[-1]), 2) == 100.0
    assert round(float(bb["upper"].iloc[-1]), 2) == 100.0
    assert round(float(bb["lower"].iloc[-1]), 2) == 100.0

def test_max_drawdown():
    # 100 -> 120 -> 90 -> 110
    # Peak is 120, trough is 90. Drawdown = (90 - 120) / 120 = -30 / 120 = -25%
    equity = [100.0, 120.0, 90.0, 110.0]
    dd = calculate_max_drawdown(equity)
    assert round(dd["max_drawdown_pct"], 2) == 25.0

def test_parametric_var():
    returns = np.array([0.01, -0.01, 0.02, -0.015, 0.005, -0.02, 0.012])
    var_95 = calculate_parametric_var(returns, confidence_level=0.95)
    assert var_95 >= 0.0

def test_sharpe_and_sortino():
    # Consistent positive returns
    returns = [0.01, 0.015, 0.008, 0.012, 0.014] * 10
    sharpe = calculate_sharpe_ratio(returns, risk_free_rate=0.06)
    assert sharpe > 0.0

def test_beta_calculation():
    market = np.array([0.01, 0.02, -0.01, 0.03, -0.02])
    # Asset with exact 2x leverage
    asset = market * 2.0
    beta = calculate_beta(asset, market)
    assert round(beta, 2) == 2.0

def test_position_sizing_fixed_risk():
    # Total capital: 1,000,000, Risk: 1% = 10,000 risk amount
    # Entry: 2900, Stop Loss: 2800 -> Risk per share = 100
    # Target: 3100 -> Reward per share = 200
    # Position size = 10,000 / 100 = 100 shares
    # R:R = 200 / 100 = 2.0
    plan = calculate_fixed_fractional_position_size(
        entry_price=2900.0,
        stop_loss=2800.0,
        target_price=3100.0,
        total_capital=1000000.0,
        risk_pct=1.0,
        side="BUY"
    )
    assert plan["is_valid"] is True
    assert plan["position_size"] == 100
    assert plan["capital_required"] == 290000.0
    assert plan["max_loss"] == 10000.0
    assert plan["max_profit"] == 20000.0
    assert plan["risk_reward_ratio"] == 2.0

def test_position_sizing_direction_validation():
    # BUY with stop loss above entry should fail validation
    invalid_plan = calculate_fixed_fractional_position_size(
        entry_price=100.0,
        stop_loss=110.0,
        target_price=120.0,
        total_capital=10000.0,
        risk_pct=1.0,
        side="BUY"
    )
    assert invalid_plan["is_valid"] is False

def test_portfolio_hhi():
    # 4 equal holdings of 25% each: HHI = 4 * (25^2) = 4 * 625 = 2500
    hhi = calculate_portfolio_hhi([25.0, 25.0, 25.0, 25.0])
    assert hhi == 2500.0
    cat = get_hhi_category(hhi)
    assert "Concentrated" in cat
