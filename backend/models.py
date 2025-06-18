"""
Modelos SQLAlchemy para o banco de dados
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database_config import Base

class Projeto(Base):
    __tablename__ = "projetos"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), nullable=False, index=True)
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text)
    area_pesquisa = Column(String(100), nullable=False, default='Não especificada')
    palavras_chave = Column(Text)
    data_inicio = Column(String(20))
    data_fim = Column(String(20))
    orientador_id = Column(Integer, ForeignKey("orientadores.id"))
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    status = Column(String(20), default='pendente')
    periodo = Column(Integer)
    data_submissao = Column(String(20))
    data_aprovacao = Column(String(20))
    
    # Relacionamentos
    orientador = relationship("Orientador", back_populates="projetos")
    aluno = relationship("Aluno", back_populates="projetos")
    documentos = relationship("Documento", back_populates="projeto")
    atividades = relationship("Atividade", back_populates="projeto")

class Aluno(Base):
    __tablename__ = "alunos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    matricula = Column(String(20), nullable=False, unique=True, index=True)
    email = Column(String(100), nullable=False, unique=True, index=True)
    data_nascimento = Column(String(20))
    telefone = Column(String(20))
    curso = Column(String(100))
    semestre = Column(Integer)
    projeto_id = Column(Integer, ForeignKey("projetos.id"))
    orientador_id = Column(Integer, ForeignKey("orientadores.id"))
    status = Column(String(20), default='Ativo')
    biografia = Column(Text)
    interesses_pesquisa = Column(Text)
    linkedin_url = Column(String(200))
    github_url = Column(String(200))
    periodo = Column(String(20), default='matutino')
    
    # Relacionamentos
    projetos = relationship("Projeto", back_populates="aluno")
    orientador = relationship("Orientador", back_populates="alunos")
    atividades = relationship("Atividade", back_populates="aluno")

class Orientador(Base):
    __tablename__ = "orientadores"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True, index=True)
    telefone = Column(String(20))
    area_pesquisa = Column(String(100))
    codigo = Column(String(50), nullable=False, unique=True, index=True)
    titulacao = Column(String(100))
    lattes_url = Column(String(200))
    is_coordenador = Column(Boolean, default=False)
    biografia = Column(Text)
    areas_interesse = Column(Text)
    
    # Relacionamentos
    projetos = relationship("Projeto", back_populates="orientador")
    alunos = relationship("Aluno", back_populates="orientador")
    atividades = relationship("Atividade", back_populates="orientador")

class Documento(Base):
    __tablename__ = "documentos"
    
    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    nome_arquivo = Column(String(255), nullable=False)
    caminho_arquivo = Column(String(500), nullable=False)
    tipo_arquivo = Column(String(50))
    tamanho_arquivo = Column(Integer)
    data_upload = Column(String(20))
    comentario_aluno = Column(Text)
    
    # Relacionamentos
    projeto = relationship("Projeto", back_populates="documentos")
    comentarios = relationship("Comentario", back_populates="documento")

class Comentario(Base):
    __tablename__ = "comentarios"
    
    id = Column(Integer, primary_key=True, index=True)
    documento_id = Column(Integer, ForeignKey("documentos.id"), nullable=False)
    usuario_id = Column(Integer, nullable=False)
    usuario_tipo = Column(String(20), nullable=False)  # 'aluno', 'orientador', 'admin'
    comentario = Column(Text, nullable=False)
    data_comentario = Column(String(20))
    
    # Relacionamentos
    documento = relationship("Documento", back_populates="comentarios")

class Atividade(Base):
    __tablename__ = "atividades"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id"), nullable=False)
    orientador_id = Column(Integer, ForeignKey("orientadores.id"), nullable=False)
    data_criacao = Column(String(20))
    
    # Relacionamentos
    projeto = relationship("Projeto", back_populates="atividades")
    aluno = relationship("Aluno", back_populates="atividades")
    orientador = relationship("Orientador", back_populates="atividades")

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True, index=True)
    telefone = Column(String(20))
    titulacao = Column(String(100))
    lattes_url = Column(String(200))
    biografia = Column(Text)
    areas_interesse = Column(Text)
