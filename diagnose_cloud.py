#!/usr/bin/env python3
"""
Diagnóstico específico para Google Cloud Run
"""

import requests
import json
import time
from datetime import datetime

def diagnose_google_cloud():
    """Diagnostica problemas específicos do Google Cloud Run"""
    
    api_url = "https://rrdd-519104831129.us-central1.run.app"
    frontend_url = "https://rrdd-front-519104831129.us-central1.run.app"
    
    print("🔍 DIAGNÓSTICO GOOGLE CLOUD RUN")
    print("=" * 50)
    print(f"🕐 Timestamp: {datetime.now()}")
    print()
    
    # Teste 1: Cold Start Detection
    print("1️⃣ TESTE DE COLD START")
    print("-" * 30)
    
    cold_start_times = []
    for i in range(3):
        start_time = time.time()
        try:
            response = requests.get(f"{api_url}/users/register/google/", 
                                  timeout=30)  # Timeout maior para cold start
            end_time = time.time()
            response_time = end_time - start_time
            cold_start_times.append(response_time)
            
            print(f"   Tentativa {i+1}: {response_time:.2f}s - Status: {response.status_code}")
            
            if response_time > 10:
                print("   ⚠️  POSSÍVEL COLD START detectado!")
            
        except requests.exceptions.Timeout:
            print(f"   Tentativa {i+1}: TIMEOUT (>30s)")
            print("   🚨 PROBLEMA: Cold start muito longo ou serviço indisponível")
        except Exception as e:
            print(f"   Tentativa {i+1}: ERRO - {e}")
        
        time.sleep(2)  # Pausa entre tentativas
    
    if cold_start_times:
        avg_time = sum(cold_start_times) / len(cold_start_times)
        print(f"   📊 Tempo médio de resposta: {avg_time:.2f}s")
        
        if avg_time > 5:
            print("   🚨 PROBLEMA: Respostas muito lentas")
        elif avg_time > 2:
            print("   ⚠️  ATENÇÃO: Respostas um pouco lentas")
        else:
            print("   ✅ Tempos de resposta normais")
    print()
    
    # Teste 2: Headers de Cloud Run
    print("2️⃣ ANÁLISE DE HEADERS DO GOOGLE CLOUD RUN")
    print("-" * 30)
    try:
        response = requests.get(f"{api_url}/users/register/google/", timeout=10)
        
        cloud_headers = {
            'server': response.headers.get('server', 'N/A'),
            'x-cloud-trace-context': response.headers.get('x-cloud-trace-context', 'N/A'),
            'alt-svc': response.headers.get('alt-svc', 'N/A'),
            'date': response.headers.get('date', 'N/A')
        }
        
        print("   📋 Headers do Google Cloud:")
        for key, value in cloud_headers.items():
            print(f"      {key}: {value}")
        
        if 'Google Frontend' in cloud_headers['server']:
            print("   ✅ Requisição está chegando ao Google Cloud Run")
        else:
            print("   ❌ Não parece estar chegando ao Google Cloud Run")
            
    except Exception as e:
        print(f"   ❌ Erro ao verificar headers: {e}")
    print()
    
    # Teste 3: Teste de Múltiplas Requisições Simultâneas
    print("3️⃣ TESTE DE CARGA (MÚLTIPLAS REQUISIÇÕES)")
    print("-" * 30)
    
    import concurrent.futures
    
    def make_request():
        try:
            start = time.time()
            response = requests.post(f"{api_url}/users/register/google/",
                                   json={'access_token': 'test'},
                                   headers={'Origin': frontend_url},
                                   timeout=15)
            end = time.time()
            return {
                'status': response.status_code,
                'time': end - start,
                'success': True
            }
        except Exception as e:
            return {
                'status': 'ERROR',
                'time': 0,
                'success': False,
                'error': str(e)
            }
    
    # Fazer 5 requisições simultâneas
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(make_request) for _ in range(5)]
        results = [future.result() for future in concurrent.futures.as_completed(futures)]
    
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    print(f"   ✅ Sucessos: {len(successful)}")
    print(f"   ❌ Falhas: {len(failed)}")
    
    if successful:
        times = [r['time'] for r in successful]
        print(f"   📊 Tempo médio: {sum(times)/len(times):.2f}s")
        print(f"   📊 Tempo mínimo: {min(times):.2f}s")
        print(f"   📊 Tempo máximo: {max(times):.2f}s")
    
    if failed:
        print("   🚨 Erros encontrados:")
        for r in failed:
            print(f"      - {r.get('error', 'Erro desconhecido')}")
    print()
    
    # Teste 4: Verificar se há rate limiting
    print("4️⃣ TESTE DE RATE LIMITING")
    print("-" * 30)
    
    rate_limit_results = []
    for i in range(10):
        try:
            response = requests.get(f"{api_url}/users/register/google/", timeout=5)
            rate_limit_results.append(response.status_code)
            print(f"   Req {i+1:2d}: {response.status_code}")
            
            if response.status_code == 429:
                print("   🚨 RATE LIMITING detectado!")
                break
            elif response.status_code >= 500:
                print(f"   ⚠️  Erro do servidor: {response.status_code}")
                
        except Exception as e:
            print(f"   Req {i+1:2d}: ERRO - {e}")
        
        time.sleep(0.1)  # Pequena pausa
    print()
    
    # Teste 5: Verificar configuração DNS
    print("5️⃣ TESTE DE DNS")
    print("-" * 30)
    
    import socket
    
    domains = [
        "rrdd-519104831129.us-central1.run.app",
        "rrdd-front-519104831129.us-central1.run.app"
    ]
    
    for domain in domains:
        try:
            ip = socket.gethostbyname(domain)
            print(f"   ✅ {domain} -> {ip}")
        except Exception as e:
            print(f"   ❌ {domain} -> ERRO: {e}")
    print()
    
    # Diagnóstico Final
    print("🎯 DIAGNÓSTICO FINAL")
    print("=" * 50)
    
    issues = []
    
    if cold_start_times and max(cold_start_times) > 10:
        issues.append("Cold start muito lento")
    
    if len(successful) < 3:
        issues.append("Muitas falhas nas requisições")
    
    if 429 in rate_limit_results:
        issues.append("Rate limiting ativo")
    
    if len([r for r in rate_limit_results if r >= 500]) > 5:
        issues.append("Muitos erros 5xx")
    
    if issues:
        print("🚨 PROBLEMAS IDENTIFICADOS:")
        for issue in issues:
            print(f"   - {issue}")
        print()
        print("💡 SOLUÇÕES RECOMENDADAS:")
        print("   1. Verifique os logs do Google Cloud Run")
        print("   2. Aumente recursos (CPU/Memória) do serviço")
        print("   3. Configure warm-up requests")
        print("   4. Verifique configurações de timeout")
    else:
        print("✅ Nenhum problema crítico identificado no Google Cloud Run")
        print("🔍 O problema pode estar em:")
        print("   - Configurações de CORS específicas")
        print("   - Código da aplicação Django")
        print("   - Configurações do frontend")
    
    print()
    print("📚 COMANDOS ÚTEIS PARA DEBUG:")
    print("gcloud run services describe rrdd --region=us-central1")
    print("gcloud logging read 'resource.type=cloud_run_revision'")

if __name__ == "__main__":
    diagnose_google_cloud()
