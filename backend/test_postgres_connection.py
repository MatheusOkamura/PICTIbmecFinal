#!/usr/bin/env python3
"""
Script para testar conexão com PostgreSQL no Azure
e visualizar informações básicas do banco de dados
"""
import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import traceback

def load_environment():
    """Carrega variáveis de ambiente"""
    load_dotenv()
    
    # Tentar DATABASE_URL primeiro
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url, "DATABASE_URL"
    
    # Se não tiver DATABASE_URL, usar configurações individuais
    host = os.getenv("POSTGRES_HOST")
    database = os.getenv("POSTGRES_DB")
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    port = os.getenv("POSTGRES_PORT", "5432")
    
    if all([host, database, user, password]):
        database_url = f"postgresql://{user}:{password}@{host}:{port}/{database}?sslmode=require"
        return database_url, "POSTGRES_CONFIG"
    
    return None, None

def test_connection():
    """Testa conexão com PostgreSQL"""
    print("🔍 Testando Conexão com PostgreSQL no Azure")
    print("=" * 50)
    
    # Carregar configurações
    database_url, config_type = load_environment()
    
    if not database_url:
        print("❌ Erro: Configurações do banco não encontradas!")
        print("\nVerifique se você tem um arquivo .env com:")
        print("- DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require")
        print("OU")
        print("- POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD")
        return False
    
    print(f"✅ Configuração encontrada: {config_type}")
    
    try:
        print("🔗 Tentando conectar ao banco...")
        
        # Conectar ao banco
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ Conexão estabelecida com sucesso!")
        
        # Informações do servidor
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"📊 Versão do PostgreSQL: {version['version']}")
        
        # Informações do banco atual
        cursor.execute("SELECT current_database();")
        current_db = cursor.fetchone()
        print(f"🗄️  Banco atual: {current_db['current_database']}")
        
        # Listar tabelas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"\n📋 Tabelas encontradas ({len(tables)}):")
        for table in tables:
            print(f"  • {table['table_name']}")
        
        # Estatísticas das tabelas
        if tables:
            print(f"\n📊 Estatísticas das Tabelas:")
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table['table_name']};")
                count = cursor.fetchone()
                print(f"  • {table['table_name']}: {count['count']} registros")
        
        # Informações de conexão
        cursor.execute("SELECT inet_server_addr(), inet_server_port();")
        server_info = cursor.fetchone()
        print(f"\n🌐 Servidor: {server_info['inet_server_addr']}:{server_info['inet_server_port']}")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Teste de conexão concluído com sucesso!")
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Erro de PostgreSQL: {e}")
        print(f"   Código: {e.pgcode}")
        return False
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        traceback.print_exc()
        return False

def show_connection_info():
    """Mostra informações para conexão manual"""
    print("\n" + "=" * 50)
    print("🔧 INFORMAÇÕES PARA CONEXÃO MANUAL")
    print("=" * 50)
    
    load_dotenv()
    
    host = os.getenv("POSTGRES_HOST")
    database = os.getenv("POSTGRES_DB")
    user = os.getenv("POSTGRES_USER")
    port = os.getenv("POSTGRES_PORT", "5432")
    
    if host:
        print(f"🌐 Host: {host}")
        print(f"🗄️  Database: {database}")
        print(f"👤 User: {user}")
        print(f"🔌 Port: {port}")
        print(f"🔒 SSL: Required")
        
        print(f"\n📋 String de Conexão para pgAdmin/DBeaver:")
        print(f"Host: {host}")
        print(f"Port: {port}")
        print(f"Database: {database}")
        print(f"Username: {user}")
        print(f"Password: [sua senha]")
        print(f"SSL Mode: require")
    else:
        print("❌ Configurações não encontradas no .env")

if __name__ == "__main__":
    if test_connection():
        show_connection_info()
    else:
        print("\n💡 Dica: Verifique suas configurações no arquivo .env")
        show_connection_info()
