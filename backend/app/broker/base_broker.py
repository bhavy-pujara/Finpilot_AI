from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseBrokerAdapter(ABC):
    """Abstract interface for brokerage platform adapters."""

    @abstractmethod
    def get_profile(self) -> Dict[str, Any]:
        """Fetch mock account profile."""
        pass

    @abstractmethod
    def get_positions(self) -> List[Dict[str, Any]]:
        """Fetch positions."""
        pass

    @abstractmethod
    def get_orders(self) -> List[Dict[str, Any]]:
        """Fetch orders."""
        pass

    @abstractmethod
    def quote_simulated_order(self, symbol: str, side: str, quantity: int) -> Dict[str, Any]:
        """Estimate brokerage fees, taxes (STT/GST), and slippage for simulated order approval."""
        pass
