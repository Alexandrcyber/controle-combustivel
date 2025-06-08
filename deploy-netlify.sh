#!/bin/bash

# 🚀 Script de Deploy Automático - Netlify
# Sistema de Controle de Combustível

echo "🚀 Iniciando deploy para Netlify..."

# Verificar se estamos no diretório correto
if [ ! -f "netlify.toml" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Limpar cache e dependências antigas
echo "🧹 Limpando arquivos antigos..."
rm -rf frontend/node_modules
rm -rf frontend/package-lock.json

# Entrar no diretório do frontend
cd frontend

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Executar build para Netlify
echo "🔨 Executando build..."
npm run build:netlify

# Verificar se os arquivos principais existem
echo "✅ Verificando arquivos..."
if [ ! -f "index.html" ]; then
    echo "❌ Erro: index.html não encontrado!"
    exit 1
fi

if [ ! -d "src" ]; then
    echo "❌ Erro: Diretório src não encontrado!"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Faça commit das alterações:"
echo "   git add ."
echo "   git commit -m 'Configure Netlify deployment'"
echo "   git push origin main"
echo ""
echo "2. Acesse netlify.com e conecte seu repositório"
echo "3. Configure:"
echo "   - Base directory: frontend/"
echo "   - Build command: npm install && npm run build:netlify"
echo "   - Publish directory: frontend/"
echo ""
echo "4. ⚠️ IMPORTANTE: Atualize a URL do backend no netlify.toml"
echo "   Substitua 'controle-combustivel-backend.onrender.com' pela sua URL real"
echo ""
echo "🎉 Deploy preparado para Netlify!"
