from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "YAVIN 1 Backend API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/yavin1_db"
    
    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    # Vector Store
    QDRANT_URL: str = "http://qdrant:6333"
    
    # LLM Providers
    OPENAI_API_KEY: str = ""
    CLAUDE_API_KEY: str = ""
    OLLAMA_URL: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()
