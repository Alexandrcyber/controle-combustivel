#!/bin/bash

# Script de build para Netlify com injeção de variáveis de ambiente
echo "🔧 Iniciando build do frontend para Netlify..."
echo "📍 Diretório atual: $(pwd)"
echo "📋 Variáveis de ambiente disponíveis:"
echo "   - NODE_ENV: ${NODE_ENV:-'não definido'}"
echo "   - API_BASE_URL: ${API_BASE_URL:-'não definido'}"
echo "   - BACKEND_URL: ${BACKEND_URL:-'não definido'}"
echo "   - DEPLOY_URL: ${DEPLOY_URL:-'não definido'}"
echo "   - SITE_ID: ${SITE_ID:-'não definido'}"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: arquivo package.json não encontrado"
    exit 1
fi

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$API_BASE_URL" ]; then
    echo "⚠️ Variável API_BASE_URL não definida, usando valor padrão"
    # No Netlify, usar o proxy /api em vez da URL direta
    if [ -n "$DEPLOY_URL" ] && [ -n "$SITE_ID" ]; then
        API_BASE_URL="/api"
        echo "🌐 Netlify detectado, usando proxy: /api"
    else
        API_BASE_URL="https://controle-combustivel.onrender.com/api"
        echo "🌐 Ambiente externo, usando URL direta"
    fi
fi

if [ -z "$BACKEND_URL" ]; then
    echo "⚠️ Variável BACKEND_URL não definida, usando valor padrão"
    BACKEND_URL="https://controle-combustivel.onrender.com"
fi

if [ -z "$NODE_ENV" ]; then
    echo "⚠️ Variável NODE_ENV não definida, usando 'production'"
    NODE_ENV="production"
fi

# Criar diretório src/js se não existir
mkdir -p src/js

# Detectar se estamos no Netlify
IS_NETLIFY=false
if [ -n "$DEPLOY_URL" ] && [ -n "$SITE_ID" ]; then
    IS_NETLIFY=true
fi

# Gerar arquivo de configuração dinâmico
echo "📝 Gerando configuração de ambiente..."
cat > src/js/env-config.js << EOF
// Configuração de variáveis de ambiente para produção
// Este arquivo é gerado automaticamente durante o build do Netlify
window.ENV_CONFIG = {
  BACKEND_URL: '${BACKEND_URL}',
  API_BASE_URL: '${API_BASE_URL}',
  NODE_ENV: '${NODE_ENV}',
  IS_NETLIFY: ${IS_NETLIFY}
};

// Fazer as variáveis disponíveis globalmente
window.ENV_API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
window.ENV_BACKEND_URL = window.ENV_CONFIG.BACKEND_URL;

// Garantir que a configuração seja aplicada imediatamente
if (window.ENV_CONFIG) {
    // Atualizar a variável global de API_BASE_URL se necessário
    if (!window.API_BASE_URL || window.API_BASE_URL === '/api') {
        window.API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
    }
}

console.log('🌐 Configuração de ambiente carregada:', window.ENV_CONFIG);
EOF

echo "✅ Arquivo env-config.js gerado com sucesso!"
echo "🌐 API_BASE_URL: $API_BASE_URL"
echo "🌐 BACKEND_URL: $BACKEND_URL"
echo "🌐 NODE_ENV: $NODE_ENV"
echo "🌐 IS_NETLIFY: $IS_NETLIFY"

# Mostrar conteúdo do arquivo gerado para debug
echo "📄 Conteúdo do env-config.js:"
cat src/js/env-config.js

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
