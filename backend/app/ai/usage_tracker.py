from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.ai import AIUsage

# Cost per 1K tokens estimate
MODEL_COSTS_PER_1K = {
    "gemini-1.5-flash": 0.00035,
    "gpt-4o-mini": 0.00060,
    "finpilot-deterministic-fallback": 0.00000
}

def record_ai_usage(
    db: Session,
    user_id: int,
    model_name: str,
    request_type: str,
    prompt_tokens: int,
    completion_tokens: int
) -> AIUsage:
    total_tokens = prompt_tokens + completion_tokens
    cost_rate = MODEL_COSTS_PER_1K.get(model_name, 0.0001)
    cost = (total_tokens / 1000.0) * cost_rate
    
    usage_entry = AIUsage(
        user_id=user_id,
        model_name=model_name,
        request_type=request_type,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        estimated_cost_usd=round(cost, 6),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(usage_entry)
    db.commit()
    db.refresh(usage_entry)
    return usage_entry
