#!/bin/bash

# Script para parar o Sistema de Controle de Combustível

echo "🛑 PARANDO SISTEMA DE CONTROLE DE COMBUSTÍVEL"
echo "============================================="

PROJECT_DIR="/home/aleandre-liberato/Documentos/programacao/projetos/Controle_de_combustivel_repo_prod"
cd "$PROJECT_DIR"

# Função para parar processo por PID
stop_by_pid() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat $pid_file)
        if kill -0 $pid 2>/dev/null; then
            echo "🔧 Parando $service_name (PID: $pid)..."
            kill $pid
            sleep 2
            
            # Verificar se o processo ainda está rodando
            if kill -0 $pid 2>/dev/null; then
                echo "⚠️  Forçando parada do $service_name..."
                kill -9 $pid
            fi
            
            echo "✅ $service_name parado com sucesso!"
        else
            echo "ℹ️  $service_name já estava parado"
        fi
        rm -f $pid_file
    else
        echo "ℹ️  PID file não encontrado para $service_name"
    fi
}

# Parar por PID files se existirem
stop_by_pid "Backend" "logs/backend.pid"
stop_by_pid "Frontend" "logs/frontend.pid"

# Parar qualquer processo Node.js relacionado ao sistema
echo "🔍 Procurando processos Node.js do sistema..."

# Buscar processos específicos
backend_pids=$(pgrep -f "node.*server.*3001" 2>/dev/null || true)
frontend_pids=$(pgrep -f "node.*server.*3000" 2>/dev/null || true)

if [ ! -z "$backend_pids" ]; then
    echo "🔧 Parando processos backend restantes..."
    echo "$backend_pids" | xargs kill 2>/dev/null || true
fi

if [ ! -z "$frontend_pids" ]; then
    echo "🌐 Parando processos frontend restantes..."
    echo "$frontend_pids" | xargs kill 2>/dev/null || true
fi

# Verificar se as portas estão livres
echo "🔍 Verificando se as portas estão livres..."

if lsof -i:3001 > /dev/null 2>&1; then
    echo "⚠️  Porta 3001 ainda está em uso, forçando liberação..."
    fuser -k 3001/tcp 2>/dev/null || true
fi

if lsof -i:3000 > /dev/null 2>&1; then
    echo "⚠️  Porta 3000 ainda está em uso, forçando liberação..."
    fuser -k 3000/tcp 2>/dev/null || true
fi

# Aguardar um momento
sleep 2

# Verificação final
backend_check=$(lsof -i:3001 2>/dev/null || true)
frontend_check=$(lsof -i:3000 2>/dev/null || true)

echo ""
echo "📊 STATUS FINAL:"
echo "==============="

if [ -z "$backend_check" ]; then
    echo "✅ Porta 3001 (Backend): LIVRE"
else
    echo "❌ Porta 3001 (Backend): AINDA EM USO"
fi

if [ -z "$frontend_check" ]; then
    echo "✅ Porta 3000 (Frontend): LIVRE"
else
    echo "❌ Porta 3000 (Frontend): AINDA EM USO"
fi

if [ -z "$backend_check" ] && [ -z "$frontend_check" ]; then
    echo ""
    echo "🎉 SISTEMA PARADO COM SUCESSO!"
    echo "=============================="
    echo "✅ Todas as portas foram liberadas"
    echo "✅ Todos os processos foram finalizados"
    echo ""
    echo "🚀 Para iniciar novamente, execute:"
    echo "   ./iniciar-sistema.sh"
else
    echo ""
    echo "⚠️  ALGUMAS PORTAS AINDA ESTÃO EM USO"
    echo "====================================="
    echo "Talvez seja necessário reiniciar o terminal ou verificar"
    echo "se há outros processos usando essas portas."
    echo ""
    echo "🔍 Para investigar, use:"
    echo "   lsof -i:3000"
    echo "   lsof -i:3001"
fi
