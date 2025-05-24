"""
Configuração do banco de dados SQLite
"""
import sqlite3
import os

def setup_database():
    """
    Configura o banco de dados com as tabelas necessárias
    """
    # Criar o banco independente de já existir ou não
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Configurar tabela projetos
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='projetos'")
    table_exists = cursor.fetchone()
    
    if table_exists:
        cursor.execute("DROP TABLE projetos")
        print("Tabela 'projetos' existente excluída para recriação.")
    
    cursor.execute("""
    CREATE TABLE projetos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descricao TEXT,
        area_pesquisa TEXT NOT NULL DEFAULT 'Não especificada',
        palavras_chave TEXT,
        data_inicio TEXT,
        data_fim TEXT,
        orientador_id INTEGER,
        aluno_id INTEGER,
        status TEXT DEFAULT 'Em andamento',
        periodo INTEGER
    )
    """)
    
    # Configurar tabela alunos
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='alunos'")
    table_exists = cursor.fetchone()
    
    if table_exists:
        cursor.execute("DROP TABLE alunos")
        print("Tabela 'alunos' existente excluída para recriação.")
    
    cursor.execute("""
    CREATE TABLE alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        matricula TEXT NOT NULL,
        email TEXT NOT NULL,
        data_nascimento TEXT,
        telefone TEXT,
        curso TEXT,
        semestre INTEGER,
        projeto_id INTEGER,
        orientador_id INTEGER,
        status TEXT DEFAULT 'Ativo'
    )
    """)
    
    # Configurar tabela orientadores
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='orientadores'")
    table_exists = cursor.fetchone()
    
    if table_exists:
        cursor.execute("DROP TABLE orientadores")
        print("Tabela 'orientadores' existente excluída para recriação.")
    
    cursor.execute("""
    CREATE TABLE orientadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT,
        area_pesquisa TEXT,
        codigo TEXT NOT NULL,
        titulacao TEXT,
        lattes_url TEXT,
        is_coordenador INTEGER DEFAULT 0
    )
    """)
    
    # Inicializar sequências para começar em 1000
    cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('projetos', 999)")
    cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('alunos', 999)")  
    cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('orientadores', 999)")
    
    conn.commit()
    print("✅ Tabelas criadas com sucesso!")
    conn.close()

if __name__ == "__main__":
    setup_database()
