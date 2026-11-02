import time
from typing import Any, Optional, Dict
from app.core.config import settings

class MarketDataCache:
    """Fast cache with in-memory fallback and optional Redis backing."""

    def __init__(self):
        self._memory_cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        entry = self._memory_cache.get(key)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            del self._memory_cache[key]
            return None
        return entry["data"]

    def set(self, key: str, value: Any, ttl_seconds: int = 60) -> None:
        self._memory_cache[key] = {
            "data": value,
            "expires_at": time.time() + ttl_seconds
        }

    def clear(self) -> None:
        self._memory_cache.clear()

market_cache = MarketDataCache()
