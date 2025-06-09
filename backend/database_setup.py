"""
Configuração do banco de dados SQLite
"""
import sqlite3
import os

def setup_database():
    """
    Configura o banco de dados com as tabelas necessárias, sem reiniciar se já existir.
    """
    if os.path.exists('database.db'):
        print("✅ Banco de dados já configurado. Nenhuma ação necessária.")
        return

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Configurar tabela projetos
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='projetos'")
    if not cursor.fetchone():
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
    if not cursor.fetchone():
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
    if not cursor.fetchone():
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
    
    # Configurar tabela documentos
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='documentos'")
    if not cursor.fetchone():
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
    
    # Configurar tabela comentários
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='comentarios'")
    if not cursor.fetchone():
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
    
    # Configurar tabela atividades (força a criação)
    try:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS atividades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            projeto_id INTEGER NOT NULL,
            aluno_id INTEGER NOT NULL,
            orientador_id INTEGER NOT NULL,
            data_criacao TEXT,
            FOREIGN KEY (projeto_id) REFERENCES projetos (id),
            FOREIGN KEY (aluno_id) REFERENCES alunos (id),
            FOREIGN KEY (orientador_id) REFERENCES orientadores (id)
        )
        """)
        print("Tabela 'atividades' verificada/criada com sucesso.")
    except Exception as e:
        print("Erro ao criar/verificar tabela 'atividades':", e)
    
    # Adicionar tabela admins com campos de perfil completo
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='admins'")
    if not cursor.fetchone():
        cursor.execute("""
        CREATE TABLE admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            telefone TEXT,
            titulacao TEXT,
            lattes_url TEXT,
            biografia TEXT,
            areas_interesse TEXT
        )
        """)
    
    # Inicializar sequências apenas se estiverem ausentes
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'")
    if cursor.fetchone():
        cursor.execute("SELECT seq FROM sqlite_sequence WHERE name='projetos'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('projetos', 999)")
        cursor.execute("SELECT seq FROM sqlite_sequence WHERE name='alunos'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('alunos', 999)")
        cursor.execute("SELECT seq FROM sqlite_sequence WHERE name='orientadores'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('orientadores', 999)")
        cursor.execute("SELECT seq FROM sqlite_sequence WHERE name='documentos'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('documentos', 999)")
        cursor.execute("SELECT seq FROM sqlite_sequence WHERE name='comentarios'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('comentarios', 999)")
        cursor.execute("SELECT seq FROM sqlite_sequence WHERE name='atividades'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('atividades', 999)")
        cursor.execute("SELECT seq FROM sqlite_sequence WHERE name='admins'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('admins', 999)")
    
    conn.commit()
    print("✅ Banco de dados configurado com sucesso!")
    
    # Inserir dados de exemplo apenas se as tabelas estiverem vazias
    cursor.execute("SELECT COUNT(*) FROM orientadores")
    if cursor.fetchone()[0] == 0:
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