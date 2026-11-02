import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.ai.base_provider import BaseLLMProvider
from app.ai.fallback_provider import FallbackFinancialAIProvider
from app.ai.response_validator import validate_and_sanitize_response
from app.core.config import settings

class GeminiProvider(BaseLLMProvider):
    """Google Gemini LLM provider with graceful deterministic fallback."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.fallback = FallbackFinancialAIProvider()

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        context_data: Optional[Dict[str, Any]] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            return self.fallback.generate_chat_response(messages, context_data, system_prompt)

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            
            # Format contents
            contents = []
            for m in messages:
                role = "user" if m.get("role") in ("user", "system") else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": m.get("content", "")}]
                })

            payload = {
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 1024
                }
            }

            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        _, sanitized, _ = validate_and_sanitize_response(text)
                        return {
                            "content": sanitized,
                            "citations": [{"title": "Gemini Financial Intelligence", "source": "Google Gemini 1.5 Flash", "confidence": 0.95}],
                            "prompt_tokens": len(str(messages)) // 4,
                            "completion_tokens": len(sanitized) // 4,
                            "total_tokens": (len(str(messages)) + len(sanitized)) // 4,
                            "model_name": "gemini-1.5-flash"
                        }
        except Exception:
            pass

        # Fallback if API call fails or times out
        return self.fallback.generate_chat_response(messages, context_data, system_prompt)

    def generate_research_report(
        self,
        symbol: str,
        company_name: str,
        metrics: Dict[str, Any],
        recent_news: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        # Always use the deterministic structured research engine for accuracy and speed
        return self.fallback.generate_research_report(symbol, company_name, metrics, recent_news)
