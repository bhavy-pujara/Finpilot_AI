from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.instrument import InstrumentOut

class WatchlistItemAdd(BaseModel):
    instrument_id: int
    target_price: Optional[float] = None
    notes: Optional[str] = None

class WatchlistItemOut(BaseModel):
    id: int
    instrument_id: int
    added_price: Optional[float] = None
    target_price: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    instrument: InstrumentOut

    class Config:
        from_attributes = True

class WatchlistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_default: bool = False

class WatchlistOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_default: bool
    created_at: datetime
    items: List[WatchlistItemOut] = []

    class Config:
        from_attributes = True
