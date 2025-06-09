"""
API para gerenciamento de perfis de usuários
"""
import sqlite3
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/perfis", tags=["Perfis"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_db_connection():
    """Obter conexão com o banco de dados"""
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Obter usuário atual do token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY or "fallback-secret", algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Models
class PerfilAluno(BaseModel):
    nome: str
    telefone: Optional[str] = None
    data_nascimento: Optional[str] = None
    curso: Optional[str] = None
    semestre: Optional[int] = None
    periodo: Optional[str] = None
    biografia: Optional[str] = None
    interesses_pesquisa: Optional[List[str]] = []
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None

class PerfilProfessor(BaseModel):
    nome: str
    email: str
    telefone: Optional[str] = None
    titulacao: Optional[str] = None
    lattes_url: Optional[str] = None
    biografia: Optional[str] = None
    areas_interesse: Optional[List[str]] = []

class PerfilAdmin(BaseModel):
    nome: str
    email: str
    telefone: Optional[str] = None
    titulacao: Optional[str] = None
    lattes_url: Optional[str] = None
    biografia: Optional[str] = None
    areas_interesse: Optional[List[str]] = []

@router.get("/meu-perfil")
async def obter_meu_perfil(current_user: dict = Depends(get_current_user)):
    """Obtém o perfil do usuário logado"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if current_user.get('user_type') == 'aluno':
            cursor.execute("SELECT * FROM alunos WHERE id = ?", (current_user['user_id'],))
        elif current_user.get('user_type') in ('professor', 'admin_professor'):
            cursor.execute("SELECT * FROM orientadores WHERE id = ?", (current_user['user_id'],))
        elif current_user.get('user_type') == 'admin':
            cursor.execute("SELECT * FROM admins WHERE id = ?", (current_user['user_id'],))
        else:
            raise HTTPException(status_code=403, detail="Tipo de usuário não suportado")
        
        perfil = cursor.fetchone()
        if not perfil:
            raise HTTPException(status_code=404, detail="Perfil não encontrado")
        
        perfil_dict = dict(perfil)
        
        # Converter strings de listas para arrays
        if current_user.get('user_type') == 'aluno':
            interesses = perfil_dict.get('interesses_pesquisa')
            if isinstance(interesses, str):
                perfil_dict['interesses_pesquisa'] = [i.strip() for i in interesses.split(',') if i.strip()]
            elif not interesses:
                perfil_dict['interesses_pesquisa'] = []
        elif current_user.get('user_type') == 'professor':
            areas = perfil_dict.get('areas_interesse')
            if isinstance(areas, str):
                perfil_dict['areas_interesse'] = [a.strip() for a in areas.split(',') if a.strip()]
            elif not areas:
                perfil_dict['areas_interesse'] = []
        # Para admin, apenas nome e email
        return perfil_dict
    finally:
        conn.close()

@router.put("/atualizar-aluno")
async def atualizar_perfil_aluno(perfil: PerfilAluno, current_user: dict = Depends(get_current_user)):
    """Atualiza o perfil do aluno"""
    if current_user.get('user_type') != 'aluno':
        raise HTTPException(status_code=403, detail="Endpoint apenas para alunos")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Converter lista de interesses para string
        interesses_str = ','.join(perfil.interesses_pesquisa) if perfil.interesses_pesquisa else ''
        
        cursor.execute("""
            UPDATE alunos 
            SET nome = ?, telefone = ?, data_nascimento = ?, curso = ?, 
                semestre = ?, periodo = ?, biografia = ?, interesses_pesquisa = ?,
                linkedin_url = ?, github_url = ?
            WHERE id = ?
        """, (
            perfil.nome, perfil.telefone, perfil.data_nascimento, perfil.curso,
            perfil.semestre, perfil.periodo, perfil.biografia, interesses_str,
            perfil.linkedin_url, perfil.github_url, current_user['user_id']
        ))
        
        conn.commit()
        return {"message": "Perfil atualizado com sucesso"}
    finally:
        conn.close()

@router.put("/atualizar-professor")
async def atualizar_perfil_professor(perfil: PerfilProfessor, current_user: dict = Depends(get_current_user)):
    """Atualiza o perfil do professor ou admin"""
    if current_user.get('user_type') in ('professor', 'admin_professor'):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # Converter lista de áreas para string
            areas_str = ','.join(perfil.areas_interesse) if perfil.areas_interesse else ''
            # Permitir atualização do email institucional
            cursor.execute("""
                UPDATE orientadores 
                SET nome = ?, email = ?, telefone = ?, titulacao = ?, lattes_url = ?, 
                    biografia = ?, areas_interesse = ?
                WHERE id = ?
            """, (
                perfil.nome, perfil.email, perfil.telefone, perfil.titulacao, perfil.lattes_url,
                perfil.biografia, areas_str, current_user['user_id']
            ))
            conn.commit()
            return {"message": "Perfil atualizado com sucesso"}
        finally:
            conn.close()
    elif current_user.get('user_type') in ('admin',):
        # Admin pode editar nome, email, telefone, titulacao, lattes_url, biografia, areas_interesse
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            areas_str = ','.join(getattr(perfil, 'areas_interesse', []) or [])
            cursor.execute("""
                UPDATE admins
                SET nome = ?, email = ?, telefone = ?, titulacao = ?, lattes_url = ?, biografia = ?, areas_interesse = ?
                WHERE id = ?
            """, (
                perfil.nome, perfil.email, getattr(perfil, 'telefone', None), getattr(perfil, 'titulacao', None),
                getattr(perfil, 'lattes_url', None), getattr(perfil, 'biografia', None), areas_str, current_user['user_id']
            ))
            conn.commit()
            return {"message": "Perfil de admin atualizado com sucesso"}
        finally:
            conn.close()
    else:
        raise HTTPException(status_code=403, detail="Endpoint apenas para professores, admin_professor ou admin")