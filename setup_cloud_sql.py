#!/usr/bin/env python3
"""
Script para gerar configuração de DATABASE_URL para Google Cloud SQL
"""

def generate_database_config():
    print("🗄️ CONFIGURAÇÃO DO GOOGLE CLOUD SQL")
    print("=" * 60)
    print()
    
    print("📋 Informações que você precisa coletar do Google Cloud:")
    print("1. Nome da instância: admin")
    print("2. Região da instância: (ex: us-central1)")
    print("3. ID do projeto: (ex: bold-artifact-463813-e9)")
    print("4. Nome do banco de dados: postgres (ou outro)")
    print("5. Usuário do banco: (ex: postgres)")
    print("6. Senha do banco: (definida por você)")
    print()
    
    print("🔗 OPÇÕES DE CONEXÃO:")
    print("=" * 40)
    
    print("\n📍 OPÇÃO 1 - IP Público (mais simples):")
    print("Se sua instância tem IP público habilitado:")
    print("DATABASE_URL='postgresql://USUARIO:SENHA@IP_PUBLICO:5432/BANCO_DADOS?sslmode=require'")
    print()
    print("Exemplo:")
    print("DATABASE_URL='postgresql://postgres:minhasenha@35.123.45.67:5432/postgres?sslmode=require'")
    
    print("\n📍 OPÇÃO 2 - Cloud SQL Proxy (recomendado):")
    print("Para conexão mais segura via proxy:")
    print("DATABASE_URL='postgresql://USUARIO:SENHA@/BANCO_DADOS?host=/cloudsql/PROJETO:REGIAO:INSTANCIA&sslmode=require'")
    print()
    print("Exemplo:")
    print("DATABASE_URL='postgresql://postgres:minhasenha@/postgres?host=/cloudsql/bold-artifact-463813-e9:us-central1:admin&sslmode=require'")
    
    print("\n🛠️ COMANDOS PARA CONFIGURAR NO CLOUD RUN:")
    print("=" * 50)
    print()
    print("1. Definir a variável DATABASE_URL:")
    print("gcloud run services update rrdd-519104831129 \\")
    print("  --region=us-central1 \\")
    print("  --set-env-vars DATABASE_URL='SUA_STRING_DE_CONEXAO_AQUI'")
    print()
    print("2. Para usar Cloud SQL Proxy (recomendado), também adicione:")
    print("gcloud run services update rrdd-519104831129 \\")
    print("  --region=us-central1 \\")
    print("  --add-cloudsql-instances=PROJETO:REGIAO:INSTANCIA")
    print()
    
    print("🔍 COMO OBTER AS INFORMAÇÕES:")
    print("=" * 40)
    print("1. No Google Cloud Console > SQL > admin")
    print("2. Na aba 'Visão geral', você encontra:")
    print("   - Connection name (ex: bold-artifact-463813-e9:us-central1:admin)")
    print("   - IP público (se habilitado)")
    print("3. Na aba 'Usuários', você pode criar/ver usuários")
    print("4. Na aba 'Bancos de dados', você pode criar bancos")

if __name__ == "__main__":
    generate_database_config()
