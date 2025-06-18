"""
Migração simples e direta do SQLite para PostgreSQL
"""
import sqlite3
import psycopg2
import os
from datetime import datetime

def migrate_table(sqlite_cursor, postgres_cursor, table_name, columns_mapping=None):
    """Migra uma tabela específica"""
    try:
        # Obter dados do SQLite
        sqlite_cursor.execute(f"SELECT * FROM {table_name}")
        rows = sqlite_cursor.fetchall()
        
        if not rows:
            print(f"  📝 Tabela {table_name} está vazia")
            return 0
        
        # Obter nomes das colunas
        sqlite_cursor.execute(f"PRAGMA table_info({table_name})")
        columns_info = sqlite_cursor.fetchall()
        columns = [col[1] for col in columns_info]
        
        migrated = 0
        for row in rows:
            data = dict(zip(columns, row))
            
            # Preparar dados para inserção
            if table_name == "orientadores":
                sql = """
                    INSERT INTO orientadores (nome, email, telefone, area_pesquisa, codigo, titulacao, lattes_url, is_coordenador, biografia, areas_interesse)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (email) DO NOTHING
                """
                values = (
                    data.get('nome'),
                    data.get('email'),
                    data.get('telefone'),
                    data.get('area_pesquisa'),
                    data.get('codigo'),
                    data.get('titulacao'),
                    data.get('lattes_url'),
                    bool(data.get('is_coordenador', 0)),
                    data.get('biografia'),
                    data.get('areas_interesse')
                )
            
            elif table_name == "alunos":
                sql = """
                    INSERT INTO alunos (nome, matricula, email, data_nascimento, telefone, curso, semestre, projeto_id, orientador_id, status, biografia, interesses_pesquisa, linkedin_url, github_url, periodo)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (email) DO NOTHING
                """
                values = (
                    data.get('nome'),
                    data.get('matricula'),
                    data.get('email'),
                    data.get('data_nascimento'),
                    data.get('telefone'),
                    data.get('curso'),
                    data.get('semestre'),
                    data.get('projeto_id'),
                    data.get('orientador_id'),
                    data.get('status', 'Ativo'),
                    data.get('biografia'),
                    data.get('interesses_pesquisa'),
                    data.get('linkedin_url'),
                    data.get('github_url'),
                    data.get('periodo', 'matutino')
                )
            
            elif table_name == "projetos":
                sql = """
                    INSERT INTO projetos (codigo, titulo, descricao, area_pesquisa, palavras_chave, data_inicio, data_fim, orientador_id, aluno_id, status, periodo, data_submissao, data_aprovacao)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (codigo) DO NOTHING
                """
                values = (
                    data.get('codigo'),
                    data.get('titulo'),
                    data.get('descricao'),
                    data.get('area_pesquisa', 'Não especificada'),
                    data.get('palavras_chave'),
                    data.get('data_inicio'),
                    data.get('data_fim'),
                    data.get('orientador_id'),
                    data.get('aluno_id'),
                    data.get('status', 'pendente'),
                    data.get('periodo'),
                    data.get('data_submissao'),
                    data.get('data_aprovacao')
                )
            
            elif table_name == "documentos":
                sql = """
                    INSERT INTO documentos (projeto_id, nome_arquivo, caminho_arquivo, tipo_arquivo, tamanho_arquivo, data_upload, comentario_aluno)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                values = (
                    data.get('projeto_id'),
                    data.get('nome_arquivo'),
                    data.get('caminho_arquivo'),
                    data.get('tipo_arquivo'),
                    data.get('tamanho_arquivo'),
                    data.get('data_upload'),
                    data.get('comentario_aluno')
                )
            
            elif table_name == "comentarios":
                sql = """
                    INSERT INTO comentarios (documento_id, usuario_id, usuario_tipo, comentario, data_comentario)
                    VALUES (%s, %s, %s, %s, %s)
                """
                values = (
                    data.get('documento_id'),
                    data.get('usuario_id'),
                    data.get('usuario_tipo'),
                    data.get('comentario'),
                    data.get('data_comentario')
                )
            
            elif table_name == "atividades":
                sql = """
                    INSERT INTO atividades (titulo, descricao, projeto_id, aluno_id, orientador_id, data_criacao)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                values = (
                    data.get('titulo'),
                    data.get('descricao'),
                    data.get('projeto_id'),
                    data.get('aluno_id'),
                    data.get('orientador_id'),
                    data.get('data_criacao')
                )
            
            elif table_name == "admins":
                sql = """
                    INSERT INTO admins (nome, email, telefone, titulacao, lattes_url, biografia, areas_interesse)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (email) DO NOTHING
                """
                values = (
                    data.get('nome'),
                    data.get('email'),
                    data.get('telefone'),
                    data.get('titulacao'),
                    data.get('lattes_url'),
                    data.get('biografia'),
                    data.get('areas_interesse')
                )
            
            else:
                continue
            
            try:
                postgres_cursor.execute(sql, values)
                migrated += 1
            except Exception as e:
                print(f"    ⚠️ Erro ao inserir registro em {table_name}: {e}")
        
        print(f"  ✅ {migrated} registros migrados da tabela {table_name}")
        return migrated
        
    except Exception as e:
        print(f"  ❌ Erro ao migrar tabela {table_name}: {e}")
        return 0

def create_tables(postgres_cursor):
    """Cria as tabelas no PostgreSQL"""
    
    tables_sql = [
        """        CREATE TABLE IF NOT EXISTS orientadores (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(200) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            telefone VARCHAR(50),
            area_pesquisa VARCHAR(200),
            codigo VARCHAR(100) NOT NULL UNIQUE,
            titulacao VARCHAR(200),
            lattes_url VARCHAR(300),
            is_coordenador BOOLEAN DEFAULT FALSE,
            biografia TEXT,
            areas_interesse TEXT
        )
        """,
        """        CREATE TABLE IF NOT EXISTS alunos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(200) NOT NULL,
            matricula VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(150) NOT NULL UNIQUE,
            data_nascimento VARCHAR(50),
            telefone VARCHAR(50),
            curso VARCHAR(200),
            semestre INTEGER,
            projeto_id INTEGER,
            orientador_id INTEGER,
            status VARCHAR(50) DEFAULT 'Ativo',
            biografia TEXT,
            interesses_pesquisa TEXT,
            linkedin_url VARCHAR(300),
            github_url VARCHAR(300),
            periodo VARCHAR(50) DEFAULT 'matutino'
        )
        """,
        """        CREATE TABLE IF NOT EXISTS projetos (
            id SERIAL PRIMARY KEY,
            codigo VARCHAR(100) NOT NULL UNIQUE,
            titulo VARCHAR(500) NOT NULL,
            descricao TEXT,
            area_pesquisa VARCHAR(200) NOT NULL DEFAULT 'Não especificada',
            palavras_chave TEXT,
            data_inicio VARCHAR(50),
            data_fim VARCHAR(50),
            orientador_id INTEGER,
            aluno_id INTEGER,
            status VARCHAR(50) DEFAULT 'pendente',
            periodo INTEGER,
            data_submissao VARCHAR(50),
            data_aprovacao VARCHAR(50)
        )
        """,
        """        CREATE TABLE IF NOT EXISTS documentos (
            id SERIAL PRIMARY KEY,
            projeto_id INTEGER NOT NULL,
            nome_arquivo VARCHAR(500) NOT NULL,
            caminho_arquivo TEXT NOT NULL,
            tipo_arquivo VARCHAR(100),
            tamanho_arquivo INTEGER,
            data_upload VARCHAR(50),
            comentario_aluno TEXT
        )
        """,
        """        CREATE TABLE IF NOT EXISTS comentarios (
            id SERIAL PRIMARY KEY,
            documento_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            usuario_tipo VARCHAR(50) NOT NULL,
            comentario TEXT NOT NULL,
            data_comentario VARCHAR(50)
        )
        """,
        """        CREATE TABLE IF NOT EXISTS atividades (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(500) NOT NULL,
            descricao TEXT,
            projeto_id INTEGER NOT NULL,
            aluno_id INTEGER NOT NULL,
            orientador_id INTEGER NOT NULL,
            data_criacao VARCHAR(50)
        )
        """,
        """        CREATE TABLE IF NOT EXISTS admins (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(200) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            telefone VARCHAR(50),
            titulacao VARCHAR(200),
            lattes_url VARCHAR(300),
            biografia TEXT,
            areas_interesse TEXT
        )
        """
    ]
    
    for sql in tables_sql:
        postgres_cursor.execute(sql)
    
    print("✅ Tabelas criadas no PostgreSQL")

def main():
    print("=" * 50)
    print("MIGRAÇÃO SQLITE → POSTGRESQL")
    print("=" * 50)
    
    # Conectar ao SQLite
    sqlite_path = "database.db"
    if not os.path.exists(sqlite_path):
        print(f"❌ Arquivo SQLite não encontrado: {sqlite_path}")
        return
    
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_cursor = sqlite_conn.cursor()
    
    # Conectar ao PostgreSQL
    try:
        postgres_conn = psycopg2.connect(
            host="pictibmec-postgres-dev-ggfpbptwi4pwg.postgres.database.azure.com",
            database="pictibmec_db",
            user="pictibmecadmin",
            password="P@ssw0rd123!",
            port=5432,
            sslmode="require"
        )
        postgres_cursor = postgres_conn.cursor()
        print("✅ Conectado ao PostgreSQL")
        
    except Exception as e:
        print(f"❌ Erro ao conectar no PostgreSQL: {e}")
        return
    
    try:
        # Criar tabelas
        print("\n📋 Criando tabelas...")
        create_tables(postgres_cursor)
        postgres_conn.commit()
        
        # Migrar dados (em ordem de dependências)
        print("\n📊 Migrando dados...")
        
        tables_order = [
            "orientadores",
            "alunos", 
            "projetos",
            "documentos",
            "comentarios",
            "atividades",
            "admins"
        ]
        
        total_migrated = 0
        for table in tables_order:
            # Verificar se a tabela existe no SQLite
            sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
            if sqlite_cursor.fetchone():
                count = migrate_table(sqlite_cursor, postgres_cursor, table)
                total_migrated += count
            else:
                print(f"  📝 Tabela {table} não existe no SQLite")
        
        postgres_conn.commit()
        print(f"\n🎉 Migração concluída! {total_migrated} registros migrados no total.")
        
    except Exception as e:
        print(f"❌ Erro durante a migração: {e}")
        postgres_conn.rollback()
    
    finally:
        sqlite_conn.close()
        postgres_conn.close()

if __name__ == "__main__":
    main()
