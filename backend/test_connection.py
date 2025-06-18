"""
Teste simples de conexão PostgreSQL
"""
import psycopg2
import os

def test_connection():
    try:
        # Conectar diretamente
        conn = psycopg2.connect(
            host="pictibmec-postgres-dev-ggfpbptwi4pwg.postgres.database.azure.com",
            database="pictibmec_db", 
            user="pictibmecadmin",
            password="P@ssw0rd123!",
            port=5432,
            sslmode="require"
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Conexão bem-sucedida! Versão: {version[0]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        return False

if __name__ == "__main__":
    test_connection()
