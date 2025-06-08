#!/bin/bash

# Script para preparar deploy no Render
# Este script move o backend/package.json para evitar confusão

echo "🚀 Preparando para deploy no Render..."

# Fazer backup do backend/package.json
if [ -f "backend/package.json" ]; then
    echo "📦 Fazendo backup do backend/package.json..."
    cp backend/package.json backend/package-backup.json
    
    # Criar um package.json mínimo no backend
    cat > backend/package.json << 'EOF'
{
  "name": "backend-minimal",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.1",
    "compression": "^1.7.4"
  }
}
EOF
fi

echo "✅ Preparação concluída!"
echo "🔗 Agora faça commit e push para o GitHub"
