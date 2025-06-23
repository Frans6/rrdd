#!/usr/bin/env python3
"""
Script de teste para verificar as configurações de CORS e conectividade
"""

import requests
import json

def test_cors():
    """Testa as configurações de CORS"""
    backend_url = "https://rrdd-519104831129.us-central1.run.app"
    frontend_url = "https://rrdd-front-519104831129.us-central1.run.app"
    
    print(f"Testando conectividade e CORS...")
    print(f"Backend: {backend_url}")
    print(f"Frontend: {frontend_url}")
    print("-" * 50)
    
    # Teste 1: Verificar se o backend está respondendo
    try:
        response = requests.get(f"{backend_url}/", timeout=10)
        print(f"✅ Backend responde: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend não responde: {e}")
    
    # Teste 2: Verificar endpoint de registro Google (OPTIONS - preflight)
    try:
        headers = {
            'Origin': frontend_url,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
        response = requests.options(f"{backend_url}/users/register/google/", 
                                  headers=headers, timeout=10)
        print(f"✅ OPTIONS request: {response.status_code}")
        print(f"   CORS headers: {dict(response.headers)}")
    except Exception as e:
        print(f"❌ OPTIONS request falhou: {e}")
    
    # Teste 3: Verificar endpoint de registro Google (POST)
    try:
        headers = {
            'Origin': frontend_url,
            'Content-Type': 'application/json'
        }
        data = {'access_token': 'fake_token_for_test'}
        response = requests.post(f"{backend_url}/users/register/google/", 
                               json=data, headers=headers, timeout=10)
        print(f"✅ POST request: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"❌ POST request falhou: {e}")

if __name__ == "__main__":
    test_cors()
