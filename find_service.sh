#!/bin/bash
# Script para descobrir e configurar o serviço Cloud Run correto

echo "🔍 DESCOBRINDO SERVIÇOS CLOUD RUN"
echo "=================================="
echo ""

echo "📋 Listando todos os serviços Cloud Run na região us-central1:"
echo ""
gcloud run services list --region=us-central1 --format="table(metadata.name,status.url,metadata.creationTimestamp)"

echo ""
echo "🔧 COMANDOS PARA TESTAR:"
echo "========================"
echo ""
echo "1. Se encontrar um serviço com nome diferente, use:"
echo "   gcloud run services update NOME_CORRETO_DO_SERVICO \\"
echo "     --region=us-central1 \\"
echo "     --set-env-vars DATABASE_URL='postgresql://derivada:derivada@/postgres?host=/cloudsql/bold-artifact-463813-e9:us-central1:admin' \\"
echo "     --add-cloudsql-instances=bold-artifact-463813-e9:us-central1:admin"
echo ""

echo "2. Ou listar em todas as regiões:"
echo "   gcloud run services list --format='table(metadata.name,status.url,metadata.labels.\"cloud.googleapis.com/location\")'"
echo ""

echo "3. Para verificar a URL que está funcionando:"
echo "   curl -s https://rrdd-519104831129.us-central1.run.app/"
echo ""

echo "🔍 VERIFICANDO SE O SERVIÇO RESPONDE:"
echo "===================================="
curl -s -I https://rrdd-519104831129.us-central1.run.app/ | head -5
echo ""

echo "💡 POSSÍVEIS SOLUÇÕES:"
echo "======================"
echo "1. O serviço pode ter nome diferente"
echo "2. Pode estar em outra região"
echo "3. Pode precisar ser criado novamente"
echo ""
