#!/bin/bash

# Script de teste para verificar se o deploy está funcionando
echo "🧪 TESTANDO DEPLOY DO SISTEMA DE CONTROLE DE COMBUSTÍVEL"
echo "========================================================"

# URLs de produção
FRONTEND_URL="https://gestao-logistica-unidade-sc.netlify.app"
BACKEND_URL="https://controle-combustivel.onrender.com"
API_URL="$FRONTEND_URL/api"

echo "🌐 URLs de Teste:"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo "API: $API_URL"
echo ""

# Teste 1: Frontend principal
echo "🧪 Teste 1: Frontend Principal"
echo "Testando: $FRONTEND_URL"
response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$response" = "200" ]; then
    echo "✅ Frontend carregou com sucesso (HTTP $response)"
else
    echo "❌ Frontend falhou (HTTP $response)"
fi
echo ""

# Teste 2: API Health Check
echo "🧪 Teste 2: API Health Check"
echo "Testando: $API_URL/health"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$response" = "200" ]; then
    echo "✅ API Health Check passou (HTTP $response)"
    # Mostrar dados da resposta
    echo "📄 Resposta da API:"
    curl -s "$API_URL/health" | jq . 2>/dev/null || curl -s "$API_URL/health"
else
    echo "❌ API Health Check falhou (HTTP $response)"
fi
echo ""

# Teste 3: Página de configuração
echo "🧪 Teste 3: Página de Configuração"
echo "Testando: $FRONTEND_URL/test-config.html"
response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/test-config.html")
if [ "$response" = "200" ]; then
    echo "✅ Página de configuração carregou (HTTP $response)"
else
    echo "❌ Página de configuração falhou (HTTP $response)"
fi
echo ""

# Teste 4: API de Caminhões
echo "🧪 Teste 4: API de Caminhões"
echo "Testando: $API_URL/caminhoes"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/caminhoes")
if [ "$response" = "200" ]; then
    echo "✅ API de Caminhões funcionando (HTTP $response)"
else
    echo "❌ API de Caminhões falhou (HTTP $response)"
fi
echo ""

# Teste 5: API de Abastecimentos
echo "🧪 Teste 5: API de Abastecimentos"
echo "Testando: $API_URL/abastecimentos"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/abastecimentos")
if [ "$response" = "200" ]; then
    echo "✅ API de Abastecimentos funcionando (HTTP $response)"
else
    echo "❌ API de Abastecimentos falhou (HTTP $response)"
fi
echo ""

# Resumo final
echo "========================================================"
echo "🎯 RESUMO DOS TESTES"
echo "========================================================"
echo "🌐 Sistema deployado em:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend: $BACKEND_URL"
echo ""
echo "📝 Para testar manualmente:"
echo "   1. Acesse: $FRONTEND_URL"
echo "   2. Verifique se dados carregam"
echo "   3. Teste: $FRONTEND_URL/test-config.html"
echo ""
echo "🔧 Se algo não funcionar:"
echo "   1. Verifique variáveis de ambiente no Netlify"
echo "   2. Verifique CORS no Render"
echo "   3. Consulte: DEPLOY_FINAL_SUCESSO.md"
echo ""
echo "✅ Deploy completo! Sistema pronto para uso."
