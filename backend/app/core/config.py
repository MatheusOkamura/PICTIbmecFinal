import os
from typing import List

# Importação corrigida para Pydantic v2
try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback para Pydantic v1
    from pydantic import BaseSettings

class Settings(BaseSettings):
    # Configurações gerais
    APP_NAME: str = "IBMEC Authentication API"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # Configurações do Microsoft Azure - usando os.getenv()
    MICROSOFT_CLIENT_ID: str = os.getenv("MICROSOFT_CLIENT_ID", "")
    MICROSOFT_CLIENT_SECRET: str = os.getenv("MICROSOFT_CLIENT_SECRET", "") 
    MICROSOFT_TENANT_ID: str = os.getenv("MICROSOFT_TENANT_ID", "")
    MICROSOFT_REDIRECT_URI: str = os.getenv("MICROSOFT_REDIRECT_URI", "https://pictibmec-gmb7b9daeteff2ep.brazilsouth-01.azurewebsites.net/api/v1/auth/callback")
    
    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Secret Key
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key")
    
    # Configurações do Banco de Dados
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    # Escopos
    SCOPES: List[str] = ['User.Read', 'openid', 'profile', 'email']
    
    class Config:
        env_file = ".env"
        case_sensitive = True

def get_settings() -> Settings:
    return Settings()