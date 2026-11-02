import numpy as np
from typing import Dict, Any, List

def calculate_fixed_fractional_position_size(
    entry_price: float,
    stop_loss: float,
    target_price: float,
    total_capital: float,
    risk_pct: float,
    side: str = "BUY"
) -> Dict[str, Any]:
    """
    Deterministic Fixed Fractional Position Sizing and Risk/Reward analysis.
    Formula:
      Risk Amount = Total Capital * (Risk % / 100)
      Per-Unit Risk = |Entry Price - Stop Loss|
      Position Size = floor(Risk Amount / Per-Unit Risk)
    """
    if entry_price <= 0 or stop_loss <= 0 or target_price <= 0 or total_capital <= 0 or risk_pct <= 0:
        return {
            "is_valid": False,
            "validation_message": "All prices, capital, and risk percentages must be strictly positive.",
            "position_size": 0,
        }

    # Validate direction
    if side == "BUY":
        if stop_loss >= entry_price:
            return {
                "is_valid": False,
                "validation_message": "For a BUY trade, Stop Loss must be strictly below Entry Price.",
                "position_size": 0,
            }
        if target_price <= entry_price:
            return {
                "is_valid": False,
                "validation_message": "For a BUY trade, Target Price must be strictly above Entry Price.",
                "position_size": 0,
            }
        per_share_risk = entry_price - stop_loss
        per_share_reward = target_price - entry_price
        stop_loss_pct = (per_share_risk / entry_price) * 100.0
        target_pct = (per_share_reward / entry_price) * 100.0
    else:  # SELL / SHORT
        if stop_loss <= entry_price:
            return {
                "is_valid": False,
                "validation_message": "For a SELL trade, Stop Loss must be strictly above Entry Price.",
                "position_size": 0,
            }
        if target_price >= entry_price:
            return {
                "is_valid": False,
                "validation_message": "For a SELL trade, Target Price must be strictly below Entry Price.",
                "position_size": 0,
            }
        per_share_risk = stop_loss - entry_price
        per_share_reward = entry_price - target_price
        stop_loss_pct = (per_share_risk / entry_price) * 100.0
        target_pct = (per_share_reward / entry_price) * 100.0

    risk_amount = total_capital * (risk_pct / 100.0)
    
    # Calculate raw shares
    raw_shares = risk_amount / per_share_risk
    position_size = int(np.floor(raw_shares))
    
    # Cap position size so capital required does not exceed total available capital (cash limit)
    capital_required = position_size * entry_price
    if capital_required > total_capital:
        position_size = int(np.floor(total_capital / entry_price))
        capital_required = position_size * entry_price

    if position_size <= 0:
        return {
            "is_valid": False,
            "validation_message": f"Calculated position size is 0. Per-share risk ({per_share_risk:.2f}) exceeds allocated risk amount ({risk_amount:.2f}) or capital is insufficient.",
            "position_size": 0,
            "risk_amount": risk_amount,
            "capital_required": 0.0,
            "max_loss": 0.0,
            "max_profit": 0.0,
            "risk_reward_ratio": 0.0,
            "exposure_pct": 0.0,
            "stop_loss_pct": stop_loss_pct,
            "target_pct": target_pct,
            "scenarios": [],
            "educational_notes": ["Increase total capital or risk percentage, or adjust stop loss closer to entry."]
        }

    actual_max_loss = position_size * per_share_risk
    actual_max_profit = position_size * per_share_reward
    risk_reward_ratio = round(per_share_reward / per_share_risk, 2)
    exposure_pct = (capital_required / total_capital) * 100.0

    # Build scenario matrix
    scenarios = [
        {
            "label": "-1R (Stop Loss Hit)",
            "exit_price": round(stop_loss, 2),
            "pnl": round(-actual_max_loss, 2),
            "pnl_pct": round(-stop_loss_pct if side == "BUY" else -stop_loss_pct, 2),
            "account_impact_pct": round((-actual_max_loss / total_capital) * 100.0, 2)
        },
        {
            "label": "Break-Even",
            "exit_price": round(entry_price, 2),
            "pnl": 0.0,
            "pnl_pct": 0.0,
            "account_impact_pct": 0.0
        },
        {
            "label": "+1R (1:1 Risk/Reward)",
            "exit_price": round(entry_price + per_share_risk if side == "BUY" else entry_price - per_share_risk, 2),
            "pnl": round(actual_max_loss, 2),
            "pnl_pct": round((per_share_risk / entry_price) * 100.0, 2),
            "account_impact_pct": round((actual_max_loss / total_capital) * 100.0, 2)
        },
        {
            "label": f"+{risk_reward_ratio}R (Planned Target)",
            "exit_price": round(target_price, 2),
            "pnl": round(actual_max_profit, 2),
            "pnl_pct": round(target_pct, 2),
            "account_impact_pct": round((actual_max_profit / total_capital) * 100.0, 2)
        }
    ]

    educational_notes = []
    if risk_reward_ratio < 1.5:
        educational_notes.append("Warning: Risk/Reward ratio is below 1.5:1. Seasoned traders typically seek at least 2:1.")
    if exposure_pct > 30.0:
        educational_notes.append("Caution: This single trade consumes over 30% of total capital. Consider reducing allocation.")
    if stop_loss_pct > 8.0:
        educational_notes.append("Wide stop-loss: Distance to stop loss is >8%. High volatility could cause larger drawdowns.")

    return {
        "is_valid": True,
        "validation_message": "Trade plan calculated successfully.",
        "position_size": position_size,
        "capital_required": round(capital_required, 2),
        "risk_amount": round(risk_amount, 2),
        "max_loss": round(actual_max_loss, 2),
        "max_profit": round(actual_max_profit, 2),
        "risk_reward_ratio": risk_reward_ratio,
        "exposure_pct": round(exposure_pct, 2),
        "stop_loss_pct": round(stop_loss_pct, 2),
        "target_pct": round(target_pct, 2),
        "scenarios": scenarios,
        "educational_notes": educational_notes
    }
