#!/usr/bin/env python3
"""
Script para testar endpoints da API em diferentes deployments
"""
import requests
import json
import sys

# URLs de teste
test_urls = [
    "https://api-929876234648.us-central1.run.app",
    "https://api-dot-reidaderivada2024.uc.r.appspot.com",
    # Adicione outras URLs conforme necessário
]

# Endpoints para testar
endpoints = [
    "/api/health/",
    "/users/register/google/",
    "/api/",
    "/admin/",
    "/swagger/"
]

def test_endpoint(base_url, endpoint):
    """Testa um endpoint específico"""
    url = f"{base_url}{endpoint}"
    print(f"\n🔍 Testando: {url}")
    
    try:
        # Teste OPTIONS (CORS)
        options_response = requests.options(url, timeout=10)
        print(f"OPTIONS: {options_response.status_code}")
        if 'access-control-allow-origin' in options_response.headers:
            print(f"CORS Origin: {options_response.headers['access-control-allow-origin']}")
        
        # Teste GET
        get_response = requests.get(url, timeout=10)
        print(f"GET: {get_response.status_code}")
        
        if get_response.status_code == 200:
            print("✅ Endpoint acessível")
        elif get_response.status_code == 404:
            print("❌ Endpoint não encontrado (404)")
        elif get_response.status_code == 405:
            print("⚠️ Método não permitido (405) - endpoint existe mas GET não é suportado")
        else:
            print(f"⚠️ Status: {get_response.status_code}")
            
    except requests.exceptions.Timeout:
        print("⏰ Timeout")
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão")
    except Exception as e:
        print(f"❌ Erro: {e}")

def test_google_oauth_post(base_url):
    """Testa POST no endpoint de OAuth do Google"""
    url = f"{base_url}/users/register/google/"
    print(f"\n🔍 Testando POST OAuth: {url}")
    
    # Dados de teste com token mock
    test_data = {
        "token": "mock_google_token_123"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Origin": "https://reidaderivada2024.vercel.app"
    }
    
    try:
        response = requests.post(url, json=test_data, headers=headers, timeout=10)
        print(f"POST: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Endpoint acessível (erro esperado com token mock)")
            try:
                error_data = response.json()
                print(f"Resposta: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Resposta: {response.text}")
        elif response.status_code == 404:
            print("❌ Endpoint não encontrado (404)")
        else:
            print(f"Status: {response.status_code}")
            try:
                data = response.json()
                print(f"Resposta: {json.dumps(data, indent=2)}")
            except:
                print(f"Resposta: {response.text}")
                
    except Exception as e:
        print(f"❌ Erro: {e}")

def main():
    print("🚀 Testando endpoints da API RRDD")
    print("=" * 50)
    
    for base_url in test_urls:
        print(f"\n🌐 Testando deployment: {base_url}")
        print("-" * 50)
        
        # Testa endpoints básicos
        for endpoint in endpoints:
            test_endpoint(base_url, endpoint)
        
        # Testa POST específico para Google OAuth
        test_google_oauth_post(base_url)
        
        print("\n" + "=" * 50)

if __name__ == "__main__":
    main()
