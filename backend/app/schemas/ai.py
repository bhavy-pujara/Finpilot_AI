from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Market Query"
    context_instrument_id: Optional[int] = None

class MessageSend(BaseModel):
    content: str
    context_instrument_id: Optional[int] = None

class CitationItem(BaseModel):
    title: str
    source: str
    url: Optional[str] = None
    data_timestamp: Optional[str] = None
    confidence: Optional[float] = None

class AIMessageOut(BaseModel):
    id: int
    role: str
    content: str
    citations: Optional[List[CitationItem]] = None
    model_name: str
    token_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class AIConversationOut(BaseModel):
    id: int
    title: str
    context_instrument_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    messages: List[AIMessageOut] = []

    class Config:
        from_attributes = True

class AIUsageSummary(BaseModel):
    total_prompt_tokens: int
    total_completion_tokens: int
    total_tokens: int
    total_cost_usd: float
    request_count: int
