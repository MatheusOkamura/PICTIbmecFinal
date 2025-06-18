"""
Teste da configuração do database_config.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database_config import DatabaseConfig

def test_database_config():
    try:
        print("🔧 Testando configuração do banco de dados...")
        
        # Inicializar configuração
        config = DatabaseConfig()
        
        print(f"✅ Configuração carregada com sucesso!")
        print(f"📍 Database URL: {config.database_url}")
        
        # Testar engine
        print(f"🔗 Testando engine SQLAlchemy...")
        engine = config.engine
          # Testar conexão
        with engine.connect() as connection:
            from sqlalchemy import text
            result = connection.execute(text("SELECT 1 as test"))
            test_value = result.fetchone()[0]
            print(f"✅ Conexão SQLAlchemy funcionando! Teste: {test_value}")
        
        # Testar session
        print(f"📝 Testando sessão SQLAlchemy...")
        SessionLocal = config.SessionLocal
        session = SessionLocal()
        
        from sqlalchemy import text
        result = session.execute(text("SELECT current_database()"))
        db_name = result.fetchone()[0]
        print(f"✅ Sessão funcionando! Database: {db_name}")
        
        session.close()
        
        print(f"\n🎉 Configuração do banco de dados está funcionando perfeitamente!")
        return True
        
    except Exception as e:
        print(f"❌ Erro na configuração: {e}")
        return False

if __name__ == "__main__":
    test_database_config()
