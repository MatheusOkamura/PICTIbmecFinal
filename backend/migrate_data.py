"""
Script para migrar dados do SQLite para PostgreSQL
"""
import sqlite3
import os
import sys
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
import logging

# Adicionar o diretório backend ao path
sys.path.append(os.path.dirname(__file__))

from database_config import db_config
from models import *

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataMigration:
    """Classe para migrar dados do SQLite para PostgreSQL"""
    
    def __init__(self):
        self.sqlite_path = os.path.join(os.path.dirname(__file__), "database.db")
        self.postgres_session = None
        
    def connect_sqlite(self):
        """Conecta ao banco SQLite"""
        if not os.path.exists(self.sqlite_path):
            raise FileNotFoundError(f"Banco SQLite não encontrado: {self.sqlite_path}")
        
        return sqlite3.connect(self.sqlite_path)
    
    def connect_postgres(self):
        """Conecta ao banco PostgreSQL"""
        self.postgres_session = db_config.SessionLocal()
        return self.postgres_session
    
    def migrate_orientadores(self, sqlite_conn, postgres_session):
        """Migra dados da tabela orientadores"""
        logger.info("Migrando orientadores...")
        
        cursor = sqlite_conn.cursor()
        cursor.execute("SELECT * FROM orientadores")
        rows = cursor.fetchall()
        
        # Obter nomes das colunas
        columns = [description[0] for description in cursor.description]
        
        migrated_count = 0
        for row in rows:
            data = dict(zip(columns, row))
            
            # Verificar se já existe
            existing = postgres_session.query(Orientador).filter_by(email=data['email']).first()
            if existing:
                logger.info(f"Orientador {data['email']} já existe, pulando...")
                continue
            
            orientador = Orientador(
                nome=data['nome'],
                email=data['email'],
                telefone=data.get('telefone'),
                area_pesquisa=data.get('area_pesquisa'),
                codigo=data['codigo'],
                titulacao=data.get('titulacao'),
                lattes_url=data.get('lattes_url'),
                is_coordenador=bool(data.get('is_coordenador', 0)),
                biografia=data.get('biografia'),
                areas_interesse=data.get('areas_interesse')
            )
            
            postgres_session.add(orientador)
            migrated_count += 1
        
        postgres_session.commit()
        logger.info(f"✅ {migrated_count} orientadores migrados")
    
    def migrate_alunos(self, sqlite_conn, postgres_session):
        """Migra dados da tabela alunos"""
        logger.info("Migrando alunos...")
        
        cursor = sqlite_conn.cursor()
        cursor.execute("SELECT * FROM alunos")
        rows = cursor.fetchall()
        
        columns = [description[0] for description in cursor.description]
        
        migrated_count = 0
        for row in rows:
            data = dict(zip(columns, row))
            
            # Verificar se já existe
            existing = postgres_session.query(Aluno).filter_by(email=data['email']).first()
            if existing:
                logger.info(f"Aluno {data['email']} já existe, pulando...")
                continue
            
            aluno = Aluno(
                nome=data['nome'],
                matricula=data['matricula'],
                email=data['email'],
                data_nascimento=data.get('data_nascimento'),
                telefone=data.get('telefone'),
                curso=data.get('curso'),
                semestre=data.get('semestre'),
                projeto_id=data.get('projeto_id'),
                orientador_id=data.get('orientador_id'),
                status=data.get('status', 'Ativo'),
                biografia=data.get('biografia'),
                interesses_pesquisa=data.get('interesses_pesquisa'),
                linkedin_url=data.get('linkedin_url'),
                github_url=data.get('github_url'),
                periodo=data.get('periodo', 'matutino')
            )
            
            postgres_session.add(aluno)
            migrated_count += 1
        
        postgres_session.commit()
        logger.info(f"✅ {migrated_count} alunos migrados")
    
    def migrate_projetos(self, sqlite_conn, postgres_session):
        """Migra dados da tabela projetos"""
        logger.info("Migrando projetos...")
        
        cursor = sqlite_conn.cursor()
        cursor.execute("SELECT * FROM projetos")
        rows = cursor.fetchall()
        
        columns = [description[0] for description in cursor.description]
        
        migrated_count = 0
        for row in rows:
            data = dict(zip(columns, row))
            
            # Verificar se já existe
            existing = postgres_session.query(Projeto).filter_by(codigo=data['codigo']).first()
            if existing:
                logger.info(f"Projeto {data['codigo']} já existe, pulando...")
                continue
            
            projeto = Projeto(
                codigo=data['codigo'],
                titulo=data['titulo'],
                descricao=data.get('descricao'),
                area_pesquisa=data.get('area_pesquisa', 'Não especificada'),
                palavras_chave=data.get('palavras_chave'),
                data_inicio=data.get('data_inicio'),
                data_fim=data.get('data_fim'),
                orientador_id=data.get('orientador_id'),
                aluno_id=data.get('aluno_id'),
                status=data.get('status', 'pendente'),
                periodo=data.get('periodo'),
                data_submissao=data.get('data_submissao'),
                data_aprovacao=data.get('data_aprovacao')
            )
            
            postgres_session.add(projeto)
            migrated_count += 1
        
        postgres_session.commit()
        logger.info(f"✅ {migrated_count} projetos migrados")
    
    def migrate_documentos(self, sqlite_conn, postgres_session):
        """Migra dados da tabela documentos"""
        logger.info("Migrando documentos...")
        
        cursor = sqlite_conn.cursor()
        cursor.execute("SELECT * FROM documentos")
        rows = cursor.fetchall()
        
        columns = [description[0] for description in cursor.description]
        
        migrated_count = 0
        for row in rows:
            data = dict(zip(columns, row))
            
            documento = Documento(
                projeto_id=data['projeto_id'],
                nome_arquivo=data['nome_arquivo'],
                caminho_arquivo=data['caminho_arquivo'],
                tipo_arquivo=data.get('tipo_arquivo'),
                tamanho_arquivo=data.get('tamanho_arquivo'),
                data_upload=data.get('data_upload'),
                comentario_aluno=data.get('comentario_aluno')
            )
            
            postgres_session.add(documento)
            migrated_count += 1
        
        postgres_session.commit()
        logger.info(f"✅ {migrated_count} documentos migrados")
    
    def migrate_comentarios(self, sqlite_conn, postgres_session):
        """Migra dados da tabela comentarios"""
        logger.info("Migrando comentários...")
        
        cursor = sqlite_conn.cursor()
        cursor.execute("SELECT * FROM comentarios")
        rows = cursor.fetchall()
        
        columns = [description[0] for description in cursor.description]
        
        migrated_count = 0
        for row in rows:
            data = dict(zip(columns, row))
            
            comentario = Comentario(
                documento_id=data['documento_id'],
                usuario_id=data['usuario_id'],
                usuario_tipo=data['usuario_tipo'],
                comentario=data['comentario'],
                data_comentario=data.get('data_comentario')
            )
            
            postgres_session.add(comentario)
            migrated_count += 1
        
        postgres_session.commit()
        logger.info(f"✅ {migrated_count} comentários migrados")
    
    def migrate_atividades(self, sqlite_conn, postgres_session):
        """Migra dados da tabela atividades"""
        logger.info("Migrando atividades...")
        
        cursor = sqlite_conn.cursor()
        
        # Verificar se a tabela existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='atividades'")
        if not cursor.fetchone():
            logger.info("Tabela atividades não existe no SQLite, pulando...")
            return
        
        cursor.execute("SELECT * FROM atividades")
        rows = cursor.fetchall()
        
        columns = [description[0] for description in cursor.description]
        
        migrated_count = 0
        for row in rows:
            data = dict(zip(columns, row))
            
            atividade = Atividade(
                titulo=data['titulo'],
                descricao=data.get('descricao'),
                projeto_id=data['projeto_id'],
                aluno_id=data['aluno_id'],
                orientador_id=data['orientador_id'],
                data_criacao=data.get('data_criacao')
            )
            
            postgres_session.add(atividade)
            migrated_count += 1
        
        postgres_session.commit()
        logger.info(f"✅ {migrated_count} atividades migradas")
    
    def migrate_admins(self, sqlite_conn, postgres_session):
        """Migra dados da tabela admins"""
        logger.info("Migrando admins...")
        
        cursor = sqlite_conn.cursor()
        
        # Verificar se a tabela existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'")
        if not cursor.fetchone():
            logger.info("Tabela admins não existe no SQLite, pulando...")
            return
        
        cursor.execute("SELECT * FROM admins")
        rows = cursor.fetchall()
        
        columns = [description[0] for description in cursor.description]
        
        migrated_count = 0
        for row in rows:
            data = dict(zip(columns, row))
            
            # Verificar se já existe
            existing = postgres_session.query(Admin).filter_by(email=data['email']).first()
            if existing:
                logger.info(f"Admin {data['email']} já existe, pulando...")
                continue
            
            admin = Admin(
                nome=data['nome'],
                email=data['email'],
                telefone=data.get('telefone'),
                titulacao=data.get('titulacao'),
                lattes_url=data.get('lattes_url'),
                biografia=data.get('biografia'),
                areas_interesse=data.get('areas_interesse')
            )
            
            postgres_session.add(admin)
            migrated_count += 1
        
        postgres_session.commit()
        logger.info(f"✅ {migrated_count} admins migrados")
    
    def run_migration(self):
        """Executa a migração completa"""
        logger.info("🚀 Iniciando migração de dados...")
        
        try:
            # Conectar aos bancos
            sqlite_conn = self.connect_sqlite()
            postgres_session = self.connect_postgres()
            
            # Criar tabelas no PostgreSQL
            logger.info("Criando tabelas no PostgreSQL...")
            db_config.create_tables()
            
            # Migrar dados na ordem correta (respeitando foreign keys)
            self.migrate_orientadores(sqlite_conn, postgres_session)
            self.migrate_alunos(sqlite_conn, postgres_session)
            self.migrate_projetos(sqlite_conn, postgres_session)
            self.migrate_documentos(sqlite_conn, postgres_session)
            self.migrate_comentarios(sqlite_conn, postgres_session)
            self.migrate_atividades(sqlite_conn, postgres_session)
            self.migrate_admins(sqlite_conn, postgres_session)
            
            logger.info("🎉 Migração concluída com sucesso!")
            
        except Exception as e:
            logger.error(f"❌ Erro durante a migração: {e}")
            if postgres_session:
                postgres_session.rollback()
            raise
        
        finally:
            if sqlite_conn:
                sqlite_conn.close()
            if postgres_session:
                postgres_session.close()

def main():
    """Função principal"""
    print("=" * 50)
    print("MIGRAÇÃO SQLITE → POSTGRESQL")
    print("=" * 50)
    
    # Verificar variáveis de ambiente
    required_vars = ['POSTGRES_HOST', 'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print("❌ Variáveis de ambiente necessárias não configuradas:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nConfigure estas variáveis antes de executar a migração.")
        return
    
    # Confirmar migração
    response = input("Deseja continuar com a migração? (s/N): ")
    if response.lower() not in ['s', 'sim', 'y', 'yes']:
        print("Migração cancelada.")
        return
    
    # Executar migração
    migration = DataMigration()
    migration.run_migration()

if __name__ == "__main__":
    main()
