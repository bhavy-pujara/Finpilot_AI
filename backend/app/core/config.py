from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "FinPilot AI"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "finpilot-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    # Default to local SQLite file for zero-friction out-of-the-box local operation
    DATABASE_URL: str = "sqlite:///./finpilot.db"
    
    # Redis
    REDIS_ENABLED: bool = False
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AI / LLM
    DEFAULT_LLM_PROVIDER: str = "fallback"  # gemini, openai, fallback
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    AI_MAX_TOKENS_PER_USER_DAY: int = 50000
    
    # Market Data
    PRIMARY_MARKET_DATA_PROVIDER: str = "mock"  # mock, twelvedata, alphavantage, finnhub
    TWELVE_DATA_API_KEY: str = ""
    ALPHA_VANTAGE_API_KEY: str = ""
    FINNHUB_API_KEY: str = ""
    
    # Broker Architecture Safety Controls
    ENABLE_MOCK_BROKERS: bool = True
    ENABLE_LIVE_BROKER_EXECUTION: bool = False  # Strictly False by default
    BROKER_SIMULATION_MODE: bool = True
    
    # Seed Accounts
    ADMIN_EMAIL: str = "admin@finpilot.ai"
    ADMIN_PASSWORD: str = "Admin123!"
    DEMO_USER_EMAIL: str = "trader@finpilot.ai"
    DEMO_USER_PASSWORD: str = "Trader123!"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
