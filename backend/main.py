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

settings = get_settings()

def determine_user_role(email: str) -> str:
    """
    Determina o perfil do usuário baseado no email
    """
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
    )

    # Configurar CORS para React
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:3001", 
            "https://localhost:3000",
            settings.FRONTEND_URL
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
        return RedirectResponse(url=settings.FRONTEND_URL)

    @application.get("/health")
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
    
    if role == "professor":
        redirect_url = f"{frontend_url}/professor/dashboard?token={token}"
    else:  # aluno
        redirect_url = f"{frontend_url}/aluno/dashboard?token={token}"
    
    return RedirectResponse(url=redirect_url)

@app.get("/auth/callback")
async def auth_callback_redirect(code: str, state: str = None):
    """Redireciona para a rota correta da API"""
    redirect_url = f"/api/v1/auth/callback?code={code}"
    if state:
        redirect_url += f"&state={state}"
    return RedirectResponse(url=redirect_url)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)