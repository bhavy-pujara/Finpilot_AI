from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from app.api.deps import get_db, get_current_user, get_llm_provider
from app.models.user import User
from app.models.ai import AIConversation, AIMessage
from app.models.instrument import Instrument
from app.schemas.ai import ConversationCreate, MessageSend, AIConversationOut
from app.ai.rag_engine import rag_engine
from app.ai.prompts import FINANCIAL_ASSISTANT_SYSTEM_PROMPT
from app.ai.usage_tracker import record_ai_usage

router = APIRouter()

@router.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    convs = db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id
    ).order_by(AIConversation.updated_at.desc()).all()
    
    return [
        {
            "id": c.id,
            "title": c.title,
            "context_instrument_id": c.context_instrument_id,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat()
        } for c in convs
    ]

@router.post("/conversations")
def create_conversation(
    conv_in: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = AIConversation(
        user_id=current_user.id,
        title=conv_in.title or "New Market Query",
        context_instrument_id=conv_in.context_instrument_id
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Initial assistant greeting
    greeting = AIMessage(
        conversation_id=conv.id,
        role="assistant",
        content=(
            "Welcome to the **FinPilot AI Market Copilot**. "
            "I provide grounded financial intelligence, ratio analysis, risk metrics, and trade review. "
            "Ask me about any financial ratio, order mechanism, or stock symbol.\n\n"
            "*Educational Disclaimer: FinPilot AI provides market analytics for educational evaluation only.*"
        ),
        model_name="finpilot-system",
        token_count=45
    )
    db.add(greeting)
    db.commit()

    return {"id": conv.id, "title": conv.title}

@router.get("/conversations/{conv_id}")
def get_conversation_history(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(AIConversation).filter(
        AIConversation.id == conv_id,
        AIConversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    messages = []
    for m in conv.messages:
        messages.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "citations": m.citations,
            "model_name": m.model_name,
            "token_count": m.token_count,
            "created_at": m.created_at.isoformat()
        })

    return {
        "id": conv.id,
        "title": conv.title,
        "context_instrument_id": conv.context_instrument_id,
        "created_at": conv.created_at.isoformat(),
        "messages": messages
    }

@router.post("/conversations/{conv_id}/messages")
def send_message(
    conv_id: int,
    msg_in: MessageSend,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    llm = Depends(get_llm_provider)
):
    conv = db.query(AIConversation).filter(
        AIConversation.id == conv_id,
        AIConversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    # 1. Store User Message
    user_msg = AIMessage(
        conversation_id=conv.id,
        role="user",
        content=msg_in.content,
        model_name="user",
        token_count=len(msg_in.content.split())
    )
    db.add(user_msg)
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()

    # 2. Gather Context (Instrument + RAG)
    context_data = {}
    inst_id = msg_in.context_instrument_id or conv.context_instrument_id
    if inst_id:
        inst = db.query(Instrument).filter(Instrument.id == inst_id).first()
        if inst:
            context_data["instrument"] = {
                "symbol": inst.symbol,
                "name": inst.name,
                "current_price": float(inst.current_price),
                "currency": inst.currency,
                "exchange_code": inst.exchange.code if inst.exchange else "NSE",
                "sector": inst.sector
            }

    # Add RAG chunks
    rag_docs = rag_engine.retrieve(msg_in.content, top_k=2)
    context_data["rag_docs"] = rag_docs

    # 3. Format message history for LLM
    history = []
    for m in conv.messages[-6:]:  # last 6 messages
        history.append({"role": m.role, "content": m.content})

    # 4. Generate LLM Completion
    response = llm.generate_chat_response(
        messages=history,
        context_data=context_data,
        system_prompt=FINANCIAL_ASSISTANT_SYSTEM_PROMPT
    )

    # 5. Combine Citations
    all_citations = response.get("citations", [])
    for doc in rag_docs:
        all_citations.append({
            "title": doc["title"],
            "source": doc["source"],
            "confidence": 0.95
        })

    # 6. Store Assistant Response
    assistant_msg = AIMessage(
        conversation_id=conv.id,
        role="assistant",
        content=response["content"],
        citations=all_citations,
        model_name=response["model_name"],
        token_count=response["completion_tokens"]
    )
    db.add(assistant_msg)

    # 7. Record AI Usage
    record_ai_usage(
        db=db,
        user_id=current_user.id,
        model_name=response["model_name"],
        request_type="assistant_chat",
        prompt_tokens=response["prompt_tokens"],
        completion_tokens=response["completion_tokens"]
    )

    # Update conversation title if first user query
    if len(conv.messages) <= 3 and conv.title == "New Market Query":
        words = msg_in.content.split()[:5]
        conv.title = " ".join(words)

    db.commit()
    db.refresh(assistant_msg)

    return {
        "id": assistant_msg.id,
        "role": assistant_msg.role,
        "content": assistant_msg.content,
        "citations": assistant_msg.citations,
        "model_name": assistant_msg.model_name,
        "token_count": assistant_msg.token_count,
        "created_at": assistant_msg.created_at.isoformat()
    }
