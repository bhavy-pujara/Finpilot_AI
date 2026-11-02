import pytest
from app.ai.response_validator import validate_and_sanitize_response
from app.ai.fallback_provider import FallbackFinancialAIProvider
from app.ai.rag_engine import rag_engine

def test_guardrails_redact_guaranteed_profits():
    unsafe_text = "This strategy produces a guaranteed profit of 50% with zero risk."
    is_compliant, sanitized, warnings = validate_and_sanitize_response(unsafe_text)
    
    assert is_compliant is False
    assert len(warnings) > 0
    assert "guaranteed profit" not in sanitized.lower()
    assert "*Educational Disclaimer" in sanitized

def test_rag_retrieval_grounding():
    results = rag_engine.retrieve("What is Value at Risk VaR?", top_k=2)
    assert len(results) > 0
    assert any("Value at Risk" in r["title"] or "VaR" in r["title"] for r in results)

def test_fallback_ai_deterministic_chat():
    provider = FallbackFinancialAIProvider()
    response = provider.generate_chat_response(
        messages=[{"role": "user", "content": "Explain P/E ratio in simple language."}]
    )
    assert "Price-to-Earnings" in response["content"] or "P/E" in response["content"]
    assert response["prompt_tokens"] > 0
    assert response["completion_tokens"] > 0
    assert len(response["citations"]) > 0
