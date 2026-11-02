from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.watchlist import Watchlist, WatchlistItem
from app.models.instrument import Instrument
from app.schemas.watchlist import WatchlistCreate, WatchlistItemAdd

router = APIRouter()

@router.get("/")
def get_user_watchlists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    watchlists = db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()
    results = []
    for wl in watchlists:
        items = []
        for item in wl.items:
            inst = item.instrument
            items.append({
                "id": item.id,
                "instrument_id": item.instrument_id,
                "added_price": float(item.added_price) if item.added_price else None,
                "target_price": float(item.target_price) if item.target_price else None,
                "notes": item.notes,
                "created_at": item.created_at.isoformat(),
                "instrument": {
                    "id": inst.id,
                    "symbol": inst.symbol,
                    "name": inst.name,
                    "sector": inst.sector,
                    "currency": inst.currency,
                    "current_price": float(inst.current_price),
                    "change_pct": float(inst.change_pct),
                    "day_high": float(inst.day_high),
                    "day_low": float(inst.day_low),
                    "volume_24h": float(inst.volume_24h),
                    "exchange_code": inst.exchange.code if inst.exchange else "NSE",
                    "data_source_label": "SIMULATED / DEMO"
                }
            })
        results.append({
            "id": wl.id,
            "name": wl.name,
            "description": wl.description,
            "is_default": wl.is_default,
            "created_at": wl.created_at.isoformat(),
            "items": items
        })
    return results

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_watchlist(
    wl_in: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wl = Watchlist(
        user_id=current_user.id,
        name=wl_in.name,
        description=wl_in.description,
        is_default=wl_in.is_default
    )
    db.add(wl)
    db.commit()
    db.refresh(wl)
    return {"id": wl.id, "name": wl.name, "message": "Watchlist created successfully."}

@router.post("/{watchlist_id}/items", status_code=status.HTTP_201_CREATED)
def add_instrument_to_watchlist(
    watchlist_id: int,
    item_in: WatchlistItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wl = db.query(Watchlist).filter(
        Watchlist.id == watchlist_id,
        Watchlist.user_id == current_user.id
    ).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Watchlist not found.")

    inst = db.query(Instrument).filter(Instrument.id == item_in.instrument_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found.")

    # Check if already in watchlist
    existing = db.query(WatchlistItem).filter(
        WatchlistItem.watchlist_id == wl.id,
        WatchlistItem.instrument_id == inst.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Instrument is already in this watchlist.")

    item = WatchlistItem(
        watchlist_id=wl.id,
        instrument_id=inst.id,
        added_price=inst.current_price,
        target_price=item_in.target_price,
        notes=item_in.notes
    )
    db.add(item)
    db.commit()
    return {"message": f"Added {inst.symbol} to watchlist '{wl.name}'."}

@router.delete("/items/{item_id}")
def delete_watchlist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(WatchlistItem).join(Watchlist).filter(
        WatchlistItem.id == item_id,
        Watchlist.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found.")
    
    db.delete(item)
    db.commit()
    return {"message": "Watchlist item removed."}
