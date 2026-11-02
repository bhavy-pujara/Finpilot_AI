from typing import Tuple, Optional
from app.models.paper_trading import PaperAccount
from app.models.instrument import Instrument

def validate_paper_order(
    account: PaperAccount,
    instrument: Instrument,
    side: str,
    order_type: str,
    quantity: int,
    price: Optional[float] = None,
    trigger_price: Optional[float] = None
) -> Tuple[bool, Optional[str]]:
    """
    Validates a proposed paper order against account balance, price bounds, and simulation rules.
    """
    if quantity <= 0:
        return False, "Order quantity must be a strictly positive integer."

    current_price = float(instrument.current_price)
    if current_price <= 0:
        return False, "Instrument has no valid market price available."

    if order_type in ("LIMIT", "STOP_LIMIT"):
        if not price or price <= 0:
            return False, f"Order type {order_type} requires a positive limit price."

    if order_type in ("STOP_MARKET", "STOP_LIMIT"):
        if not trigger_price or trigger_price <= 0:
            return False, f"Order type {order_type} requires a positive trigger price."

    effective_price = price if order_type == "LIMIT" and price else current_price
    required_capital = float(effective_price) * quantity

    # If BUY, check cash balance
    if side == "BUY":
        # Include buffer for estimated slippage & commission (0.2%)
        estimated_total_cost = required_capital * 1.002
        if float(account.cash_balance) < estimated_total_cost:
            currency = account.currency
            return False, (
                f"Insufficient virtual cash balance. Required: {currency} {estimated_total_cost:,.2f}, "
                f"Available: {currency} {float(account.cash_balance):,.2f}."
            )

    return True, None
