from fastapi import APIRouter

router = APIRouter()

LEGAL_DOCS = {
    "terms": {
        "title": "Terms of Service",
        "last_updated": "October 2026",
        "status": "DRAFT - Subject to Formal Regulatory Review",
        "content": (
            "FinPilot AI is a financial technology software application offering market analytics, simulated paper trading, "
            "and quantitative research copilot tools. By accessing or using FinPilot AI, you acknowledge that the application "
            "operates exclusively as an informational and educational platform. You agree not to construe any report, calculation, "
            "or AI output as registered investment advice. Real order execution is strictly disabled."
        )
    },
    "privacy": {
        "title": "Privacy Policy",
        "last_updated": "October 2026",
        "status": "DRAFT - Subject to Qualified Legal Counsel",
        "content": (
            "FinPilot AI respects user confidentiality. We collect account identifiers (email, name) and user configuration "
            "data strictly to personalize your analytical experience. We do not store brokerage account passwords or execute "
            "unauthorized telemetry. Market queries and AI prompts are scrubbed of personal financial identifiers prior to model processing."
        )
    },
    "risk_disclosure": {
        "title": "Comprehensive Risk Disclosure",
        "last_updated": "October 2026",
        "status": "MANDATORY FINANCIAL NOTICE",
        "content": (
            "Securities trading involves substantial risk of loss and is not suitable for every investor. The valuation of equities, "
            "derivatives, and exchange-traded funds may fluctuate, and as a result, clients may lose more than their original investment. "
            "Simulated results generated in the Paper Trading workstation and Trade Planner do not represent actual trading and may "
            "underestimate liquidity risk, real-world slippage, and market gap risks. Past performance is no guarantee of future results."
        )
    },
    "disclaimer": {
        "title": "SEBI & SEC Regulatory Financial Disclaimer",
        "last_updated": "October 2026",
        "status": "REGULATORY SAFE HARBOR NOTICE",
        "content": (
            "FinPilot AI is an educational technology product and is NOT registered with the Securities and Exchange Board of India (SEBI) "
            "as a Research Analyst or Investment Adviser, nor with the US Securities and Exchange Commission (SEC) or FINRA. "
            "All quantitative calculations (including RSI, MACD, Sharpe Ratio, Value at Risk, and Position Sizing) are mathematical evaluations "
            "based on historical data. Users are solely responsible for their independent investment and trading decisions."
        )
    }
}

@router.get("/{document_name}")
def get_legal_document(document_name: str):
    doc = LEGAL_DOCS.get(document_name.lower())
    if not doc:
        return {"error": f"Document '{document_name}' not found. Available: {list(LEGAL_DOCS.keys())}"}
    return doc
