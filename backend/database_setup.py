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
        status TEXT DEFAULT 'pendente',
        periodo INTEGER,
        data_submissao TEXT,
        data_aprovacao TEXT,
        FOREIGN KEY (orientador_id) REFERENCES orientadores (id),
        FOREIGN KEY (aluno_id) REFERENCES alunos (id)
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
        status TEXT DEFAULT 'Ativo',
        biografia TEXT,
        interesses_pesquisa TEXT,
        linkedin_url TEXT,
        github_url TEXT,
        periodo TEXT DEFAULT 'matutino'
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
        is_coordenador INTEGER DEFAULT 0,
        biografia TEXT,
        areas_interesse TEXT
    )
    """)
    
    # Nova tabela para documentos
    cursor.execute("DROP TABLE IF EXISTS documentos")
    cursor.execute("""
    CREATE TABLE documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projeto_id INTEGER NOT NULL,
        nome_arquivo TEXT NOT NULL,
        caminho_arquivo TEXT NOT NULL,
        tipo_arquivo TEXT,
        tamanho_arquivo INTEGER,
        data_upload TEXT,
        comentario_aluno TEXT,
        FOREIGN KEY (projeto_id) REFERENCES projetos (id)
    )
    """)
    
    # Nova tabela para comentários
    cursor.execute("DROP TABLE IF EXISTS comentarios")
    cursor.execute("""
    CREATE TABLE comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        documento_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        usuario_tipo TEXT NOT NULL,
        comentario TEXT NOT NULL,
        data_comentario TEXT,
        FOREIGN KEY (documento_id) REFERENCES documentos (id)
    )
    """)
    
    # Inicializar sequências para começar em 1000
    cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('projetos', 'alunos', 'orientadores')")
    cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('projetos', 999)")
    cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('alunos', 999)")  
    cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('orientadores', 999)")
    cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('documentos', 999)")
    cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('comentarios', 999)")
    
    conn.commit()
    print("✅ Tabelas criadas com sucesso!")
    
    # Inserir dados de exemplo
    inserir_dados_exemplo(cursor)
    conn.commit()
    conn.close()

def inserir_dados_exemplo(cursor):
    """Insere dados de exemplo para teste"""
    
    # Inserir orientadores de exemplo
    orientadores = [
        ("Prof. Dr. Ana Santos", "ana.santos@ibmec.edu.br", "(21) 99999-1111", "Inteligência Artificial", "ANA_SANTOS", "Doutora em Ciência da Computação", "", 0, "Especialista em IA e Machine Learning com foco em aplicações educacionais.", "Inteligência Artificial,Machine Learning,Análise de Dados"),
        ("Prof. Dr. Carlos Silva", "carlos.silva@ibmec.edu.br", "(21) 99999-2222", "IoT", "CARLOS_SILVA", "Doutor em Engenharia Elétrica", "", 0, "Pesquisador em IoT e sistemas embarcados.", "IoT,Sistemas Embarcados,Redes"),
        ("Prof. Dra. Maria Oliveira", "maria.oliveira@ibmec.edu.br", "(21) 99999-3333", "Desenvolvimento Web", "MARIA_OLIVEIRA", "Doutora em Design Digital", "", 0, "Especialista em desenvolvimento web e UX/UI.", "Desenvolvimento Web,UI/UX,Frontend")
    ]
    
    for orientador in orientadores:
        cursor.execute("""
            INSERT INTO orientadores (nome, email, telefone, area_pesquisa, codigo, titulacao, lattes_url, is_coordenador, biografia, areas_interesse)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, orientador)
    
    print("✅ Dados de exemplo inseridos!")

if __name__ == "__main__":
    setup_database()