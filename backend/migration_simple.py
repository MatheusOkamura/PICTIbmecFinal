"""
Script de migração simples usando psycopg2 diretamente
"""
import sqlite3
import psycopg2
import os
from datetime import datetime

def migrate_data():
    """Migra dados do SQLite para PostgreSQL usando conexões diretas"""
    
    print("🚀 Iniciando migração SQLite → PostgreSQL...")
    
    # Conectar ao SQLite
    sqlite_path = "database.db"
    if not os.path.exists(sqlite_path):
        print(f"❌ Arquivo SQLite não encontrado: {sqlite_path}")
        return
    
    sqlite_conn = sqlite3.connect(sqlite_path)    # Conectar ao PostgreSQL
    try:
        postgres_conn = psycopg2.connect(
            host="pictibmec-postgres-dev-ggfpbptwi4pwg.postgres.database.azure.com",
            database="pictibmec_db",
            user="pictibmecadmin",
            password="MinhaSenha123!",
            port=5432,
            sslmode="require"
        )
        print("✅ Conectado ao PostgreSQL com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao conectar PostgreSQL: {e}")
        return
    
    postgres_cursor = postgres_conn.cursor()
    
    try:
        # 1. Criar tabelas no PostgreSQL
        print("📋 Criando tabelas...")
        
        create_tables_sql = """
        -- Tabela orientadores
        CREATE TABLE IF NOT EXISTS orientadores (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            telefone VARCHAR(20),
            area_pesquisa VARCHAR(100),
            codigo VARCHAR(50) NOT NULL UNIQUE,
            titulacao VARCHAR(100),
            lattes_url VARCHAR(200),
            is_coordenador BOOLEAN DEFAULT FALSE,
            biografia TEXT,
            areas_interesse TEXT
        );
        
        -- Tabela alunos
        CREATE TABLE IF NOT EXISTS alunos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            matricula VARCHAR(20) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            data_nascimento VARCHAR(20),
            telefone VARCHAR(20),
            curso VARCHAR(100),
            semestre INTEGER,
            projeto_id INTEGER,
            orientador_id INTEGER REFERENCES orientadores(id),
            status VARCHAR(20) DEFAULT 'Ativo',
            biografia TEXT,
            interesses_pesquisa TEXT,
            linkedin_url VARCHAR(200),
            github_url VARCHAR(200),
            periodo VARCHAR(20) DEFAULT 'matutino'
        );
        
        -- Tabela projetos
        CREATE TABLE IF NOT EXISTS projetos (
            id SERIAL PRIMARY KEY,
            codigo VARCHAR(50) NOT NULL,
            titulo VARCHAR(200) NOT NULL,
            descricao TEXT,
            area_pesquisa VARCHAR(100) NOT NULL DEFAULT 'Não especificada',
            palavras_chave TEXT,
            data_inicio VARCHAR(20),
            data_fim VARCHAR(20),
            orientador_id INTEGER REFERENCES orientadores(id),
            aluno_id INTEGER REFERENCES alunos(id),
            status VARCHAR(20) DEFAULT 'pendente',
            periodo INTEGER,
            data_submissao VARCHAR(20),
            data_aprovacao VARCHAR(20)
        );
        
        -- Tabela documentos
        CREATE TABLE IF NOT EXISTS documentos (
            id SERIAL PRIMARY KEY,
            projeto_id INTEGER NOT NULL REFERENCES projetos(id),
            nome_arquivo VARCHAR(255) NOT NULL,
            caminho_arquivo VARCHAR(500) NOT NULL,
            tipo_arquivo VARCHAR(50),
            tamanho_arquivo INTEGER,
            data_upload VARCHAR(20),
            comentario_aluno TEXT
        );
        
        -- Tabela comentarios
        CREATE TABLE IF NOT EXISTS comentarios (
            id SERIAL PRIMARY KEY,
            documento_id INTEGER NOT NULL REFERENCES documentos(id),
            usuario_id INTEGER NOT NULL,
            usuario_tipo VARCHAR(20) NOT NULL,
            comentario TEXT NOT NULL,
            data_comentario VARCHAR(20)
        );
        
        -- Tabela atividades
        CREATE TABLE IF NOT EXISTS atividades (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(200) NOT NULL,
            descricao TEXT,
            projeto_id INTEGER NOT NULL REFERENCES projetos(id),
            aluno_id INTEGER NOT NULL REFERENCES alunos(id),
            orientador_id INTEGER NOT NULL REFERENCES orientadores(id),
            data_criacao VARCHAR(20)
        );
        
        -- Tabela admins
        CREATE TABLE IF NOT EXISTS admins (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            telefone VARCHAR(20),
            titulacao VARCHAR(100),
            lattes_url VARCHAR(200),
            biografia TEXT,
            areas_interesse TEXT
        );
        """
        
        for statement in create_tables_sql.split(';'):
            if statement.strip():
                postgres_cursor.execute(statement.strip())
        
        postgres_conn.commit()
        print("✅ Tabelas criadas com sucesso!")
        
        # 2. Migrar dados
        tables_to_migrate = [
            'orientadores',
            'alunos', 
            'projetos',
            'documentos',
            'comentarios',
            'atividades',
            'admins'
        ]
        
        for table in tables_to_migrate:
            print(f"📦 Migrando tabela {table}...")
            
            # Verificar se a tabela existe no SQLite
            sqlite_cursor = sqlite_conn.cursor()
            sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
            if not sqlite_cursor.fetchone():
                print(f"⚠️ Tabela {table} não existe no SQLite, pulando...")
                continue
            
            # Obter dados do SQLite
            sqlite_cursor.execute(f"SELECT * FROM {table}")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                print(f"ℹ️ Tabela {table} está vazia, pulando...")
                continue
            
            # Obter nomes das colunas
            column_names = [description[0] for description in sqlite_cursor.description]
            
            # Limpar dados existentes no PostgreSQL (opcional)
            postgres_cursor.execute(f"DELETE FROM {table}")
              # Inserir dados no PostgreSQL
            placeholders = ','.join(['%s'] * len(column_names))
            insert_sql = f"INSERT INTO {table} ({','.join(column_names)}) VALUES ({placeholders})"
            
            migrated_count = 0
            for row in rows:
                try:
                    # Converter valores boolean se necessário
                    if table == 'orientadores' and len(row) > 8:
                        row = list(row)
                        # is_coordenador é o 9º campo (índice 8)
                        row[8] = bool(row[8]) if row[8] is not None else False
                        row = tuple(row)
                    
                    postgres_cursor.execute(insert_sql, row)
                    migrated_count += 1
                except Exception as e:
                    print(f"⚠️ Erro ao inserir linha em {table}: {e}")
                    postgres_conn.rollback()
                    postgres_conn = psycopg2.connect(
                        host="pictibmec-postgres-dev-ggfpbptwi4pwg.postgres.database.azure.com",
                        database="pictibmec_db",
                        user="pictibmecadmin",
                        password="MinhaSenha123!",
                        port=5432,
                        sslmode="require"
                    )
                    postgres_cursor = postgres_conn.cursor()
                    continue
            
            postgres_conn.commit()
            print(f"✅ {migrated_count} registros migrados para {table}")
        
        print("🎉 Migração concluída com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        postgres_conn.rollback()
    
    finally:
        sqlite_conn.close()
        postgres_conn.close()

if __name__ == "__main__":
    migrate_data()
