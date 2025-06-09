"""
Rotas para autenticação com contas Microsoft do IBMEC
"""
import uuid
import urllib.parse
import httpx
import jwt
import sqlite3
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Dict, Any, Optional

# Importar as configurações
from app.core.config import get_settings

# Obter o objeto settings
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["Autenticação"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# =================== FUNÇÕES DE BANCO DE DADOS ===================

def get_db_connection():
    """Obter conexão com o banco de dados"""
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def determine_user_type(email: str) -> str:
    """Determina se é admin, professor ou aluno baseado no email"""
    # Professores do IBMEC normalmente têm email institucional terminando com '@ibmec.edu.br'
    # e não possuem números no início como alunos.
    # O usuário 202302129633 deve ser professor.
    if email:
        if email == "202302129633@ibmec.edu.br" or email.startswith("202302129633"):
            return "admin"
        # Professores: email institucional, não começa com número, termina com ibmec.edu.br
        if email.lower().endswith("@professores.ibmec.edu.br") and not email.split("@")[0][0].isdigit():
            return "professor"
        # Admin: palavra 'admin' ou 'coordenador' no email
        if "admin" in email.lower() or "coordenador" in email.lower():
            return "admin"
    return "aluno"

def check_user_exists(email: str, user_type: str) -> Optional[Dict[str, Any]]:
    """
    Verifica se o usuário existe na tabela correspondente
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if user_type in ("professor", "admin"):
            cursor.execute("SELECT * FROM orientadores WHERE email = ?", (email,))
            user = cursor.fetchone()
            if user:
                return dict(user)
        if user_type == "aluno":
            cursor.execute("SELECT * FROM alunos WHERE email = ?", (email,))
            user = cursor.fetchone()
            if user:
                return dict(user)
        if user_type == "admin":
            cursor.execute("SELECT * FROM alunos WHERE email = ?", (email,))
            user = cursor.fetchone()
            if user:
                return dict(user)
        return None
    finally:
        conn.close()

def create_professor_from_token(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cria um professor/orientador baseado nos dados do token
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Gerar código automático baseado no email
        email_prefix = user_data.get('email', '').split('@')[0]
        codigo = email_prefix.upper().replace('.', '')[:10]
        
        # Determinar se é coordenador baseado no email/cargo
        is_coordenador = any(word in user_data.get('email', '').lower() 
                           for word in ['coord', 'diretor'])
        
        # Inserir orientador
        cursor.execute("""
            INSERT INTO orientadores (
                nome, email, telefone, area_pesquisa, codigo, 
                titulacao, lattes_url, is_coordenador
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_data.get('display_name', user_data.get('name', '')),
            user_data.get('email', ''),
            user_data.get('mobile_phone', user_data.get('phone', '')),
            user_data.get('department', 'Não especificada'),
            codigo,
            user_data.get('job_title', 'Professor'),
            '',  # lattes_url vazio por padrão
            1 if is_coordenador else 0
        ))
        
        # Obter o ID do usuário criado
        user_id = cursor.lastrowid
        conn.commit()
        
        # Retornar os dados do usuário criado
        cursor.execute("SELECT * FROM orientadores WHERE id = ?", (user_id,))
        new_user = cursor.fetchone()
        
        print(f"✅ Professor criado: {user_data.get('display_name')} (ID: {user_id})")
        return dict(new_user)
        
    finally:
        conn.close()

def create_aluno_from_token(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cria um aluno baseado nos dados do token
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Gerar matrícula automática baseada no email
        email_prefix = user_data.get('email', '').split('@')[0]
        matricula = email_prefix.upper().replace('.', '')[:15]
        
        # Tentar extrair semestre do email ou usar padrão
        semestre = 1  # Valor padrão
        
        # Inserir aluno
        cursor.execute("""
            INSERT INTO alunos (
                nome, matricula, email, data_nascimento, telefone, 
                curso, semestre, projeto_id, orientador_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_data.get('display_name', user_data.get('name', '')),
            matricula,
            user_data.get('email', ''),
            None,  # data_nascimento - não disponível no token
            user_data.get('mobile_phone', user_data.get('phone', '')),
            user_data.get('department', 'Não especificado'),
            semestre,
            None,  # projeto_id vazio inicialmente
            None,  # orientador_id vazio inicialmente
            'Ativo'
        ))
        
        # Obter o ID do usuário criado
        user_id = cursor.lastrowid
        conn.commit()
        
        # Retornar os dados do usuário criado
        cursor.execute("SELECT * FROM alunos WHERE id = ?", (user_id,))
        new_user = cursor.fetchone()
        
        print(f"✅ Aluno criado: {user_data.get('display_name')} (ID: {user_id})")
        return dict(new_user)
        
    finally:
        conn.close()

def get_or_create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Função principal: verifica se usuário existe, se não, cria automaticamente
    """
    email = user_data.get('email', '')
    user_type = determine_user_type(email)
    
    print(f"🔍 Verificando usuário: {email} (Tipo: {user_type})")
    
    # Verificar se já existe
    existing_user = check_user_exists(email, user_type)
    if existing_user:
        print(f"✅ Usuário existente encontrado: {existing_user.get('nome')}")
        return {
            **existing_user,
            "user_type": user_type,
            "is_new_user": False
        }
    # Se não existe, criar
    print(f"🆕 Criando novo usuário...")
    
    if user_type == "professor":
        new_user = create_professor_from_token(user_data)
    elif user_type == "admin":
        # Cria como orientador E como aluno (para compatibilidade)
        new_user = create_professor_from_token(user_data)
        # Também cria como aluno se não existir
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT * FROM alunos WHERE email = ?", (email,))
            if not cursor.fetchone():
                create_aluno_from_token(user_data)
        finally:
            conn.close()
    elif user_type == "aluno":
        new_user = create_aluno_from_token(user_data)
    else:
        raise Exception("Tipo de usuário desconhecido")
    return {
        **new_user,
        "user_type": user_type,
        "is_new_user": True
    }

# =================== FUNÇÕES DE TOKEN ===================

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Cria token JWT
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY or "fallback-secret", algorithm="HS256")
    return encoded_jwt

# =================== ENDPOINTS ===================

@router.get("/microsoft-login")
async def microsoft_login():
    """
    Inicia o fluxo de autenticação com Microsoft
    """
    state = str(uuid.uuid4())
    
    params = {
        "client_id": settings.MICROSOFT_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
        "response_mode": "query", 
        "scope": " ".join(settings.SCOPES),
        "state": state
    }
    
    auth_url = f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?{urllib.parse.urlencode(params)}"
    return RedirectResponse(auth_url)

@router.get("/callback")
async def microsoft_callback(code: str, state: str = None):
    """
    Callback completo: Microsoft → Verificar/Criar usuário → Redirecionar
    """
    try:
        print(f"🔄 Processando callback - Código: {code[:20]}...")
        
        # 1. Trocar código por token da Microsoft
        token_url = f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/token"
        
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.MICROSOFT_REDIRECT_URI
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data, headers=headers)
        
        if response.status_code != 200:
            error_detail = response.text
            print(f"❌ Erro Microsoft: {error_detail}")
            raise HTTPException(status_code=400, detail="Erro ao obter token da Microsoft")
        
        token_data = response.json()
        access_token = token_data["access_token"]
        print(f"✅ Token Microsoft obtido")
        
        # 2. Obter dados do usuário da Microsoft
        user_url = "https://graph.microsoft.com/v1.0/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        
        async with httpx.AsyncClient() as client:
            user_response = await client.get(user_url, headers=headers)
        
        if user_response.status_code != 200:
            print(f"❌ Erro ao obter dados do usuário: {user_response.text}")
            raise HTTPException(status_code=400, detail="Erro ao obter dados do usuário")
        
        user_data = user_response.json()
        
        # 3. Preparar dados para o banco
        user_info = {
            "email": user_data.get("mail") or user_data.get("userPrincipalName"),
            "display_name": user_data.get("displayName", ""),
            "name": user_data.get("displayName", ""),
            "given_name": user_data.get("givenName", ""),
            "surname": user_data.get("surname", ""),
            "job_title": user_data.get("jobTitle", ""),
            "department": user_data.get("department", ""),
            "office_location": user_data.get("officeLocation", ""),
            "mobile_phone": user_data.get("mobilePhone", ""),
            "phone": user_data.get("mobilePhone", "")
        }
        
        print(f"📧 Email obtido: {user_info['email']}")
        
        # Verificar se é email IBMEC (permitir testes com qualquer email-habilitar em produção)
       # if not user_info["email"] or "ibmec.edu.br" not in user_info["email"].lower():
           # raise HTTPException(status_code=403, detail="Email do IBMEC necessário")
        
        # 4. Verificar/Criar usuário no banco local
        db_user = get_or_create_user(user_info)
        
        # 5. Criar token JWT interno com todas as informações
        token_payload = {
            # Dados do banco local
            "user_id": db_user["id"],
            "email": db_user["email"], 
            "name": db_user["nome"],
            "user_type": db_user["user_type"],
            "is_new_user": db_user["is_new_user"],
            
            # Token Microsoft para futuras consultas
            "microsoft_token": access_token,
            
            # Dados específicos do tipo de usuário
            **({
                "codigo": db_user["codigo"],
                "area_pesquisa": db_user["area_pesquisa"],
                "titulacao": db_user["titulacao"],
                "is_coordenador": bool(db_user["is_coordenador"])
            } if db_user["user_type"] == "professor" else {
                "matricula": db_user["matricula"],
                "curso": db_user["curso"],
                "semestre": db_user["semestre"]
            })
        }
        # Adiciona flag admin se for admin
        if db_user["user_type"] == "admin":
            token_payload["is_admin"] = True

        # Criar token JWT
        internal_token = create_access_token(token_payload)
        
        print(f"✅ Login processado: {db_user['nome']} ({db_user['user_type']})")
        if db_user["is_new_user"]:
            print(f"🆕 Novo usuário criado no banco!")
        
        # 6. Redirecionar usando a função que já existe no main.py
        redirect_url = f"/auth/redirect?token={internal_token}&email={db_user['email']}"
        
        return RedirectResponse(url=redirect_url)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Erro inesperado: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/me", response_model=Dict[str, Any])
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Retorna informações do usuário autenticado
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY or "fallback-secret", algorithms=["HS256"])
        email = payload.get("email")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

@router.get("/logout")
async def logout():
    """
    Endpoint para logout
    """
    return {"message": "Logout realizado com sucesso"}