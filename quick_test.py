#!/usr/bin/env python3
"""
Teste rápido e direto da integração
"""

import subprocess
import time

def test_quick():
    print("🚀 TESTE RÁPIDO APÓS DEPLOY")
    print("=" * 50)
    print()
    
    # Teste básico com curl
    print("🔍 Testando endpoint básico...")
    try:
        result = subprocess.run([
            "curl", "-s", "-w", "%{http_code}",
            "https://rrdd-519104831129.us-central1.run.app/"
        ], capture_output=True, text=True, timeout=10)
        
        print(f"Status: {result.stdout}")
        if "200" in result.stdout:
            print("✅ Serviço básico funcionando")
        else:
            print("⚠️ Possível problema no serviço")
    except Exception as e:
        print(f"❌ Erro: {e}")
    
    print()
    
    # Teste endpoint de autenticação
    print("🔍 Testando endpoint de autenticação...")
    try:
        result = subprocess.run([
            "curl", "-s", "-X", "POST",
            "https://rrdd-519104831129.us-central1.run.app/users/register/google/",
            "-H", "Content-Type: application/json",
            "-H", "Origin: https://rrdd-front-519104831129.us-central1.run.app",
            "-d", '{"access_token": "test"}',
            "--max-time", "15"
        ], capture_output=True, text=True, timeout=20)
        
        print(f"Resposta: {result.stdout}")
        
        if "Invalid token" in result.stdout:
            print("✅ PostgreSQL + Django funcionando perfeitamente!")
        elif "could not translate host name" in result.stdout:
            print("❌ Problema de conexão com banco")
        elif result.stdout == "":
            print("⏳ Serviço ainda inicializando...")
        else:
            print("🔍 Resposta inesperada - vamos investigar")
            
    except Exception as e:
        print(f"❌ Erro no teste: {e}")

if __name__ == "__main__":
    test_quick()
    
    print("\n" + "="*50)
    print("💡 ANÁLISE:")
    print("="*50)
    print("Se viu '✅ PostgreSQL + Django funcionando perfeitamente!':")
    print("  → Tudo certo! Deploy vai funcionar")
    print()
    print("Se viu problemas:")
    print("  → Vamos debugar juntos")
    print()
    print("🔍 Para ver logs detalhados:")
    print("gcloud run logs tail rrdd --region=us-central1")
