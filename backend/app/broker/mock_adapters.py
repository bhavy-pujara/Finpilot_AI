from datetime import datetime, timezone
from typing import Dict, Any, List
from app.broker.base_broker import BaseBrokerAdapter

class MockZerodhaKiteAdapter(BaseBrokerAdapter):
    """Mock adapter modeling Zerodha Kite Connect API."""

    def __init__(self, client_id: str = "FIN_MOCK_ZK01"):
        self.client_id = client_id

    def get_profile(self) -> Dict[str, Any]:
        return {
            "broker": "Zerodha Kite Connect",
            "client_id": self.client_id,
            "status": "MOCK_CONNECTED",
            "exchanges": ["NSE", "BSE"],
            "segment": ["Equity Cash", "Equity Futures"],
            "live_orders_allowed": False,
            "simulation_label": "MOCK KITE CONNECT SESSION"
        }

    def get_positions(self) -> List[Dict[str, Any]]:
        return [
            {"tradingsymbol": "RELIANCE", "exchange": "NSE", "quantity": 25, "average_price": 2920.0, "pnl": 512.50},
            {"tradingsymbol": "TCS", "exchange": "NSE", "quantity": 10, "average_price": 4095.0, "pnl": 250.00}
        ]

    def get_orders(self) -> List[Dict[str, Any]]:
        return [
            {"order_id": "2410310001", "symbol": "RELIANCE", "transaction_type": "BUY", "quantity": 25, "status": "COMPLETE", "tag": "MOCK"}
        ]

    def quote_simulated_order(self, symbol: str, side: str, quantity: int) -> Dict[str, Any]:
        return {
            "broker": "Zerodha",
            "symbol": symbol,
            "side": side,
            "quantity": quantity,
            "brokerage": 20.0,
            "stt": 12.50,
            "exchange_txn_charge": 3.45,
            "gst": 4.22,
            "total_charges": 40.17,
            "estimated_slippage": "0.05%",
            "simulation_disclaimer": "Real orders are disabled. This calculation models standard SEBI & broker charge structures."
        }

class MockAngelOneAdapter(BaseBrokerAdapter):
    """Mock adapter modeling Angel One SmartAPI."""

    def __init__(self, client_id: str = "FIN_MOCK_ANGEL"):
        self.client_id = client_id

    def get_profile(self) -> Dict[str, Any]:
        return {
            "broker": "Angel One SmartAPI",
            "client_id": self.client_id,
            "status": "MOCK_CONNECTED",
            "exchanges": ["NSE", "BSE"],
            "live_orders_allowed": False
        }

    def get_positions(self) -> List[Dict[str, Any]]:
        return []

    def get_orders(self) -> List[Dict[str, Any]]:
        return []

    def quote_simulated_order(self, symbol: str, side: str, quantity: int) -> Dict[str, Any]:
        return {
            "broker": "Angel One",
            "symbol": symbol,
            "brokerage": 20.0,
            "total_charges": 38.50,
            "simulation_disclaimer": "Simulated Angel One quote for validation."
        }

class MockAlpacaAdapter(BaseBrokerAdapter):
    """Mock adapter modeling Alpaca Broker API for US equities."""

    def __init__(self, account_id: str = "FIN_MOCK_ALPAC"):
        self.account_id = account_id

    def get_profile(self) -> Dict[str, Any]:
        return {
            "broker": "Alpaca Trading API (US)",
            "account_id": self.account_id,
            "status": "MOCK_CONNECTED",
            "currency": "USD",
            "buying_power": 100000.0,
            "live_orders_allowed": False
        }

    def get_positions(self) -> List[Dict[str, Any]]:
        return [
            {"symbol": "AAPL", "qty": 50, "avg_entry_price": 228.40, "market_value": 11625.0, "unrealized_pl": 205.0}
        ]

    def get_orders(self) -> List[Dict[str, Any]]:
        return []

    def quote_simulated_order(self, symbol: str, side: str, quantity: int) -> Dict[str, Any]:
        return {
            "broker": "Alpaca",
            "symbol": symbol,
            "commission": 0.0,
            "sec_fee": 0.05,
            "finra_taf": 0.02,
            "total_charges": 0.07,
            "estimated_slippage": "0.04%",
            "simulation_disclaimer": "Simulated zero-commission US broker estimate."
        }
