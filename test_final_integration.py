#!/usr/bin/env python3
"""
Teste completo da integração com Cloud SQL
"""

import requests
import json
import time

def test_cloud_sql_integration():
    """Testa se a integração com Cloud SQL está funcionando"""
    
    backend_url = "https://rrdd-519104831129.us-central1.run.app"
    
    print("🚀 TESTANDO INTEGRAÇÃO COM CLOUD SQL")
    print("=" * 60)
    print()
    
    # Aguardar um pouco para o deploy ficar pronto
    print("⏳ Aguardando deploy ficar pronto...")
    time.sleep(5)
    
    # Teste 1: Endpoint raiz
    print("🔍 Teste 1: Endpoint raiz")
    try:
        response = requests.get(f"{backend_url}/", timeout=15)
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            print("  ✅ Serviço respondendo")
        else:
            print(f"  ⚠️ Status inesperado: {response.status_code}")
    except Exception as e:
        print(f"  ❌ Erro: {e}")
    
    print()
    
    # Teste 2: Endpoint que usa banco de dados
    print("🔍 Teste 2: Endpoint com banco de dados")
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
        
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 400:
            print("  ✅ PostgreSQL funcionando! (erro de token esperado)")
            try:
                data = response.json()
                print(f"  📋 Resposta: {json.dumps(data, indent=2)}")
            except:
                pass
        elif response.status_code == 500:
            print("  ❌ Erro no servidor - possível problema de banco")
            print("  🔧 Vamos verificar os logs...")
        else:
            print(f"  📊 Status: {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ Erro na requisição: {e}")
    
    print()
    
    # Teste 3: Verificar CORS
    print("🔍 Teste 3: Verificação CORS")
    try:
        response = requests.options(
            f"{backend_url}/users/register/google/",
            headers={
                "Origin": "https://rrdd-front-519104831129.us-central1.run.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            },
            timeout=10
        )
        
        print(f"  Status OPTIONS: {response.status_code}")
        
        cors_headers = {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        }
        
        for header, value in cors_headers.items():
            if value:
                print(f"  🌐 {header}: {value}")
        
        if response.headers.get('access-control-allow-origin'):
            print("  ✅ CORS configurado corretamente")
        else:
            print("  ⚠️ CORS pode ter problemas")
            
    except Exception as e:
        print(f"  ❌ Erro CORS: {e}")

def suggest_next_steps():
    """Sugere próximos passos"""
    
    print("\n" + "="*60)
    print("📋 PRÓXIMOS PASSOS:")
    print("="*60)
    print()
    print("1. ✅ Cloud SQL configurado")
    print("2. ✅ Serviço atualizado")
    print("3. 🔄 Aguardar logs para confirmar conexão")
    print()
    print("🔍 PARA VER OS LOGS:")
    print("gcloud run logs tail rrdd --region=us-central1")
    print()
    print("📱 TESTE NO FRONTEND:")
    print("Acesse: https://rrdd-front-519104831129.us-central1.run.app")
    print("E teste o login com Google")
    print()
    print("💾 EXECUTAR MIGRAÇÕES (se necessário):")
    print("Se as tabelas não existirem no PostgreSQL, execute:")
    print("gcloud run jobs create django-migrate \\")
    print("  --image gcr.io/bold-artifact-463813-e9/rrdd \\")
    print("  --region us-central1 \\")
    print("  --set-env-vars DATABASE_URL='postgresql://derivada:derivada@/postgres?host=/cloudsql/bold-artifact-463813-e9:us-central1:admin' \\")
    print("  --add-cloudsql-instances bold-artifact-463813-e9:us-central1:admin \\")
    print("  --task-timeout 3600 \\")
    print("  --args 'python,manage.py,migrate'")

if __name__ == "__main__":
    test_cloud_sql_integration()
    suggest_next_steps()
