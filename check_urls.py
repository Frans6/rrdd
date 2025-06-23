#!/usr/bin/env python3
"""
Script para testar APIs no backend deployment
"""

import requests
import json
import os

def test_backend_apis():
    """Testa as APIs no backend deployment"""
    
    backend_url = "https://rrdd-519104831129.us-central1.run.app"
    frontend_url = "https://rrdd-front-519104831129.us-central1.run.app"
    
    print(f"🚀 BACKEND: {backend_url}")
    print(f"🌐 FRONTEND: {frontend_url}")
    print("=" * 60)
    
    # Primeiro testa o frontend
    test_frontend(frontend_url)
    
    print("\n" + "="*60)
    print("TESTANDO BACKEND APIs:")
    print("="*60)
    
    base_url = backend_url
    
    # Endpoints para testar
    endpoints = [
        "/",
        "/api/health/", 
        "/users/register/google/",
        "/api/",
        "/admin/",
        "/swagger/",
        "/api/event/",
        "/users/login/",
        "/api/players/"
    ]
    
    print(f"🚀 Testando backend: {base_url}")
    print("=" * 60)
    
    for endpoint in endpoints:
        test_endpoint(base_url, endpoint)
    
    # Teste específico de POST para Google OAuth
    test_google_oauth_post(base_url)
    
    # Teste de integração
    test_integration(backend_url, frontend_url)

def test_endpoint(base_url, endpoint):
    """Testa um endpoint específico"""
    url = f"{base_url}{endpoint}"
    print(f"\n🔍 Testando: {endpoint}")
    
    try:
        # Teste OPTIONS (CORS)
        options_response = requests.options(url, timeout=10)
        print(f"  OPTIONS: {options_response.status_code}")
        
        # Verificar headers CORS
        cors_headers = {
            'access-control-allow-origin': options_response.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': options_response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': options_response.headers.get('access-control-allow-headers')
        }
        
        for header, value in cors_headers.items():
            if value:
                print(f"  🌐 {header}: {value}")
        
        # Teste GET
        get_response = requests.get(url, timeout=10)
        print(f"  GET: {get_response.status_code}")
        
        if get_response.status_code == 200:
            print("  ✅ Endpoint funcionando")
            content_type = get_response.headers.get('content-type', '')
            if 'json' in content_type:
                try:
                    data = get_response.json()
                    print(f"  📊 JSON: {json.dumps(data, indent=2)[:200]}...")
                except:
                    pass
            elif 'html' in content_type:
                print("  📄 Retornando HTML")
        elif get_response.status_code == 404:
            print("  ❌ Não encontrado (404)")
        elif get_response.status_code == 405:
            print("  ⚠️ Método não permitido (405) - endpoint existe")
        elif get_response.status_code == 401:
            print("  🔒 Não autorizado (401) - endpoint protegido")
        elif get_response.status_code == 403:
            print("  🚫 Proibido (403) - endpoint protegido")
        else:
            print(f"  ⚠️ Status: {get_response.status_code}")
            
    except requests.exceptions.Timeout:
        print("  ⏰ Timeout")
    except requests.exceptions.ConnectionError:
        print("  ❌ Erro de conexão")
    except Exception as e:
        print(f"  ❌ Erro: {e}")

def test_google_oauth_post(base_url):
    """Testa POST no endpoint de OAuth do Google"""
    url = f"{base_url}/users/register/google/"
    print(f"\n🔍 Testando POST OAuth: /users/register/google/")
    
    # Dados de teste com token mock
    test_data = {
        "token": "mock_google_token_123"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Origin": "https://reidaderivada.vercel.app"
    }
    
    try:
        response = requests.post(url, json=test_data, headers=headers, timeout=10)
        print(f"  POST: {response.status_code}")
        
        if response.status_code == 400:
            print("  ✅ Endpoint acessível (erro esperado com token mock)")
        elif response.status_code == 404:
            print("  ❌ Endpoint não encontrado (404)")
        elif response.status_code == 401:
            print("  🔒 Não autorizado (401)")
        else:
            print(f"  ⚠️ Status: {response.status_code}")
            
        # Tentar mostrar resposta
        try:
            if response.headers.get('content-type', '').startswith('application/json'):
                data = response.json()
                print(f"  📊 Resposta: {json.dumps(data, indent=2)}")
            else:
                print(f"  📄 Resposta: {response.text[:300]}...")
        except:
            pass
                
    except Exception as e:
        print(f"  ❌ Erro: {e}")

def test_frontend(frontend_url):
    """Testa o frontend deployment"""
    print(f"\n🌐 Testando Frontend: {frontend_url}")
    
    try:
        response = requests.get(frontend_url, timeout=10)
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            print("  ✅ Frontend carregando")
            
            # Verificar se é uma SPA (Single Page Application)
            content = response.text.lower()
            if 'react' in content or 'next' in content or 'app' in content:
                print("  📱 Detectado como SPA")
            
            # Procurar por referências à API
            if 'api' in content:
                print("  🔗 Frontend tem referências à API")
            
            # Verificar meta tags importantes
            if 'viewport' in content:
                print("  📱 Configurado para mobile")
                
        elif response.status_code == 404:
            print("  ❌ Frontend não encontrado")
        else:
            print(f"  ⚠️ Status inesperado: {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ Erro ao testar frontend: {e}")

def test_integration(backend_url, frontend_url):
    """Testa a integração entre frontend e backend"""
    print(f"\n🔄 Testando Integração Frontend-Backend")
    print("-" * 40)
    
    # Simular uma requisição do frontend para o backend
    test_data = {
        "access_token": "test_integration_token"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Origin": frontend_url,  # Simular origem do frontend
        "Referer": frontend_url
    }
    
    try:
        response = requests.post(
            f"{backend_url}/users/register/google/", 
            json=test_data, 
            headers=headers, 
            timeout=10
        )
        
        print(f"  Requisição Frontend → Backend: {response.status_code}")
        
        # Verificar headers CORS
        cors_origin = response.headers.get('access-control-allow-origin')
        if cors_origin:
            print(f"  🌐 CORS Origin permitido: {cors_origin}")
            if frontend_url in cors_origin or cors_origin == '*':
                print("  ✅ CORS configurado para o frontend")
            else:
                print("  ⚠️ CORS pode ter problema com este frontend")
        
        # Verificar resposta
        if response.status_code == 400:
            print("  ✅ Integração funcionando (erro de token esperado)")
        elif response.status_code == 404:
            print("  ❌ Endpoint não encontrado")
        elif response.status_code in [403, 500]:
            print("  ⚠️ Possível problema de configuração")
            
        try:
            data = response.json()
            print(f"  📊 Resposta: {data}")
        except:
            pass
            
    except Exception as e:
        print(f"  ❌ Erro na integração: {e}")

def check_file_differences():
    """Verifica se há diferenças nos arquivos importantes"""
    
    files_to_check = [
        '/home/jefferson/rrdd/api/core/urls.py',
        '/home/jefferson/rrdd/api/api/urls.py',
        '/home/jefferson/rrdd/api/users/urls.py'
    ]
    
    print("🔍 Verificando arquivos de URL locais:")
    print("=" * 50)
    
    for file_path in files_to_check:
        print(f"\n📄 Arquivo: {file_path}")
        
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                lines = f.readlines()
                
            print(f"✅ Existe ({len(lines)} linhas)")
            
            # Verificar imports importantes
            important_patterns = [
                'from django.urls import',
                'path(',
                'include(',
                'health',
                'register/google'
            ]
            
            for pattern in important_patterns:
                matching_lines = [i+1 for i, line in enumerate(lines) if pattern in line.lower()]
                if matching_lines:
                    print(f"  🎯 '{pattern}' encontrado nas linhas: {matching_lines}")
                else:
                    print(f"  ❌ '{pattern}' NÃO encontrado")
                    
        else:
            print("❌ Arquivo não existe")

if __name__ == "__main__":
    # Testa backend e frontend + integração
    test_backend_apis()
    
    print("\n" + "="*60)
    print("VERIFICAÇÃO DE ARQUIVOS LOCAIS:")
    print("="*60)
    
    # Depois verifica arquivos locais
    check_file_differences()
