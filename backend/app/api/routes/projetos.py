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
from fastapi.responses import FileResponse
import os
import json

settings = get_settings()
router = APIRouter(prefix="/projetos", tags=["Projetos"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

INSCRICAO_FILE = "inscricao_periodo.json"

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

def get_inscricao_periodo():
    if os.path.exists(INSCRICAO_FILE):
        with open(INSCRICAO_FILE, "r") as f:
            return json.load(f)
    return {"data_limite": None, "aberto": True}

def set_inscricao_periodo(data_limite, aberto):
    with open(INSCRICAO_FILE, "w") as f:
        json.dump({"data_limite": data_limite, "aberto": aberto}, f)

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

class AtividadeCadastro(BaseModel):
    titulo: str
    descricao: str
    projeto_id: int

# --- MOCK DATA PARA EDIÇÕES ANTERIORES ---
EDICOES_ANTERIORES = [
    {
        "ano": 2023,
        "edital": "uploads/editais/edital-ic-2023.pdf",
        "projetos": [
            {
                "titulo": "Análise de Dados em Saúde",
                "aluno": "Maria Silva",
                "orientador": "Prof. João Souza",
                "arquivo": "uploads/projetos/2023/analise-dados-saude.pdf"
            },
            {
                "titulo": "Robótica Educacional",
                "aluno": "Lucas Lima",
                "orientador": "Profª Ana Paula",
                "arquivo": "uploads/projetos/2023/robotica-educacional.pdf"
            }
        ]
    },
    {
        "ano": 2022,
        "edital": "uploads/editais/edital-ic-2022.pdf",
        "projetos": [
            {
                "titulo": "Sustentabilidade Urbana",
                "aluno": "Fernanda Costa",
                "orientador": "Prof. Carlos Mendes",
                "arquivo": "uploads/projetos/2022/sustentabilidade-urbana.pdf"
            }
        ]
    }
]

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
    if current_user.get('user_type') not in ('aluno', 'admin'):
        raise HTTPException(status_code=403, detail="Apenas alunos ou admin podem cadastrar projetos")
    # Verifica se o período está aberto e dentro da data limite
    if current_user.get('user_type') == 'aluno':
        periodo = get_inscricao_periodo()
        from datetime import datetime as dt
        if not periodo.get("aberto", True):
            raise HTTPException(status_code=403, detail="Inscrições estão fechadas no momento.")
        data_limite = periodo.get("data_limite")
        if data_limite:
            try:
                if dt.now() > dt.fromisoformat(data_limite):
                    raise HTTPException(status_code=403, detail="O período de inscrição já foi encerrado.")
            except Exception:
                pass
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

@router.get("/todos-pendentes")
async def todos_projetos_pendentes(current_user: dict = Depends(get_current_user)):
    """Lista todos os projetos pendentes (admin)"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode acessar todos os projetos pendentes")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.*, a.nome as aluno_nome, a.matricula, o.nome as orientador_nome
            FROM projetos p
            JOIN alunos a ON p.aluno_id = a.id
            JOIN orientadores o ON p.orientador_id = o.id
            WHERE p.status = 'pendente'
            ORDER BY p.data_submissao DESC
        """)
        projetos = []
        for row in cursor.fetchall():
            projeto = dict(row)
            projetos.append(projeto)
        return projetos
    finally:
        conn.close()

@router.get("/todos-ativos")
async def todos_projetos_ativos(current_user: dict = Depends(get_current_user)):
    """Lista todos os projetos ativos (admin)"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode acessar todos os projetos ativos")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.*, a.nome as aluno_nome, a.matricula, o.nome as orientador_nome,
                   (SELECT COUNT(*) FROM documentos WHERE projeto_id = p.id) as documentos_count,
                   (SELECT MAX(data_upload) FROM documentos WHERE projeto_id = p.id) as ultima_postagem
            FROM projetos p
            JOIN alunos a ON p.aluno_id = a.id
            JOIN orientadores o ON p.orientador_id = o.id
            WHERE p.status = 'ativo'
            ORDER BY p.data_aprovacao DESC
        """)
        projetos = []
        for row in cursor.fetchall():
            projeto = dict(row)
            projetos.append(projeto)
        return projetos
    finally:
        conn.close()

@router.post("/enviar-atividade")
async def enviar_atividade(atividade: AtividadeCadastro, current_user: dict = Depends(get_current_user)):
    """Professor cria e envia uma atividade para um aluno vinculado a um projeto"""
    if current_user.get('user_type') != 'professor':
        raise HTTPException(status_code=403, detail="Apenas professores podem criar atividades")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verifica se o projeto pertence ao professor
        cursor.execute("SELECT * FROM projetos WHERE id = ? AND orientador_id = ?", (atividade.projeto_id, current_user['user_id']))
        projeto = cursor.fetchone()
        if not projeto:
            raise HTTPException(status_code=404, detail="Projeto não encontrado ou não pertence ao professor")
        # Cria a atividade
        cursor.execute("""
            INSERT INTO atividades (titulo, descricao, projeto_id, aluno_id, professor_id, data_criacao)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            atividade.titulo,
            atividade.descricao,
            atividade.projeto_id,
            projeto['aluno_id'],
            current_user['user_id'],
            datetime.now().isoformat()
        ))
        conn.commit()
        return {"message": "Atividade criada e enviada para o aluno"}
    finally:
        conn.close()

@router.get("/edicoes-anteriores")
async def listar_edicoes_anteriores():
    """
    Lista todas as edições anteriores disponíveis (anos e links de edital)
    """
    return [
        {
            "ano": ed["ano"],
            "edital": f"/api/v1/projetos/edicoes-anteriores/{ed['ano']}/edital"
        }
        for ed in EDICOES_ANTERIORES
    ]

@router.get("/edicoes-anteriores/{ano}/projetos")
async def listar_projetos_edicao(ano: int):
    """
    Lista os projetos de uma edição específica
    """
    for ed in EDICOES_ANTERIORES:
        if ed["ano"] == ano:
            return [
                {
                    "titulo": p["titulo"],
                    "aluno": p["aluno"],
                    "orientador": p["orientador"],
                    "arquivo": f"/api/v1/projetos/edicoes-anteriores/{ano}/projeto/{idx}"
                }
                for idx, p in enumerate(ed["projetos"])
            ]
    return []

@router.get("/edicoes-anteriores/{ano}/edital")
async def baixar_edital_edicao(ano: int):
    """
    Baixa o edital de uma edição específica
    """
    for ed in EDICOES_ANTERIORES:
        if ed["ano"] == ano:
            return FileResponse(ed["edital"], filename=f"edital-ic-{ano}.pdf", media_type="application/pdf")
    return {"detail": "Edital não encontrado"}

@router.get("/edicoes-anteriores/{ano}/projeto/{projeto_idx}")
async def baixar_projeto_edicao(ano: int, projeto_idx: int):
    """
    Baixa o arquivo de um projeto de uma edição específica
    """
    for ed in EDICOES_ANTERIORES:
        if ed["ano"] == ano:
            projetos = ed.get("projetos", [])
            if 0 <= projeto_idx < len(projetos):
                proj = projetos[projeto_idx]
                return FileResponse(proj["arquivo"], filename=proj["arquivo"].split("/")[-1])
    return {"detail": "Projeto não encontrado"}

@router.get("/inscricao-periodo")
async def get_periodo_inscricao():
    """Retorna o período de inscrição e status"""
    return get_inscricao_periodo()

@router.post("/inscricao-periodo")
async def set_periodo_inscricao(data: dict, current_user: dict = Depends(get_current_user)):
    """Admin define a data limite e status de inscrição"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode definir o período de inscrição")
    data_limite = data.get("data_limite")
    aberto = data.get("aberto", True)
    set_inscricao_periodo(data_limite, aberto)
    return {"message": "Período de inscrição atualizado", "data_limite": data_limite, "aberto": aberto}

@router.post("/abrir-inscricao")
async def abrir_inscricao(current_user: dict = Depends(get_current_user)):
    """Admin reabre o período de inscrição"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode abrir inscrições")
    periodo = get_inscricao_periodo()
    set_inscricao_periodo(periodo.get("data_limite"), True)
    return {"message": "Inscrições reabertas"}

@router.post("/fechar-inscricao")
async def fechar_inscricao(current_user: dict = Depends(get_current_user)):
    """Admin fecha o período de inscrição"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode fechar inscrições")
    periodo = get_inscricao_periodo()
    set_inscricao_periodo(periodo.get("data_limite"), False)
    return {"message": "Inscrições fechadas"}