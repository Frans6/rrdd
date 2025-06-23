#!/usr/bin/env python3
"""
Script para testar a configuração de banco de dados do deployment
"""

import requests
import json

def test_database_connection():
    """Testa se o banco de dados está configurado corretamente"""
    
    backend_url = "https://rrdd-519104831129.us-central1.run.app"
    
    print("🔍 Testando configuração de banco de dados...")
    print("=" * 60)
    
    # Tentar uma requisição que não precise de banco de dados
    try:
        response = requests.get(f"{backend_url}/", timeout=10)
        print(f"✅ Endpoint raiz funcionando: {response.status_code}")
    except Exception as e:
        print(f"❌ Erro no endpoint raiz: {e}")
        return
    
    # Tentar requisição que precisa de banco de dados
    try:
        response = requests.post(
            f"{backend_url}/users/register/google/",
            headers={
                "Content-Type": "application/json",
                "Origin": "https://rrdd-front-519104831129.us-central1.run.app"
            },
            json={"access_token": "test_token"},
            timeout=10
        )
        
        print(f"📊 Status da autenticação: {response.status_code}")
        
        if response.status_code == 500:
            print("❌ Erro 500 - Provável problema de banco de dados")
            # Tentar pegar detalhes do erro
            try:
                error_text = response.text
                if "could not translate host name" in error_text:
                    print("🚨 CONFIRMADO: Problema de configuração de banco de dados")
                    print("💡 Solução: Configurar DATABASE_URL no Google Cloud Run")
                else:
                    print("🔍 Outro tipo de erro 500")
            except:
                pass
        elif response.status_code == 400:
            print("✅ Banco de dados funcionando (erro de token esperado)")
            try:
                data = response.json()
                print(f"📋 Resposta: {json.dumps(data, indent=2)}")
            except:
                pass
        else:
            print(f"⚠️ Status inesperado: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro na requisição de autenticação: {e}")

def suggest_solution():
    """Sugere a solução para configurar DATABASE_URL"""
    
    print("\n" + "="*60)
    print("🛠️ SOLUÇÃO RECOMENDADA:")
    print("="*60)
    print()
    print("1. Configure a variável DATABASE_URL no Google Cloud Run:")
    print("   gcloud run services update rrdd-519104831129 \\")
    print("     --region=us-central1 \\")
    print("     --set-env-vars DATABASE_URL='postgresql://user:password@host:port/database?sslmode=require'")
    print()
    print("2. Exemplo de DATABASE_URL para Cloud SQL:")
    print("   postgresql://usuario:senha@ip_do_banco:5432/nome_do_banco?sslmode=require")
    print()
    print("3. Ou use Cloud SQL Proxy:")
    print("   postgresql://usuario:senha@/nome_do_banco?host=/cloudsql/projeto:regiao:instancia")
    print()
    print("4. Redeploy após configurar:")
    print("   gcloud run deploy rrdd-519104831129 --region=us-central1")
    print()

if __name__ == "__main__":
    test_database_connection()
    suggest_solution()
