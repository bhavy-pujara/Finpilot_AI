from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.instrument import Instrument
from app.models.journal import TradingJournalEntry
from app.schemas.journal import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryOut,
    JournalAnalyticsOut,
    StrategyPerformance
)

router = APIRouter()

@router.get("/", response_model=List[JournalEntryOut])
def list_journal_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(TradingJournalEntry).filter(
        TradingJournalEntry.user_id == current_user.id
    ).order_by(TradingJournalEntry.entry_date.desc()).all()

    results = []
    for e in entries:
        inst = e.instrument
        results.append(JournalEntryOut(
            id=e.id,
            instrument_id=e.instrument_id,
            symbol=inst.symbol if inst else "",
            trade_type=e.trade_type,
            side=e.side,
            entry_date=e.entry_date,
            exit_date=e.exit_date,
            entry_price=float(e.entry_price),
            exit_price=float(e.exit_price) if e.exit_price else None,
            quantity=e.quantity,
            realized_pnl=float(e.realized_pnl),
            strategy_tag=e.strategy_tag,
            emotional_state=e.emotional_state,
            rationale=e.rationale,
            mistakes=e.mistakes,
            lessons_learned=e.lessons_learned,
            rating=e.rating,
            created_at=e.created_at
        ))
    return results

@router.post("/", response_model=JournalEntryOut, status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    entry_in: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inst = db.query(Instrument).filter(Instrument.id == entry_in.instrument_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found.")

    pnl = 0.0
    if entry_in.exit_price and entry_in.exit_date:
        if entry_in.side == "BUY":
            pnl = (entry_in.exit_price - entry_in.entry_price) * entry_in.quantity
        else:
            pnl = (entry_in.entry_price - entry_in.exit_price) * entry_in.quantity

    entry = TradingJournalEntry(
        user_id=current_user.id,
        instrument_id=inst.id,
        trade_plan_id=entry_in.trade_plan_id,
        paper_order_id=entry_in.paper_order_id,
        trade_type=entry_in.trade_type,
        side=entry_in.side,
        entry_date=entry_in.entry_date,
        exit_date=entry_in.exit_date,
        entry_price=entry_in.entry_price,
        exit_price=entry_in.exit_price,
        quantity=entry_in.quantity,
        realized_pnl=round(pnl, 2),
        strategy_tag=entry_in.strategy_tag,
        emotional_state=entry_in.emotional_state,
        rationale=entry_in.rationale,
        mistakes=entry_in.mistakes,
        lessons_learned=entry_in.lessons_learned,
        rating=entry_in.rating
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return JournalEntryOut(
        id=entry.id,
        instrument_id=entry.instrument_id,
        symbol=inst.symbol,
        trade_type=entry.trade_type,
        side=entry.side,
        entry_date=entry.entry_date,
        exit_date=entry.exit_date,
        entry_price=float(entry.entry_price),
        exit_price=float(entry.exit_price) if entry.exit_price else None,
        quantity=entry.quantity,
        realized_pnl=float(entry.realized_pnl),
        strategy_tag=entry.strategy_tag,
        emotional_state=entry.emotional_state,
        rationale=entry.rationale,
        mistakes=entry.mistakes,
        lessons_learned=entry.lessons_learned,
        rating=entry.rating,
        created_at=entry.created_at
    )

@router.put("/{entry_id}", response_model=JournalEntryOut)
def update_journal_entry(
    entry_id: int,
    entry_in: JournalEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(TradingJournalEntry).filter(
        TradingJournalEntry.id == entry_id,
        TradingJournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found.")

    if entry_in.exit_date is not None:
        entry.exit_date = entry_in.exit_date
    if entry_in.exit_price is not None:
        entry.exit_price = entry_in.exit_price
        # Recalculate pnl
        if entry.side == "BUY":
            entry.realized_pnl = (float(entry_in.exit_price) - float(entry.entry_price)) * entry.quantity
        else:
            entry.realized_pnl = (float(entry.entry_price) - float(entry_in.exit_price)) * entry.quantity
    if entry_in.strategy_tag is not None:
        entry.strategy_tag = entry_in.strategy_tag
    if entry_in.emotional_state is not None:
        entry.emotional_state = entry_in.emotional_state
    if entry_in.rationale is not None:
        entry.rationale = entry_in.rationale
    if entry_in.mistakes is not None:
        entry.mistakes = entry_in.mistakes
    if entry_in.lessons_learned is not None:
        entry.lessons_learned = entry_in.lessons_learned
    if entry_in.rating is not None:
        entry.rating = entry_in.rating

    db.commit()
    db.refresh(entry)

    inst = entry.instrument
    return JournalEntryOut(
        id=entry.id,
        instrument_id=entry.instrument_id,
        symbol=inst.symbol if inst else "",
        trade_type=entry.trade_type,
        side=entry.side,
        entry_date=entry.entry_date,
        exit_date=entry.exit_date,
        entry_price=float(entry.entry_price),
        exit_price=float(entry.exit_price) if entry.exit_price else None,
        quantity=entry.quantity,
        realized_pnl=float(entry.realized_pnl),
        strategy_tag=entry.strategy_tag,
        emotional_state=entry.emotional_state,
        rationale=entry.rationale,
        mistakes=entry.mistakes,
        lessons_learned=entry.lessons_learned,
        rating=entry.rating,
        created_at=entry.created_at
    )

@router.delete("/{entry_id}")
def delete_journal_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(TradingJournalEntry).filter(
        TradingJournalEntry.id == entry_id,
        TradingJournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted."}

@router.get("/analytics", response_model=JournalAnalyticsOut)
def get_journal_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(TradingJournalEntry).filter(
        TradingJournalEntry.user_id == current_user.id,
        TradingJournalEntry.exit_price != None
    ).all()

    total_trades = len(entries)
    if total_trades == 0:
        return JournalAnalyticsOut(
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
            win_rate_pct=0.0,
            profit_factor=0.0,
            average_win=0.0,
            average_loss=0.0,
            expectancy=0.0,
            strategy_breakdown=[]
        )

    winning = [float(e.realized_pnl) for e in entries if float(e.realized_pnl) > 0]
    losing = [abs(float(e.realized_pnl)) for e in entries if float(e.realized_pnl) < 0]

    win_count = len(winning)
    loss_count = len(losing)
    win_rate = (win_count / total_trades) * 100.0

    total_win_amt = sum(winning)
    total_loss_amt = sum(losing)
    profit_factor = (total_win_amt / total_loss_amt) if total_loss_amt > 0 else (total_win_amt if total_win_amt > 0 else 0.0)

    avg_win = (total_win_amt / win_count) if win_count > 0 else 0.0
    avg_loss = (total_loss_amt / loss_count) if loss_count > 0 else 0.0

    # Expectancy formula: (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
    win_prob = win_count / total_trades
    loss_prob = loss_count / total_trades
    expectancy = (win_prob * avg_win) - (loss_prob * avg_loss)

    # Strategy breakdown
    strat_map = {}
    for e in entries:
        st = e.strategy_tag
        if st not in strat_map:
            strat_map[st] = {"trades": 0, "wins": 0, "pnl": 0.0}
        strat_map[st]["trades"] += 1
        strat_map[st]["pnl"] += float(e.realized_pnl)
        if float(e.realized_pnl) > 0:
            strat_map[st]["wins"] += 1

    strategy_breakdown = [
        StrategyPerformance(
            strategy=k,
            trade_count=v["trades"],
            win_rate=round((v["wins"] / v["trades"]) * 100.0, 1),
            net_pnl=round(v["pnl"], 2)
        )
        for k, v in strat_map.items()
    ]

    return JournalAnalyticsOut(
        total_trades=total_trades,
        winning_trades=win_count,
        losing_trades=loss_count,
        win_rate_pct=round(win_rate, 1),
        profit_factor=round(profit_factor, 2),
        average_win=round(avg_win, 2),
        average_loss=round(avg_loss, 2),
        expectancy=round(expectancy, 2),
        strategy_breakdown=strategy_breakdown
    )
