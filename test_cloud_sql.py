#!/usr/bin/env python3
"""
Script para testar conexão com Cloud SQL PostgreSQL - Instância admin
Execute no Cloud Shell após fazer upload do projeto
"""

import os
import sys

def test_cloud_sql_connection():
    """Testa conexão com Cloud SQL usando psycopg2"""
    
    try:
        import psycopg2
        print("✅ psycopg2 está disponível")
    except ImportError:
        print("❌ psycopg2 não está instalado. Instalando...")
        os.system("pip install psycopg2-binary")
        import psycopg2
    
    # Configurações da instância admin (IP público)
    config = {
        'host': '34.57.180.53',  # IP da instância admin
        'port': 5432,
        'database': 'postgres',
        'user': 'derivada',
        'password': 'derivada',
    }
    
    print("🔍 Testando conexão com Cloud SQL...")
    print(f"Host: {config['host']}")
    print(f"Database: {config['database']}")
    print(f"User: {config['user']}")
    
    try:
        # Tentar conectar
        conn = psycopg2.connect(**config)
        cursor = conn.cursor()
        
        # Testar uma query simples
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print("✅ Conexão bem-sucedida!")
        print(f"Versão do PostgreSQL: {version[0]}")
        
        # Testar usuário atual
        cursor.execute("SELECT current_user, current_database();")
        result = cursor.fetchone()
        print(f"👤 Usuário: {result[0]}, Banco: {result[1]}")
        
        # Testar criação de tabela
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_connection (
                id SERIAL PRIMARY KEY,
                test_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Inserir dados de teste
        cursor.execute("INSERT INTO test_connection (test_name) VALUES (%s)", ("Django RRDD Test",))
        
        # Consultar dados
        cursor.execute("SELECT * FROM test_connection ORDER BY created_at DESC LIMIT 5;")
        results = cursor.fetchall()
        
        print("📊 Últimos registros de teste:")
        for row in results:
            print(f"  ID: {row[0]}, Nome: {row[1]}, Criado: {row[2]}")
        
        # Commit das mudanças
        conn.commit()
        
        # Fechar conexões
        cursor.close()
        conn.close()
        
        print("🎉 Teste completo! Cloud SQL admin está funcionando.")
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Erro de conexão com PostgreSQL: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False
    
    # Configurações do banco (ajuste conforme sua instância)
    DB_CONFIG = {
        'host': '/cloudsql/bold-artifact-463813-e9:us-central1:admin',
        'database': 'postgres',
        'user': 'derivada',
        'password': 'derivada',
        'port': None,  # Não usado com Cloud SQL Proxy
    }
    
    print("🔍 Testando conexão com Cloud SQL...")
    print(f"   Host: {DB_CONFIG['host']}")
    print(f"   Database: {DB_CONFIG['database']}")
    print(f"   User: {DB_CONFIG['user']}")
    print()
    
    try:
        # Tentar conectar
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            sslmode='disable'
        )
        
        print("✅ Conexão estabelecida com sucesso!")
        
        # Testar uma query simples
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        print(f"📊 Versão do PostgreSQL: {db_version[0]}")
        
        # Testar criação de tabela
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_table (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Inserir dados de teste
        cursor.execute("""
            INSERT INTO test_table (name) VALUES (%s);
        """, ("Teste Cloud SQL",))
        
        # Buscar dados
        cursor.execute("SELECT * FROM test_table ORDER BY id DESC LIMIT 1;")
        result = cursor.fetchone()
        print(f"📝 Teste de inserção: ID={result[0]}, Nome='{result[1]}'")
        
        # Limpar tabela de teste
        cursor.execute("DROP TABLE test_table;")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Todos os testes passaram! Cloud SQL está funcionando corretamente.")
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Erro de conexão: {e}")
        print("\n🔧 Possíveis soluções:")
        print("   1. Verifique se o instance ID está correto")
        print("   2. Confirme se o usuário 'derivada' existe")
        print("   3. Verifique se a senha está correta")
        print("   4. Certifique-se de estar executando no Cloud Shell ou com Cloud SQL Proxy")
        return False
        
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def test_backend_database():
    """Testa se o backend consegue se conectar ao banco de dados"""
    import requests
    
    backend_url = "https://rrdd-519104831129.us-central1.run.app"
    
    print("🔍 Testando conexão do backend com o banco...")
    print("=" * 60)
    
    # Testar endpoint que requer banco
    try:
        response = requests.post(
            f"{backend_url}/users/register/google/",
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={
                "access_token": "fake_token_for_db_test"
            },
            timeout=10
        )
        
        print(f"📡 Status: {response.status_code}")
        print(f"📄 Response: {response.text[:200]}...")
        
        if response.status_code == 500:
            if "relation" in response.text and "does not exist" in response.text:
                print("⚠️  Banco conectado, mas faltam migrações!")
                return "needs_migration"
            else:
                print("❌ Erro de servidor (verificar logs)")
                return False
        elif response.status_code in [400, 401]:
            print("✅ Banco conectado! (erro esperado - token inválido)")
            return True
        else:
            print("✅ Backend e banco funcionando!")
            return True
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de rede: {e}")
        return False
                "Origin": "https://rrdd-front-519104831129.us-central1.run.app"
            },
            json={"access_token": "test_token"},
            timeout=15
        )
        
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Banco de dados funcionando (SQLite local)")
            print("📝 Resposta:", response.json())
        elif response.status_code == 500:
            print("❌ Erro de banco de dados")
            print("🔧 Precisa configurar DATABASE_URL")
        else:
            print(f"⚠️ Status inesperado: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")

if __name__ == "__main__":
    test_database_connection()
    
    print("\n" + "="*60)
    print("📋 PRÓXIMOS PASSOS:")
    print("="*60)
    print("1. Obtenha as informações do seu Cloud SQL:")
    print("   - Connection name: bold-artifact-463813-e9:us-central1:admin")
    print("   - Usuário e senha do banco")
    print("   - Nome do banco de dados")
    print()
    print("2. Configure a DATABASE_URL no Cloud Run")
    print("3. Redeploy o serviço")
    print()
    print("💡 Exemplo de comando:")
    print("gcloud run services update rrdd-519104831129 \\")
    print("  --region=us-central1 \\")
    print("  --set-env-vars DATABASE_URL='postgresql://postgres:senha@/postgres?host=/cloudsql/bold-artifact-463813-e9:us-central1:admin' \\")
    print("  --add-cloudsql-instances=bold-artifact-463813-e9:us-central1:admin")
