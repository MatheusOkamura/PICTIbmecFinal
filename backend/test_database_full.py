"""
Teste avançado do banco PostgreSQL com operações CRUD
"""
import psycopg2
import os
from dotenv import load_dotenv
from datetime import datetime

# Carregar variáveis do .env  
load_dotenv()

def test_database_operations():
    try:
        # Conectar ao banco
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            database=os.getenv("POSTGRES_DB"), 
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            port=os.getenv("POSTGRES_PORT", "5432"),
            sslmode="require"
        )
        
        cursor = conn.cursor()
        
        print("🔍 Analisando estrutura do banco de dados...")
        
        # Listar todas as tabelas e suas colunas
        cursor.execute("""
            SELECT 
                t.table_name,
                c.column_name,
                c.data_type,
                c.is_nullable
            FROM information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
            WHERE t.table_schema = 'public'
            ORDER BY t.table_name, c.ordinal_position;
        """)
        
        schema_info = cursor.fetchall()
        tables = {}
        for table_name, column_name, data_type, is_nullable in schema_info:
            if table_name not in tables:
                tables[table_name] = []
            tables[table_name].append({
                'column': column_name,
                'type': data_type,
                'nullable': is_nullable
            })
        
        print(f"✅ Estrutura das tabelas:")
        for table_name, columns in tables.items():
            print(f"  📋 {table_name}:")
            for col in columns:
                print(f"    • {col['column']} ({col['type']}) - {'NULL' if col['nullable'] == 'YES' else 'NOT NULL'}")
        
        # Contar registros em cada tabela
        print(f"\n📊 Contagem de registros:")
        for table_name in tables.keys():
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            print(f"  • {table_name}: {count} registros")
        
        # Testar operação de INSERT/SELECT/DELETE (tabela de teste)
        print(f"\n🧪 Testando operações CRUD...")
        
        # Criar tabela de teste temporária
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_connection (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # INSERT
        test_message = f"Teste de conexão - {datetime.now()}"
        cursor.execute(
            "INSERT INTO test_connection (message) VALUES (%s) RETURNING id;",
            (test_message,)
        )
        test_id = cursor.fetchone()[0]
        print(f"  ✅ INSERT: Registro criado com ID {test_id}")
        
        # SELECT
        cursor.execute("SELECT * FROM test_connection WHERE id = %s;", (test_id,))
        result = cursor.fetchone()
        print(f"  ✅ SELECT: {result}")
        
        # UPDATE
        cursor.execute(
            "UPDATE test_connection SET message = %s WHERE id = %s;",
            (f"Atualizado - {datetime.now()}", test_id)
        )
        print(f"  ✅ UPDATE: Registro {test_id} atualizado")
        
        # DELETE
        cursor.execute("DELETE FROM test_connection WHERE id = %s;", (test_id,))
        print(f"  ✅ DELETE: Registro {test_id} removido")
        
        # Limpar tabela de teste
        cursor.execute("DROP TABLE test_connection;")
        
        # Commit das operações
        conn.commit()
        
        # Informações do servidor
        cursor.execute("SHOW server_version;")
        version = cursor.fetchone()[0]
        
        cursor.execute("SELECT pg_size_pretty(pg_database_size(current_database()));")
        db_size = cursor.fetchone()[0]
        
        print(f"\n📈 Informações do servidor:")
        print(f"  • Versão: {version}")
        print(f"  • Tamanho do banco: {db_size}")
        
        cursor.close()
        conn.close()
        
        print(f"\n🎉 Todos os testes passaram! O banco PostgreSQL está funcionando perfeitamente!")
        return True
        
    except Exception as e:
        print(f"❌ Erro durante os testes: {e}")
        return False

if __name__ == "__main__":
    test_database_operations()
