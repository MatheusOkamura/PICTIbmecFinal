"""
Configuração do banco de dados usando SQLAlchemy ORM
Suporta tanto SQLite (desenvolvimento) quanto PostgreSQL (produção)
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from typing import Generator
import logging
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base para modelos SQLAlchemy
Base = declarative_base()

class DatabaseConfig:
    """Configuração centralizada do banco de dados"""
    
    def __init__(self):
        self.database_url = self._get_database_url()
        self.engine = self._create_engine()
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def _get_database_url(self) -> str:
        """Determina a URL do banco de dados baseado no ambiente"""
        
        # Verificar se estamos em produção (Azure)
        postgres_url = os.getenv("DATABASE_URL")
        if postgres_url:
            logger.info("Usando PostgreSQL em produção")
            return postgres_url
          # Configuração manual do PostgreSQL
        postgres_host = os.getenv("POSTGRES_HOST")
        postgres_db = os.getenv("POSTGRES_DB")
        postgres_user = os.getenv("POSTGRES_USER")
        postgres_password = os.getenv("POSTGRES_PASSWORD")
        postgres_port = os.getenv("POSTGRES_PORT", "5432")
        
        if all([postgres_host, postgres_db, postgres_user, postgres_password]):
            postgres_url = f"postgresql+psycopg2://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}?sslmode=require"
            logger.info(f"Usando PostgreSQL configurado manualmente: {postgres_host}")
            return postgres_url
        
        # Fallback para SQLite em desenvolvimento
        sqlite_path = os.path.join(os.path.dirname(__file__), "database.db")
        sqlite_url = f"sqlite:///{sqlite_path}"
        logger.info(f"Usando SQLite para desenvolvimento: {sqlite_path}")
        return sqlite_url
    
    def _create_engine(self):
        """Cria o engine do SQLAlchemy com configurações apropriadas"""
        
        if self.database_url.startswith("sqlite"):
            # Configuração para SQLite
            return create_engine(
                self.database_url,
                connect_args={"check_same_thread": False},
                poolclass=StaticPool,
                echo=False  # Mudar para True para debug SQL
            )
        else:
            # Configuração para PostgreSQL
            return create_engine(
                self.database_url,                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                echo=False  # Mudar para True para debug SQL
            )
    
    def create_tables(self):
        """Cria todas as tabelas no banco de dados"""
        try:
            # Importar todos os modelos para garantir que estejam registrados
            import models
            
            Base.metadata.create_all(bind=self.engine)
            logger.info("✅ Tabelas criadas com sucesso!")
            
            # Inserir dados de exemplo se necessário
            self._insert_sample_data()
            
        except Exception as e:
            logger.error(f"Erro ao criar tabelas: {e}")
            raise
    
    def _insert_sample_data(self):
        """Insere dados de exemplo se as tabelas estiverem vazias"""
        try:
            with self.SessionLocal() as session:
                from models import Orientador
                
                # Verificar se já existem dados
                if session.query(Orientador).count() == 0:
                    orientadores = [
                        Orientador(
                            nome="Prof. Dr. Ana Santos",
                            email="ana.santos@ibmec.edu.br",
                            telefone="(21) 99999-1111",
                            area_pesquisa="Inteligência Artificial",
                            codigo="ANA_SANTOS",
                            titulacao="Doutora em Ciência da Computação",
                            biografia="Especialista em IA e Machine Learning com foco em aplicações educacionais.",
                            areas_interesse="Inteligência Artificial,Machine Learning,Análise de Dados"
                        ),
                        Orientador(
                            nome="Prof. Dr. Carlos Silva",
                            email="carlos.silva@ibmec.edu.br",
                            telefone="(21) 99999-2222",
                            area_pesquisa="IoT",
                            codigo="CARLOS_SILVA",
                            titulacao="Doutor em Engenharia Elétrica",
                            biografia="Pesquisador em IoT e sistemas embarcados.",
                            areas_interesse="IoT,Sistemas Embarcados,Redes"
                        ),
                        Orientador(
                            nome="Prof. Dra. Maria Oliveira",
                            email="maria.oliveira@ibmec.edu.br",
                            telefone="(21) 99999-3333",
                            area_pesquisa="Desenvolvimento Web",
                            codigo="MARIA_OLIVEIRA",
                            titulacao="Doutora em Design Digital",
                            biografia="Especialista em desenvolvimento web e UX/UI.",
                            areas_interesse="Desenvolvimento Web,UI/UX,Frontend"
                        )
                    ]
                    
                    for orientador in orientadores:
                        session.add(orientador)
                    
                    session.commit()
                    logger.info("✅ Dados de exemplo inseridos!")
                    
        except Exception as e:
            logger.error(f"Erro ao inserir dados de exemplo: {e}")
    
    def get_session(self) -> Generator:
        """Fornece uma sessão do banco de dados"""
        session = self.SessionLocal()
        try:
            yield session
        finally:
            session.close()
    
    def test_connection(self) -> bool:
        """Testa a conexão com o banco de dados"""
        try:
            with self.engine.connect() as connection:
                if self.database_url.startswith("sqlite"):
                    result = connection.execute(text("SELECT 1"))
                else:
                    result = connection.execute(text("SELECT version()"))
                
                logger.info("✅ Conexão com banco de dados bem-sucedida!")
                return True
                
        except Exception as e:
            logger.error(f"❌ Erro ao conectar com banco de dados: {e}")
            return False

# Instância global da configuração do banco
db_config = DatabaseConfig()

# Funções para compatibilidade
def get_db_session():
    """Retorna uma sessão do banco de dados"""
    return db_config.get_session()

def setup_database():
    """Configura o banco de dados (mantém compatibilidade com código existente)"""
    db_config.test_connection()
    db_config.create_tables()

# Engine e Session para uso direto se necessário
engine = db_config.engine
SessionLocal = db_config.SessionLocal
