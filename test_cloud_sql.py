#!/usr/bin/env python3
"""
Testa se o backend consegue se conectar ao banco de dados
"""

import requests

def test_database_connection():
    """Testa a conexão com o banco de dados"""
    backend_url = "https://rrdd-519104831129.us-central1.run.app"
    
    print("🔍 Testando conexão atual do banco de dados...")
    print("=" * 60)
    
    # Testar endpoint que requer banco
    try:
        response = requests.post(
            f"{backend_url}/users/register/google/",
            headers={
                "Content-Type": "application/json",
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
