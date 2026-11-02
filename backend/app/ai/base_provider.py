from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseLLMProvider(ABC):
    """Abstract interface for LLM providers (Gemini, OpenAI, Fallback)."""

    @abstractmethod
    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        context_data: Optional[Dict[str, Any]] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate conversational completion.
        Returns dict with:
          - content: str
          - citations: List[dict]
          - prompt_tokens: int
          - completion_tokens: int
          - model_name: str
        """
        pass

    @abstractmethod
    def generate_research_report(
        self,
        symbol: str,
        company_name: str,
        metrics: Dict[str, Any],
        recent_news: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate structured research report grounded strictly in provided facts.
        """
        pass
