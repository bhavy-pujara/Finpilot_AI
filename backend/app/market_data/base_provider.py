from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class BaseMarketDataProvider(ABC):
    """Abstract interface for financial market data providers."""

    @abstractmethod
    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Fetch current quote for an instrument."""
        pass

    @abstractmethod
    def get_historical_candles(
        self,
        symbol: str,
        interval: str = "1d",
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Fetch historical OHLCV candle data."""
        pass

    @abstractmethod
    def get_financial_metrics(self, symbol: str) -> Dict[str, Any]:
        """Fetch fundamental financial metrics (P/E, Market Cap, Beta, etc.)."""
        pass

    @abstractmethod
    def search_instruments(self, query: str) -> List[Dict[str, Any]]:
        """Search instruments across supported exchanges."""
        pass
