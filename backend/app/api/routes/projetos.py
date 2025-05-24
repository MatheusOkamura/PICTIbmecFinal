"""
API para gerenciamento de projetos
"""
import sqlite3
import jwt
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/projetos", tags=["Projetos"])
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
class ProjetoCadastro(BaseModel):
    titulo: str
    descricao: str
    orientador_id: int

class ProjetoResponse(BaseModel):
    id: int
    titulo: str
    descricao: str
    orientador_nome: str
    aluno_nome: str
    status: str
    data_submissao: str
    data_aprovacao: Optional[str] = None

@router.get("/orientadores", response_model=List[dict])
async def listar_orientadores(current_user: dict = Depends(get_current_user)):
    """Lista todos os orientadores disponíveis"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, nome, email, area_pesquisa, titulacao, areas_interesse,
                   (SELECT COUNT(*) FROM projetos WHERE orientador_id = orientadores.id AND status = 'ativo') as projetos_ativos
            FROM orientadores
            ORDER BY nome
        """)
        
        orientadores = []
        for row in cursor.fetchall():
            orientador = dict(row)
            # Converter areas_interesse de string para lista
            if orientador['areas_interesse']:
                orientador['areas'] = orientador['areas_interesse'].split(',')
            else:
                orientador['areas'] = []
            orientadores.append(orientador)
        
        return orientadores
    finally:
        conn.close()

@router.post("/cadastrar")
async def cadastrar_projeto(projeto: ProjetoCadastro, current_user: dict = Depends(get_current_user)):
    """Cadastra um novo projeto"""
    if current_user.get('user_type') != 'aluno':
        raise HTTPException(status_code=403, detail="Apenas alunos podem cadastrar projetos")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Gerar código do projeto
        codigo = f"IC{datetime.now().year}{projeto.orientador_id:03d}{current_user['user_id']:03d}"
        
        # Inserir projeto
        cursor.execute("""
            INSERT INTO projetos (codigo, titulo, descricao, orientador_id, aluno_id, status, data_submissao)
            VALUES (?, ?, ?, ?, ?, 'pendente', ?)
        """, (codigo, projeto.titulo, projeto.descricao, projeto.orientador_id, current_user['user_id'], datetime.now().isoformat()))
        
        projeto_id = cursor.lastrowid
        conn.commit()
        
        return {"message": "Projeto cadastrado com sucesso", "projeto_id": projeto_id}
    finally:
        conn.close()

@router.get("/meus-projetos")
async def meus_projetos(current_user: dict = Depends(get_current_user)):
    """Lista projetos do aluno logado"""
    if current_user.get('user_type') != 'aluno':
        raise HTTPException(status_code=403, detail="Endpoint apenas para alunos")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT p.*, o.nome as orientador_nome,
                   (SELECT COUNT(*) FROM documentos WHERE projeto_id = p.id) as documentos_count,
                   (SELECT MAX(data_upload) FROM documentos WHERE projeto_id = p.id) as ultima_postagem
            FROM projetos p
            JOIN orientadores o ON p.orientador_id = o.id
            WHERE p.aluno_id = ?
            ORDER BY p.data_submissao DESC
        """, (current_user['user_id'],))
        
        projetos = []
        for row in cursor.fetchall():
            projeto = dict(row)
            projetos.append(projeto)
        
        return projetos
    finally:
        conn.close()

@router.get("/pendentes")
async def projetos_pendentes(current_user: dict = Depends(get_current_user)):
    """Lista projetos pendentes para o orientador"""
    if current_user.get('user_type') != 'professor':
        raise HTTPException(status_code=403, detail="Endpoint apenas para professores")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT p.*, a.nome as aluno_nome, a.matricula
            FROM projetos p
            JOIN alunos a ON p.aluno_id = a.id
            WHERE p.orientador_id = ? AND p.status = 'pendente'
            ORDER BY p.data_submissao DESC
        """, (current_user['user_id'],))
        
        projetos = []
        for row in cursor.fetchall():
            projeto = dict(row)
            projetos.append(projeto)
        
        return projetos
    finally:
        conn.close()

@router.get("/ativos")
async def projetos_ativos(current_user: dict = Depends(get_current_user)):
    """Lista projetos ativos do orientador"""
    if current_user.get('user_type') != 'professor':
        raise HTTPException(status_code=403, detail="Endpoint apenas para professores")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT p.*, a.nome as aluno_nome, a.matricula,
                   (SELECT COUNT(*) FROM documentos WHERE projeto_id = p.id) as documentos_count,
                   (SELECT MAX(data_upload) FROM documentos WHERE projeto_id = p.id) as ultima_postagem
            FROM projetos p
            JOIN alunos a ON p.aluno_id = a.id
            WHERE p.orientador_id = ? AND p.status = 'ativo'
            ORDER BY p.data_aprovacao DESC
        """, (current_user['user_id'],))
        
        projetos = []
        for row in cursor.fetchall():
            projeto = dict(row)
            projetos.append(projeto)
        
        return projetos
    finally:
        conn.close()

@router.post("/aprovar/{projeto_id}")
async def aprovar_projeto(projeto_id: int, current_user: dict = Depends(get_current_user)):
    """Aprova um projeto"""
    if current_user.get('user_type') != 'professor':
        raise HTTPException(status_code=403, detail="Apenas orientadores podem aprovar projetos")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Verificar se o projeto é do orientador
        cursor.execute("SELECT * FROM projetos WHERE id = ? AND orientador_id = ?", (projeto_id, current_user['user_id']))
        projeto = cursor.fetchone()
        
        if not projeto:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        
        # Aprovar projeto
        cursor.execute("""
            UPDATE projetos 
            SET status = 'ativo', data_aprovacao = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), projeto_id))
        
        conn.commit()
        return {"message": "Projeto aprovado com sucesso"}
    finally:
        conn.close()