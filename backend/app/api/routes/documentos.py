"""
API para gerenciamento de documentos e comentários
"""
import sqlite3
import jwt
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/documentos", tags=["Documentos"])
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
class ComentarioModel(BaseModel):
    comentario: str

class DocumentoResponse(BaseModel):
    id: int
    nome_arquivo: str
    tipo_arquivo: str
    tamanho_arquivo: int
    data_upload: str
    comentario_aluno: Optional[str] = None

@router.post("/upload/{projeto_id}")
async def upload_documento(
    projeto_id: int,
    file: UploadFile = File(...),
    comentario: str = Form(""),
    current_user: dict = Depends(get_current_user)
):
    """Upload de documento para um projeto"""
    if current_user.get('user_type') != 'aluno':
        raise HTTPException(status_code=403, detail="Apenas alunos podem fazer upload de documentos")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Verificar se o projeto é do aluno
        cursor.execute("SELECT * FROM projetos WHERE id = ? AND aluno_id = ?", (projeto_id, current_user['user_id']))
        projeto = cursor.fetchone()
        
        if not projeto:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        
        # NOVO: Verificar se existe pelo menos uma atividade criada pelo professor para este projeto
        cursor.execute("""
            SELECT COUNT(*) as total_atividades
            FROM atividades
            WHERE projeto_id = ? AND aluno_id = ? AND professor_id = ?
        """, (projeto_id, current_user['user_id'], projeto['orientador_id']))
        atividades = cursor.fetchone()
        if not atividades or atividades['total_atividades'] == 0:
            raise HTTPException(status_code=403, detail="Você só pode enviar documentos quando o professor criar uma entrega para este projeto.")

        # Criar diretório se não existir
        upload_dir = f"uploads/projeto_{projeto_id}"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Salvar arquivo
        file_path = f"{upload_dir}/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Salvar no banco
        cursor.execute("""
            INSERT INTO documentos (projeto_id, nome_arquivo, caminho_arquivo, tipo_arquivo, tamanho_arquivo, data_upload, comentario_aluno)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            projeto_id, file.filename, file_path, file.content_type, 
            len(content), datetime.now().isoformat(), comentario
        ))
        
        documento_id = cursor.lastrowid
        conn.commit()
        
        return {"message": "Documento enviado com sucesso", "documento_id": documento_id}
    finally:
        conn.close()

@router.get("/projeto/{projeto_id}")
async def listar_documentos(projeto_id: int, current_user: dict = Depends(get_current_user)):
    """Lista documentos de um projeto"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Verificar acesso ao projeto
        if current_user.get('user_type') == 'aluno':
            cursor.execute("SELECT * FROM projetos WHERE id = ? AND aluno_id = ?", (projeto_id, current_user['user_id']))
        else:
            cursor.execute("SELECT * FROM projetos WHERE id = ? AND orientador_id = ?", (projeto_id, current_user['user_id']))
        
        projeto = cursor.fetchone()
        if not projeto:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        
        # Listar documentos
        cursor.execute("""
            SELECT * FROM documentos 
            WHERE projeto_id = ?
            ORDER BY data_upload DESC
        """, (projeto_id,))
        
        documentos = []
        for row in cursor.fetchall():
            doc = dict(row)
            
            # Buscar comentários do documento
            cursor.execute("""
                SELECT c.*, 
                       CASE 
                           WHEN c.usuario_tipo = 'aluno' THEN a.nome
                           ELSE o.nome
                       END as usuario_nome
                FROM comentarios c
                LEFT JOIN alunos a ON c.usuario_id = a.id AND c.usuario_tipo = 'aluno'
                LEFT JOIN orientadores o ON c.usuario_id = o.id AND c.usuario_tipo = 'professor'
                WHERE c.documento_id = ?
                ORDER BY c.data_comentario ASC
            """, (doc['id'],))
            
            comentarios = [dict(c) for c in cursor.fetchall()]
            doc['comentarios'] = comentarios
            documentos.append(doc)
        
        return documentos
    finally:
        conn.close()

@router.post("/comentar/{documento_id}")
async def comentar_documento(
    documento_id: int, 
    comentario: ComentarioModel, 
    current_user: dict = Depends(get_current_user)
):
    """Adiciona comentário a um documento"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Verificar se o documento existe e se o usuário tem acesso
        cursor.execute("""
            SELECT d.*, p.aluno_id, p.orientador_id 
            FROM documentos d
            JOIN projetos p ON d.projeto_id = p.id
            WHERE d.id = ?
        """, (documento_id,))
        
        documento = cursor.fetchone()
        if not documento:
            raise HTTPException(status_code=404, detail="Documento não encontrado")
        
        # Verificar permissão
        if current_user.get('user_type') == 'aluno' and documento['aluno_id'] != current_user['user_id']:
            raise HTTPException(status_code=403, detail="Sem permissão para comentar")
        elif current_user.get('user_type') == 'professor' and documento['orientador_id'] != current_user['user_id']:
            raise HTTPException(status_code=403, detail="Sem permissão para comentar")
        
        # Inserir comentário
        cursor.execute("""
            INSERT INTO comentarios (documento_id, usuario_id, usuario_tipo, comentario, data_comentario)
            VALUES (?, ?, ?, ?, ?)
        """, (
            documento_id, current_user['user_id'], current_user['user_type'], 
            comentario.comentario, datetime.now().isoformat()
        ))
        
        conn.commit()
        return {"message": "Comentário adicionado com sucesso"}
    finally:
        conn.close()