from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # API Configuration
    API_TITLE: str = "FraudShield API"
    API_VERSION: str = "1.0.0"
    API_ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/fraudshield"
    SQLALCHEMY_ECHO: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security & Auth
    SSO_PROVIDER: str = "okta"  # okta, azure, keycloak
    SSO_DOMAIN: Optional[str] = None
    SSO_CLIENT_ID: Optional[str] = None
    SSO_CLIENT_SECRET: Optional[str] = None
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    TOKEN_EXPIRY_MINUTES: int = 60
    
    # ML Model
    MODEL_PATH: str = "./models/fraud_detection_model.pkl"
    MODEL_THRESHOLD: float = 0.5
    
    # Logging & Monitoring
    LOG_LEVEL: str = "INFO"
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()
