#!/usr/bin/env python3
"""
Teste da configuração de Cloud SQL atualizada
"""

import subprocess
import time

def test_updated_config():
    print("🔧 TESTANDO CONFIGURAÇÃO ATUALIZADA")
    print("=" * 50)
    print()
    
    print("📝 Mudanças implementadas:")
    print("- Configuração manual para Cloud SQL Proxy")
    print("- HOST: '/cloudsql/bold-artifact-463813-e9:us-central1:admin'")
    print("- SSL desabilitado (não necessário com proxy)")
    print("- Parsing manual dos parâmetros")
    print()
    
    print("🚀 Agora você precisa fazer o redeploy...")
    print("Como você subiu as alterações, o próximo deploy vai usar a nova configuração.")
    print()
    
    print("⏳ Aguardando redeploy...")
    print("(Teste o endpoint após o deploy ser concluído)")
    print()
    
    print("📋 COMANDOS PARA VERIFICAR:")
    print("1. Ver logs do deploy:")
    print("   gcloud run logs tail rrdd --region=us-central1")
    print()
    print("2. Testar endpoint:")
    print("   curl -X POST https://rrdd-519104831129.us-central1.run.app/users/register/google/ \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"access_token\": \"test\"}'")
    print()
    
    print("✅ SUCESSO ESPERADO:")
    print("Deve retornar: {\"errors\":\"Invalid token\"}")
    print("(Não mais erros de conexão de banco)")

if __name__ == "__main__":
    test_updated_config()
