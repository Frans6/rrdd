#!/usr/bin/env python3
"""
Script para descobrir URLs funcionais da API
"""
import requests
import json

# URLs possíveis para testar
possible_urls = [
    "https://api-929876234648.us-central1.run.app",
    "https://api-dot-reidaderivada2024.uc.r.appspot.com",
    "https://reidaderivada2024.uc.r.appspot.com",
    "https://api.reidaderivada2024.uc.r.appspot.com",
    "https://backend-dot-reidaderivada2024.uc.r.appspot.com",
    "https://django-dot-reidaderivada2024.uc.r.appspot.com",
]

def test_url(url):
    """Testa se uma URL está funcionando"""
    print(f"\n🔍 Testando: {url}")
    
    try:
        response = requests.get(url, timeout=5)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ URL funcionando!")
            # Verificar se é HTML ou JSON
            content_type = response.headers.get('content-type', '')
            if 'html' in content_type:
                print("📄 Retornando HTML")
                # Mostrar primeiras linhas do HTML
                lines = response.text.split('\n')[:5]
                for line in lines:
                    if line.strip():
                        print(f"  {line.strip()[:100]}...")
            elif 'json' in content_type:
                print("📊 Retornando JSON")
                try:
                    data = response.json()
                    print(json.dumps(data, indent=2)[:500] + "...")
                except:
                    print("  Erro ao parsear JSON")
        elif response.status_code == 404:
            print("❌ 404 - Não encontrado")
        else:
            print(f"⚠️ Status: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("⏰ Timeout")
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão")
    except Exception as e:
        print(f"❌ Erro: {e}")

def main():
    print("🔍 Procurando URLs funcionais da API")
    print("=" * 50)
    
    for url in possible_urls:
        test_url(url)
    
    print("\n" + "=" * 50)
    print("Teste concluído!")

if __name__ == "__main__":
    main()
