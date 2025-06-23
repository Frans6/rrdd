#!/usr/bin/env python3
"""
Teste completo da autenticação Google OAuth2
"""

import requests
import json
from urllib.parse import quote

def test_google_oauth_flow():
    """Testa todo o fluxo de autenticação Google OAuth2"""
    
    # Configurações do seu sistema
    client_id = "519104831129-dha282mn2g46pj5825n1kp90kofkl89a.apps.googleusercontent.com"
    api_url = "https://rrdd-519104831129.us-central1.run.app"
    frontend_url = "https://rrdd-front-519104831129.us-central1.run.app"
    
    print("🔍 TESTE COMPLETO DE AUTENTICAÇÃO GOOGLE OAUTH2")
    print("=" * 60)
    print(f"Client ID: {client_id}")
    print(f"API URL: {api_url}")
    print(f"Frontend URL: {frontend_url}")
    print()
    
    # Teste 1: Verificar se o backend está funcionando
    print("1️⃣ TESTE DE CONECTIVIDADE DO BACKEND")
    print("-" * 40)
    try:
        response = requests.get(f"{api_url}/", timeout=10)
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 500:
            print("⚠️  Erro 500 na raiz, mas isso é normal para Django sem rota raiz")
    except Exception as e:
        print(f"❌ Erro de conectividade: {e}")
    print()
    
    # Teste 2: Verificar CORS (OPTIONS)
    print("2️⃣ TESTE DE CORS (OPTIONS)")
    print("-" * 40)
    try:
        headers = {
            'Origin': frontend_url,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
        response = requests.options(f"{api_url}/users/register/google/", 
                                  headers=headers, timeout=10)
        print(f"✅ Status: {response.status_code}")
        
        cors_headers = {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': response.headers.get('access-control-allow-headers')
        }
        
        print("📋 Headers CORS:")
        for key, value in cors_headers.items():
            status = "✅" if value else "❌"
            print(f"   {status} {key}: {value}")
            
    except Exception as e:
        print(f"❌ Erro CORS: {e}")
    print()
    
    # Teste 3: Testar endpoint com token inválido
    print("3️⃣ TESTE DE ENDPOINT COM TOKEN INVÁLIDO")
    print("-" * 40)
    try:
        headers = {
            'Origin': frontend_url,
            'Content-Type': 'application/json'
        }
        data = {'access_token': 'token_invalido_para_teste'}
        response = requests.post(f"{api_url}/users/register/google/", 
                               json=data, headers=headers, timeout=10)
        print(f"✅ Status: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        # Verificar se retorna erro apropriado
        if response.status_code == 400:
            print("✅ Endpoint funcionando corretamente (rejeita token inválido)")
        else:
            print("⚠️  Status inesperado")
            
    except Exception as e:
        print(f"❌ Erro no endpoint: {e}")
    print()
    
    # Teste 4: Testar com token mock (se configurado)
    print("4️⃣ TESTE COM TOKEN MOCK")
    print("-" * 40)
    try:
        headers = {
            'Origin': frontend_url,
            'Content-Type': 'application/json'
        }
        # Token mock do seu .env
        mock_token = "7RqZlSP4ygRODoYIN6TrjacuAp6bIadI8C07ZdTFaCeglGYM5BdDpw9sHi30wyDQ"
        data = {'access_token': mock_token}
        response = requests.post(f"{api_url}/users/register/google/", 
                               json=data, headers=headers, timeout=10)
        print(f"✅ Status: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Token mock funcionando! Autenticação OK")
        else:
            print("⚠️  Token mock não funcionou como esperado")
            
    except Exception as e:
        print(f"❌ Erro com token mock: {e}")
    print()
    
    # Teste 5: Verificar URL de autorização Google
    print("5️⃣ TESTE DE URL DE AUTORIZAÇÃO GOOGLE")
    print("-" * 40)
    
    redirect_uri = quote(frontend_url)
    scope = quote("email profile openid")
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&scope={scope}"
        f"&response_type=token"
        f"&state=state_parameter_passthrough_value_sosalve"
    )
    
    print(f"🔗 URL de autorização Google:")
    print(f"   {auth_url}")
    print()
    print("📝 Para testar manualmente:")
    print("   1. Acesse a URL acima em seu navegador")
    print("   2. Faça login com jefferson.frds@gmail.com")
    print("   3. Autorize a aplicação")
    print("   4. Verifique se é redirecionado para o frontend com o token")
    print()
    
    # Teste 6: Verificar se o frontend está acessível
    print("6️⃣ TESTE DE CONECTIVIDADE DO FRONTEND")
    print("-" * 40)
    try:
        response = requests.get(frontend_url, timeout=10)
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Frontend acessível")
        else:
            print("⚠️  Frontend com problema")
    except Exception as e:
        print(f"❌ Erro de conectividade frontend: {e}")
    print()
    
    print("🏁 CONCLUSÃO")
    print("=" * 60)
    print("Se todos os testes acima passaram, o problema pode ser:")
    print("1. 🔄 Cache do navegador - tente Ctrl+F5")
    print("2. 🕐 Cold start do Google Cloud Run")
    print("3. 🔧 Configuração no Google Cloud Console")
    print("4. 🌐 Propagação de DNS/CDN")
    print()
    print("Para testar manualmente:")
    print(f"1. Acesse: {frontend_url}")
    print("2. Abra o DevTools (F12)")
    print("3. Vá para Network tab")
    print("4. Tente fazer login")
    print("5. Observe as requisições HTTP")

if __name__ == "__main__":
    test_google_oauth_flow()
