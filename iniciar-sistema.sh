#!/bin/bash

# Script de inicialização do Sistema de Controle de Combustível
# Este script inicializa todo o sistema automaticamente

echo "🚀 INICIANDO SISTEMA DE CONTROLE DE COMBUSTÍVEL"
echo "=============================================="

PROJECT_DIR="/home/aleandre-liberato/Documentos/programacao/projetos/Controle_de_combustivel_repo_prod"

cd "$PROJECT_DIR"

# Verificar se os diretórios existem
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erro: Diretórios do projeto não encontrados"
    exit 1
fi

echo "📁 Diretório do projeto: $PROJECT_DIR"

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -i:$port > /dev/null 2>&1; then
        return 0  # porta em uso
    else
        return 1  # porta livre
    fi
}

# Verificar se os serviços já estão rodando
backend_running=false
frontend_running=false

if check_port 3001; then
    echo "✅ Backend já está rodando na porta 3001"
    backend_running=true
fi

if check_port 3000; then
    echo "✅ Frontend já está rodando na porta 3000"
    frontend_running=true
fi

# Iniciar backend se não estiver rodando
if [ "$backend_running" = false ]; then
    echo "🔧 Iniciando Backend (PostgreSQL + API)..."
    cd backend
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependências do backend..."
        npm install
    fi
    
    # Iniciar backend em background
    echo "⚡ Startando servidor backend na porta 3001..."
    nohup npm start > ../logs/backend.log 2>&1 &
    backend_pid=$!
    echo "🔧 Backend PID: $backend_pid"
    
    # Aguardar backend inicializar
    echo "⏳ Aguardando backend inicializar..."
    sleep 3
    
    # Verificar se backend está respondendo
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ Backend iniciado com sucesso!"
    else
        echo "❌ Erro ao iniciar backend"
        exit 1
    fi
    
    cd ..
fi

# Iniciar frontend se não estiver rodando
if [ "$frontend_running" = false ]; then
    echo "🌐 Iniciando Frontend (Proxy + Interface)..."
    cd frontend
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependências do frontend..."
        npm install
    fi
    
    # Iniciar frontend em background
    echo "⚡ Startando servidor frontend na porta 3000..."
    nohup npm start > ../logs/frontend.log 2>&1 &
    frontend_pid=$!
    echo "🌐 Frontend PID: $frontend_pid"
    
    # Aguardar frontend inicializar
    echo "⏳ Aguardando frontend inicializar..."
    sleep 3
    
    # Verificar se frontend está respondendo
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend iniciado com sucesso!"
    else
        echo "❌ Erro ao iniciar frontend"
        exit 1
    fi
    
    cd ..
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Teste final do sistema
echo ""
echo "🧪 Executando teste final do sistema..."
sleep 2

# Testar APIs
caminhoes_count=$(curl -s http://localhost:3000/api/caminhoes | jq '. | length' 2>/dev/null || echo "0")
abastecimentos_count=$(curl -s http://localhost:3000/api/abastecimentos | jq '. | length' 2>/dev/null || echo "0")

echo ""
echo "🎉 SISTEMA INICIADO COM SUCESSO!"
echo "================================"
echo "🌐 URL do Sistema: http://localhost:3000"
echo "🔧 API Backend: http://localhost:3001"
echo "📊 Dados disponíveis:"
echo "   • Caminhões: $caminhoes_count"
echo "   • Abastecimentos: $abastecimentos_count"
echo ""
echo "📋 INSTRUÇÕES DE USO:"
echo "===================="
echo "1. 🌐 Acesse: http://localhost:3000"
echo "2. 👀 Modo Público: Visualização livre dos dados"
echo "3. 🔐 Modo Admin: Clique em 'Login Admin' (qualquer email/senha)"
echo "4. ✏️  No modo admin: Botões de editar/adicionar ficam visíveis"
echo ""
echo "🛑 PARA PARAR O SISTEMA:"
echo "========================"
echo "• Pressione Ctrl+C neste terminal, ou"
echo "• Execute: pkill -f 'node.*server' ou"
echo "• Execute: ./parar-sistema.sh"
echo ""
echo "📁 LOGS DISPONÍVEIS EM:"
echo "======================="
echo "• Backend: logs/backend.log"
echo "• Frontend: logs/frontend.log"
echo ""

# Salvar PIDs para poder parar depois
if [ "$backend_running" = false ] && [ ! -z "$backend_pid" ]; then
    echo "$backend_pid" > logs/backend.pid
fi

if [ "$frontend_running" = false ] && [ ! -z "$frontend_pid" ]; then
    echo "$frontend_pid" > logs/frontend.pid
fi

echo "✨ Sistema pronto para uso! Acesse http://localhost:3000"

# Manter o script rodando para monitorar
echo ""
echo "🔍 Monitorando sistema... (Pressione Ctrl+C para parar)"
echo "======================================================="

# Função para cleanup quando script for interrompido
cleanup() {
    echo ""
    echo "🛑 Parando sistema..."
    
    if [ -f "logs/backend.pid" ]; then
        backend_pid=$(cat logs/backend.pid)
        if kill -0 $backend_pid 2>/dev/null; then
            echo "🔧 Parando backend (PID: $backend_pid)..."
            kill $backend_pid
            rm -f logs/backend.pid
        fi
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        frontend_pid=$(cat logs/frontend.pid)
        if kill -0 $frontend_pid 2>/dev/null; then
            echo "🌐 Parando frontend (PID: $frontend_pid)..."
            kill $frontend_pid
            rm -f logs/frontend.pid
        fi
    fi
    
    echo "✅ Sistema parado com sucesso!"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Loop de monitoramento
while true; do
    sleep 10
    
    # Verificar se os serviços ainda estão rodando
    if ! check_port 3001; then
        echo "⚠️  Backend parou de responder!"
    fi
    
    if ! check_port 3000; then
        echo "⚠️  Frontend parou de responder!"
    fi
done
