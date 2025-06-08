#!/bin/bash

# Script de build para Netlify com injeção de variáveis de ambiente
echo "🔧 Iniciando build do frontend para Netlify..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: arquivo package.json não encontrado"
    exit 1
fi

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$API_BASE_URL" ]; then
    echo "⚠️ Variável API_BASE_URL não definida, usando valor padrão"
    API_BASE_URL="https://controle-combustivel.onrender.com/api"
fi

if [ -z "$BACKEND_URL" ]; then
    echo "⚠️ Variável BACKEND_URL não definida, usando valor padrão"
    BACKEND_URL="https://controle-combustivel.onrender.com"
fi

# Criar diretório src/js se não existir
mkdir -p src/js

# Gerar arquivo de configuração dinâmico
echo "📝 Gerando configuração de ambiente..."
cat > src/js/env-config.js << EOF
// Configuração de variáveis de ambiente para produção
// Este arquivo é gerado automaticamente durante o build do Netlify
window.ENV_CONFIG = {
  BACKEND_URL: '${BACKEND_URL}',
  API_BASE_URL: '${API_BASE_URL}',
  NODE_ENV: '${NODE_ENV:-production}',
  NETLIFY: ${NETLIFY:-true}
};

// Fazer as variáveis disponíveis globalmente
window.ENV_API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
window.ENV_BACKEND_URL = window.ENV_CONFIG.BACKEND_URL;

console.log('🌐 Configuração de ambiente carregada:', window.ENV_CONFIG);
EOF

echo "✅ Arquivo env-config.js gerado com sucesso!"
echo "🌐 API_BASE_URL: $API_BASE_URL"
echo "🌐 BACKEND_URL: $BACKEND_URL"

# Verificar se os arquivos principais existem
if [ ! -f "index.html" ]; then
    echo "❌ Erro: index.html não encontrado!"
    exit 1
fi

if [ ! -d "src" ]; then
    echo "❌ Erro: Diretório src não encontrado!"
    exit 1
fi

echo "✅ Build do frontend concluído!"
