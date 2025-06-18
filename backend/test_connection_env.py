"""
Teste de conexão PostgreSQL usando variáveis de ambiente
"""
import psycopg2
import os
from dotenv import load_dotenv

# Carregar variáveis do .env
load_dotenv()

def test_connection():
    try:
        # Pegar credenciais do .env
        host = os.getenv("POSTGRES_HOST")
        database = os.getenv("POSTGRES_DB")
        user = os.getenv("POSTGRES_USER")
        password = os.getenv("POSTGRES_PASSWORD")
        port = os.getenv("POSTGRES_PORT", "5432")
        
        print(f"Testando conexão com:")
        print(f"Host: {host}")
        print(f"Database: {database}")
        print(f"User: {user}")
        print(f"Port: {port}")
        
        # Conectar usando variáveis de ambiente
        conn = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port,
            sslmode="require"
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Conexão bem-sucedida! Versão: {version[0]}")
        
        # Testar algumas operações básicas
        cursor.execute("SELECT current_database();")
        db_name = cursor.fetchone()
        print(f"✅ Database atual: {db_name[0]}")
        
        cursor.execute("SELECT current_user;")
        current_user = cursor.fetchone()
        print(f"✅ Usuário atual: {current_user[0]}")
        
        # Listar tabelas (se houver)
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        """)
        tables = cursor.fetchall()
        if tables:
            print(f"✅ Tabelas encontradas: {[table[0] for table in tables]}")
        else:
            print("ℹ️  Nenhuma tabela encontrada no schema public")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        return False

if __name__ == "__main__":
    test_connection()
