"""
Ponto de entrada principal da aplicação FastAPI
"""
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes.auth import router as auth_router
from app.api.routes.projetos import router as projetos_router
from app.api.routes.perfis import router as perfis_router
from app.api.routes.documentos import router as documentos_router
from app.core.config import get_settings
import os
from database_config import setup_database

settings = get_settings()

# Configurar banco de dados
try:
    setup_database()
except Exception as e:
    print(f"⚠️ Aviso: Erro ao configurar banco de dados: {e}")
    # Fallback para database_setup.py se houver erro
    try:
        from database_setup import setup_database as setup_sqlite
        setup_sqlite()
    except Exception as e2:
        print(f"❌ Erro ao configurar SQLite: {e2}")

def determine_user_role(email: str) -> str:
    """
    Determina o perfil do usuário baseado no email
    """
    if "202302129633" in email:
        return "admin"  # Treat as admin
    if "admin" in email.lower() or "coordenador" in email.lower():
        return "admin"  # Tratar como admin
    if "professor" in email.lower():
        return "professor"
    else:
        return "aluno"

def create_application() -> FastAPI:
    """
    Cria e configura a aplicação FastAPI
    """
    application = FastAPI(
        title=settings.APP_NAME,
        debug=settings.DEBUG,
        description="API para autenticação com contas Microsoft do IBMEC com diferentes perfis",
        version="1.0.0"
    )    # Configurar CORS para React
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:3001", 
            "https://localhost:3000",
            "https://localhost:3001",
            settings.FRONTEND_URL,
            "https://pictibmec-frontend.azurestaticapps.net",  # URL de produção do frontend
            "https://*.azurestaticapps.net"  # Permitir subdomínios do Azure Static Web Apps
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Criar diretório de uploads se não existir
    os.makedirs("uploads", exist_ok=True)
    
    # Servir arquivos estáticos (uploads)
    application.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

    # Incluir rotas da API
    application.include_router(auth_router, prefix=settings.API_V1_STR)
    application.include_router(projetos_router, prefix=settings.API_V1_STR)
    application.include_router(perfis_router, prefix=settings.API_V1_STR)
    application.include_router(documentos_router, prefix=settings.API_V1_STR)

    @application.get("/")
    async def root():
        """
        Rota raiz - redireciona para o frontend (Home)
        """
        return RedirectResponse(url=settings.FRONTEND_URL)    @application.get("/health")
    async def health_check():
        """
        Health check da API
        """
        return {
            "message": "IBMEC Authentication API",
            "status": "online",
            "version": "1.0.0"
        }

    return application

app = create_application()

@app.get("/auth/redirect")
async def final_redirect(token: str, email: str):
    """
    Redirecionamento final baseado no perfil do usuário
    """
    role = determine_user_role(email)
    frontend_url = settings.FRONTEND_URL

    # Corrija o caminho para bater com a rota do frontend (React Router)
    if role == "admin":
        redirect_url = f"{frontend_url}/adminDashboard?token={token}"
    elif role == "professor":
        redirect_url = f"{frontend_url}/professor/dashboard?token={token}"
    else:  # aluno
        redirect_url = f"{frontend_url}/aluno/dashboard?token={token}"

    return RedirectResponse(url=redirect_url)

# Azure App Service precisa encontrar a variável 'app' no módulo
# Configuração da porta para funcionar no Azure
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)