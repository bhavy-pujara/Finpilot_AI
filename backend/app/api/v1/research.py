from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any

from app.api.deps import get_db, get_current_user, get_llm_provider
from app.models.user import User
from app.models.instrument import Instrument, FinancialMetric, NewsArticle
from app.models.research import ResearchReport, ResearchSource
from app.schemas.research import ResearchReportRequest
from app.ai.usage_tracker import record_ai_usage

router = APIRouter()

@router.post("/generate")
def generate_stock_research_report(
    req: ResearchReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    llm = Depends(get_llm_provider)
):
    inst = db.query(Instrument).filter(Instrument.id == req.instrument_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found.")

    # 1. Fetch latest metrics
    metric = db.query(FinancialMetric).filter(
        FinancialMetric.instrument_id == inst.id
    ).order_by(FinancialMetric.metric_date.desc()).first()

    metrics_dict = {
        "current_price": float(inst.current_price),
        "pe_ratio": metric.pe_ratio if metric else 24.5,
        "pb_ratio": metric.pb_ratio if metric else 3.2,
        "roe": metric.roe if metric else 18.5,
        "debt_to_equity": metric.debt_to_equity if metric else 0.45,
        "beta": metric.beta if metric else 1.05,
        "dividend_yield": metric.dividend_yield if metric else 0.8,
        "market_cap": float(metric.market_cap) if metric and metric.market_cap else 15000000000.0,
    }

    # 2. Fetch recent news
    news_items = db.query(NewsArticle).filter(
        NewsArticle.instrument_id == inst.id
    ).limit(3).all()
    news_list = [{"title": n.title, "summary": n.summary, "source": n.source} for n in news_items]

    # 3. Generate structured report via LLM provider
    report_data = llm.generate_research_report(
        symbol=inst.symbol,
        company_name=inst.name,
        metrics=metrics_dict,
        recent_news=news_list
    )

    # 4. Save to Database
    now = datetime.now(timezone.utc)
    report = ResearchReport(
        instrument_id=inst.id,
        user_id=current_user.id,
        title=report_data["title"],
        company_overview=report_data["company_overview"],
        business_model=report_data["business_model"],
        bull_thesis=report_data["bull_thesis"],
        bear_thesis=report_data["bear_thesis"],
        risk_factors=report_data["risk_factors"],
        financial_analysis=report_data["financial_analysis"],
        technical_summary=report_data["technical_summary"],
        data_quality_warnings=report_data["data_quality_warnings"],
        metrics_snapshot=metrics_dict,
        generated_at=now
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Add sources
    for src in report_data.get("sources", []):
        db.add(ResearchSource(
            report_id=report.id,
            title=src["title"],
            source_type=src.get("source_type", "filing"),
            timestamp_retrieved=now,
            confidence_score=src.get("confidence_score", 1.0)
        ))
    db.commit()

    # Record AI Usage
    record_ai_usage(
        db=db,
        user_id=current_user.id,
        model_name="finpilot-research-engine",
        request_type="research_report",
        prompt_tokens=350,
        completion_tokens=650
    )

    return {
        "id": report.id,
        "instrument_id": inst.id,
        "symbol": inst.symbol,
        "name": inst.name,
        "title": report.title,
        "company_overview": report.company_overview,
        "business_model": report.business_model,
        "bull_thesis": report.bull_thesis,
        "bear_thesis": report.bear_thesis,
        "risk_factors": report.risk_factors,
        "financial_analysis": report.financial_analysis,
        "technical_summary": report.technical_summary,
        "data_quality_warnings": report.data_quality_warnings,
        "metrics_snapshot": report.metrics_snapshot,
        "sources": report_data.get("sources", []),
        "generated_at": report.generated_at.isoformat(),
        "data_freshness_label": "HISTORICAL / DEMO REPORT"
    }

@router.get("/latest/{instrument_id}")
def get_latest_report(
    instrument_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(ResearchReport).filter(
        ResearchReport.instrument_id == instrument_id
    ).order_by(ResearchReport.generated_at.desc()).first()

    if not report:
        raise HTTPException(status_code=404, detail="No previous research report found for this instrument.")

    inst = db.query(Instrument).filter(Instrument.id == instrument_id).first()
    sources = db.query(ResearchSource).filter(ResearchSource.report_id == report.id).all()

    return {
        "id": report.id,
        "instrument_id": report.instrument_id,
        "symbol": inst.symbol if inst else "",
        "name": inst.name if inst else "",
        "title": report.title,
        "company_overview": report.company_overview,
        "business_model": report.business_model,
        "bull_thesis": report.bull_thesis,
        "bear_thesis": report.bear_thesis,
        "risk_factors": report.risk_factors,
        "financial_analysis": report.financial_analysis,
        "technical_summary": report.technical_summary,
        "data_quality_warnings": report.data_quality_warnings,
        "metrics_snapshot": report.metrics_snapshot,
        "sources": [
            {
                "title": s.title,
                "source_type": s.source_type,
                "timestamp_retrieved": s.timestamp_retrieved.isoformat(),
                "confidence_score": s.confidence_score
            } for s in sources
        ],
        "generated_at": report.generated_at.isoformat(),
        "data_freshness_label": "HISTORICAL / DEMO REPORT"
    }
