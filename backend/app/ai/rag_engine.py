import numpy as np
from typing import List, Dict, Any, Tuple

# Preloaded institutional financial knowledge chunks for grounding
KNOWLEDGE_CHUNKS = [
    {
        "id": "kb_pe",
        "topic": "valuation",
        "title": "P/E Ratio Interpretation & Standards",
        "source": "FinPilot Financial Ratio Encyclopedia",
        "content": "Price-to-Earnings ratio indicates multiple paid per unit of net profit. High P/E implies premium growth expectations or depressed cyclical earnings. Compare against 5-year historical average and sector peers."
    },
    {
        "id": "kb_var",
        "topic": "risk",
        "title": "Value at Risk (VaR) Methodology",
        "source": "FinPilot Quantitative Risk Engine",
        "content": "Value at Risk estimates maximum loss over a specified horizon at a given confidence level. Parametric VaR assumes normal distribution of log returns: 95% 1-day VaR uses 1.645 sigma, 99% uses 2.326 sigma."
    },
    {
        "id": "kb_drawdown",
        "topic": "risk",
        "title": "Maximum Drawdown Definition",
        "source": "FinPilot Portfolio Analytics",
        "content": "Maximum drawdown quantifies the peak-to-trough decline in portfolio equity before a new high is established. It measures capital preservation risk and emotional tolerance requirements."
    },
    {
        "id": "kb_orders",
        "topic": "execution",
        "title": "Order Types: Market, Limit, Stop-Loss",
        "source": "Exchange Microstructure Guide",
        "content": "Market orders prioritize execution certainty, suffering slippage in volatile tape. Limit orders prioritize price certainty, risking non-execution. Stop-loss orders transition to market or limit orders upon reaching trigger price."
    },
    {
        "id": "kb_position_sizing",
        "topic": "risk",
        "title": "Fixed Fractional Risk Position Sizing",
        "source": "FinPilot Risk Management Handbook",
        "content": "Professional traders risk no more than 1% to 2% of total capital on any single trade. Position size is determined strictly by dividing maximum allowable loss amount by distance between entry and stop-loss."
    }
]

class RAGEngine:
    """Document retrieval and source grounding engine."""

    def __init__(self):
        self.documents = KNOWLEDGE_CHUNKS

    def retrieve(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        q_tokens = set(query.lower().split())
        scored_docs = []
        
        for doc in self.documents:
            doc_tokens = set((doc["title"] + " " + doc["content"]).lower().split())
            intersection = len(q_tokens.intersection(doc_tokens))
            score = intersection / max(1, len(q_tokens))
            if score > 0:
                scored_docs.append((score, doc))
                
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored_docs[:top_k]]

rag_engine = RAGEngine()
