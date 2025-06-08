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
from fastapi import UploadFile, File, Form

settings = get_settings()
router = APIRouter(prefix="/projetos", tags=["Projetos"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

INSCRICAO_FILE = "inscricao_periodo.json"
HOME_TEXTS_FILE = "home_texts.json"
EDICOES_TEXTS_FILE = "edicoes_texts.json"

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

def load_texts(file_path, default_data):
    """Carrega textos de um arquivo JSON ou retorna dados padrão"""
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return default_data

def save_texts(file_path, data):
    """Salva textos em um arquivo JSON"""
    with open(file_path, "w") as f:
        json.dump(data, f)

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

@router.get("/home-texts")
async def get_home_texts():
    """Retorna os textos da Home"""
    default_data = {
        "titulo": "Portal de Iniciação Científica",
        "subtitulo": "Conecte-se com orientadores, desenvolva projetos inovadores e dê os primeiros passos na sua carreira de pesquisador."
    }
    return load_texts(HOME_TEXTS_FILE, default_data)

@router.post("/home-texts")
async def update_home_texts(data: dict, current_user: dict = Depends(get_current_user)):
    """Atualiza os textos da Home"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode atualizar os textos da Home")
    updated_data = {
        "titulo": data.get("titulo", ""),
        "subtitulo": data.get("subtitulo", "")
    }
    save_texts(HOME_TEXTS_FILE, updated_data)
    return {"message": "Textos da Home atualizados com sucesso"}

# Remover o uso do arquivo edicoes_texts.json para projetos/edições anteriores e usar o banco de dados

# Crie as tabelas no banco de dados (execute isso uma vez no seu SQLite):
# CREATE TABLE edicoes_anteriores (ano INTEGER PRIMARY KEY, edital TEXT);
# CREATE TABLE projetos_edicao (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     ano INTEGER,
#     titulo TEXT,
#     aluno TEXT,
#     orientador TEXT,
#     arquivo TEXT,
#     FOREIGN KEY (ano) REFERENCES edicoes_anteriores(ano)
# );

@router.get("/edicoes-texts")
async def get_edicoes_texts():
    """Retorna os textos e edições da página de Edições Anteriores"""
    default_data = {
        "titulo": "Conheça Projetos de Edições Anteriores",
        "subtitulo": "Veja exemplos de projetos já realizados e acesse os editais das últimas edições do programa de Iniciação Científica.",
        "edicoes": []
    }
    textos = load_texts(EDICOES_TEXTS_FILE, default_data)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT ano, edital FROM edicoes_anteriores ORDER BY ano DESC")
        edicoes = []
        for row in cursor.fetchall():
            ano = row["ano"]
            edital = row["edital"]
            cursor.execute("SELECT titulo, aluno, orientador, arquivo FROM projetos_edicao WHERE ano = ? ORDER BY id ASC", (ano,))
            projetos = [dict(p) for p in cursor.fetchall()]
            edicoes.append({
                "ano": ano,
                "edital": edital,
                "projetos": projetos
            })
        textos["edicoes"] = edicoes
        return textos
    finally:
        conn.close()

@router.post("/edicoes-texts")
async def update_edicoes_texts(data: dict, current_user: dict = Depends(get_current_user)):
    """Atualiza os textos da página de Edições Anteriores (apenas título e subtítulo)"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode atualizar os textos da página de Edições Anteriores")
    updated_data = {
        "titulo": data.get("titulo", ""),
        "subtitulo": data.get("subtitulo", "")
    }
    save_texts(EDICOES_TEXTS_FILE, updated_data)
    return {"message": "Textos da página de Edições Anteriores atualizados com sucesso"}

@router.post("/edicoes-anteriores")
async def add_edicao(data: dict, current_user: dict = Depends(get_current_user)):
    """Adiciona um novo ano de edição"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode adicionar edições")
    ano = data.get("ano")
    edital = data.get("edital", None)
    if not ano:
        raise HTTPException(status_code=400, detail="Ano é obrigatório")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM edicoes_anteriores WHERE ano = ?", (ano,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Ano já existe")
        cursor.execute("INSERT INTO edicoes_anteriores (ano, edital) VALUES (?, ?)", (ano, edital))
        conn.commit()
        return {"message": "Edição adicionada com sucesso"}
    finally:
        conn.close()

@router.post("/edicoes-anteriores/projetos")
async def add_projeto_to_edicao(
    ano: int = Form(...),
    titulo: str = Form(...),
    aluno: str = Form(...),
    orientador: str = Form(...),
    arquivo: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Adiciona um novo projeto a uma edição existente, aceitando upload de arquivo.
    Aceita apenas multipart/form-data (não JSON).
    """
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode adicionar projetos")

    # Salvar arquivo se enviado
    arquivo_path = ""
    if arquivo and arquivo.filename:
        pasta = f"uploads/edicoes_anteriores/{ano}"
        os.makedirs(pasta, exist_ok=True)
        arquivo_path = os.path.join(pasta, arquivo.filename)
        contents = await arquivo.read()
        with open(arquivo_path, "wb") as f:
            f.write(contents)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM edicoes_anteriores WHERE ano = ?", (ano,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Ano não encontrado")
        # Evita duplicidade
        cursor.execute(
            "SELECT 1 FROM projetos_edicao WHERE ano = ? AND titulo = ? AND aluno = ? AND orientador = ?",
            (ano, titulo.strip(), aluno.strip(), orientador.strip())
        )
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Projeto já cadastrado para esta edição")
        cursor.execute(
            "INSERT INTO projetos_edicao (ano, titulo, aluno, orientador, arquivo) VALUES (?, ?, ?, ?, ?)",
            (ano, titulo.strip(), aluno.strip(), orientador.strip(), arquivo_path)
        )
        conn.commit()
        return {"message": "Projeto adicionado com sucesso"}
    finally:
        conn.close()

@router.post("/edicoes-anteriores/remover")
async def remover_edicao(data: dict, current_user: dict = Depends(get_current_user)):
    """Remove uma edição (ano) e todos os projetos associados"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode remover edições")
    ano = data.get("ano")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM projetos_edicao WHERE ano = ?", (ano,))
        cursor.execute("DELETE FROM edicoes_anteriores WHERE ano = ?", (ano,))
        conn.commit()
        return {"message": "Edição removida com sucesso"}
    finally:
        conn.close()

@router.post("/edicoes-anteriores/remover-projeto")
async def remover_projeto_edicao(data: dict, current_user: dict = Depends(get_current_user)):
    """Remove um projeto de uma edição"""
    if current_user.get('user_type') != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode remover projetos")
    ano = data.get("ano")
    idx = data.get("idx")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM projetos_edicao WHERE ano = ? ORDER BY id ASC", (ano,))
        projetos = cursor.fetchall()
        if idx < 0 or idx >= len(projetos):
            raise HTTPException(status_code=400, detail="Projeto não encontrado")
        projeto_id = projetos[idx][0]
        cursor.execute("DELETE FROM projetos_edicao WHERE id = ?", (projeto_id,))
        conn.commit()
        return {"message": "Projeto removido com sucesso"}
    finally:
        conn.close()

@router.get("/estatisticas")
async def estatisticas_portal():
    """
    Retorna estatísticas para a home:
    - projetos_total: projetos em andamento + finalizados
    - orientadores_total: professores cadastrados
    - alunos_total: alunos cadastrados
    - projetos_finalizados: projetos finalizados
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Projetos em andamento (status = 'ativo')
        cursor.execute("SELECT COUNT(*) FROM projetos WHERE status = 'ativo'")
        projetos_ativos = cursor.fetchone()[0] or 0

        # Projetos finalizados (status = 'finalizado')
        cursor.execute("SELECT COUNT(*) FROM projetos WHERE status = 'finalizado'")
        projetos_finalizados = cursor.fetchone()[0] or 0

        # Total de projetos (ativos + finalizados)
        projetos_total = projetos_ativos + projetos_finalizados

        # Orientadores cadastrados
        cursor.execute("SELECT COUNT(*) FROM orientadores")
        orientadores_total = cursor.fetchone()[0] or 0

        # Alunos cadastrados
        cursor.execute("SELECT COUNT(*) FROM alunos")
        alunos_total = cursor.fetchone()[0] or 0

        return {
            "projetos_total": projetos_total,
            "orientadores_total": orientadores_total,
            "alunos_total": alunos_total,
            "projetos_finalizados": projetos_finalizados
        }
    finally:
        conn.close()

def criar_projetos_finalizados_para_testes():
    """
    Cria projetos finalizados diretamente no banco de dados para testes.
    Execute esta função uma vez (por exemplo, via um shell Python ou endpoint temporário).
    """
    projetos = [
        {
            "titulo": "Análise de Mercado no E-commerce Brasileiro",
            "aluno": "João Pedro Alves",
            "orientador": "Profa. Camila Ferreira",
            "ano": 2023
        },
        {
            "titulo": "Aplicativo de Apoio para Pessoas com Deficiência Visual",
            "aluno": "Larissa Duarte",
            "orientador": "Prof. Eduardo Tavares",
            "ano": 2023
        },
        {
            "titulo": "Otimização Logística com Machine Learning",
            "aluno": "Bruno Oliveira",
            "orientador": "Profa. Juliana Martins",
            "ano": 2022
        },
        {
            "titulo": "Estudo de Cibersegurança em Pequenas Empresas",
            "aluno": "Marina Costa",
            "orientador": "Prof. Leandro Rocha",
            "ano": 2022
        },
        {
            "titulo": "Análise de Dados em Saúde",
            "aluno": "Maria Silva",
            "orientador": "Prof. João Souza",
            "ano": 2021
        },
        {
            "titulo": "Sistema de Monitoramento Ambiental com IoT",
            "aluno": "Ana Beatriz Lima",
            "orientador": "Prof. Ricardo Moreira",
            "ano": 2021
        }
    ]
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        for proj in projetos:
            cursor.execute("""
                INSERT INTO projetos (codigo, titulo, descricao, orientador_id, aluno_id, status, data_submissao, data_aprovacao)
                VALUES (?, ?, ?, NULL, NULL, 'finalizado', ?, ?)
            """, (
                f"TESTE{proj['ano']}{proj['titulo'][:3].upper()}",
                proj["titulo"].strip(),
                f"Projeto finalizado de {proj['aluno'].strip()} ({proj['ano']})",
                f"{proj['ano']}-01-01T00:00:00",
                f"{proj['ano']}-12-31T00:00:00"
            ))
        conn.commit()
        print("Projetos finalizados de teste inseridos com sucesso!")
    finally:
        conn.close()

# Para executar, chame criar_projetos_finalizados_para_testes() em um shell Python dentro do projeto:
# from app.api.routes.projetos import criar_projetos_finalizados_para_testes
# criar_projetos_finalizados_para_testes()