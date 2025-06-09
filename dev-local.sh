#!/bin/bash

# Script para desenvolvimento local do Sistema de Controle de Combustível
# Uso: ./dev-local.sh [start|stop|status|restart]

PROJECT_DIR="/home/aleandre-liberato/Documentos/programacao/projetos/Controle_de_combustivel_repo_prod"
BACKEND_PID_FILE="$PROJECT_DIR/backend.pid"
FRONTEND_PID_FILE="$PROJECT_DIR/frontend.pid"

start_backend() {
    echo "🚀 Iniciando backend..."
    cd "$PROJECT_DIR/backend"
    nohup node server.js > backend.log 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    sleep 2
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ Backend iniciado com sucesso (PID: $(cat $BACKEND_PID_FILE))"
    else
        echo "❌ Erro ao iniciar backend"
    fi
}

start_frontend() {
    echo "🌐 Iniciando frontend..."
    cd "$PROJECT_DIR/frontend"
    nohup node server.js > frontend.log 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    sleep 2
    if curl -s -I http://localhost:3000 > /dev/null; then
        echo "✅ Frontend iniciado com sucesso (PID: $(cat $FRONTEND_PID_FILE))"
    else
        echo "❌ Erro ao iniciar frontend"
    fi
}

stop_backend() {
    if [ -f "$BACKEND_PID_FILE" ]; then
        PID=$(cat "$BACKEND_PID_FILE")
        if kill "$PID" 2>/dev/null; then
            echo "🛑 Backend parado (PID: $PID)"
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
}

stop_frontend() {
    if [ -f "$FRONTEND_PID_FILE" ]; then
        PID=$(cat "$FRONTEND_PID_FILE")
        if kill "$PID" 2>/dev/null; then
            echo "🛑 Frontend parado (PID: $PID)"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
}

show_status() {
    echo "📊 Status do Sistema:"
    echo "===================="
    
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ Backend: Rodando (http://localhost:3001)"
    else
        echo "❌ Backend: Parado"
    fi
    
    if curl -s -I http://localhost:3000 > /dev/null; then
        echo "✅ Frontend: Rodando (http://localhost:3000)"
    else
        echo "❌ Frontend: Parado"
    fi
    
    echo ""
    echo "👤 Credenciais: admin@gmail.com / admin"
    echo "🌐 Acesso: http://localhost:3000"
}

case "$1" in
    start)
        echo "🚀 Iniciando Sistema de Controle de Combustível..."
        start_backend
        start_frontend
        echo ""
        show_status
        echo ""
        echo "🎯 Sistema iniciado! Acesse: http://localhost:3000"
        ;;
    stop)
        echo "🛑 Parando Sistema de Controle de Combustível..."
        stop_backend
        stop_frontend
        # Limpar processos órfãos
        pkill -f "node server.js" 2>/dev/null || true
        echo "✅ Sistema parado"
        ;;
    restart)
        echo "🔄 Reiniciando Sistema de Controle de Combustível..."
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        show_status
        ;;
    *)
        echo "Sistema de Controle de Combustível - Desenvolvimento Local"
        echo "=========================================================="
        echo ""
        echo "Uso: $0 {start|stop|status|restart}"
        echo ""
        echo "Comandos:"
        echo "  start   - Iniciar backend e frontend"
        echo "  stop    - Parar backend e frontend"
        echo "  restart - Reiniciar sistema completo"
        echo "  status  - Verificar status dos serviços"
        echo ""
        echo "URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:3001"
        echo ""
        echo "Credenciais de teste:"
        echo "  Email: admin@gmail.com"
        echo "  Senha: admin"
        ;;
esac
