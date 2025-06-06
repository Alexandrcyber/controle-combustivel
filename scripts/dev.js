#!/usr/bin/env node
/**
 * Script de Desenvolvimento - Controle de Combustível
 * 
 * Este script facilita o desenvolvimento do projeto:
 * - Inicia backend e frontend simultaneamente
 * - Monitora mudanças nos arquivos
 * - Mostra logs em tempo real
 * - Permite reiniciar serviços facilmente
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando ambiente de desenvolvimento...\n');

// Configurações
const config = {
    backend: {
        port: 3001,
        script: 'server.js',
        cwd: path.join(__dirname, '..', 'backend')
    },
    frontend: {
        port: 3000,
        script: 'server.js',
        cwd: path.join(__dirname, '..', 'frontend')
    }
};

let backendProcess = null;
let frontendProcess = null;

// Função para iniciar processo com logs coloridos
function startProcess(name, config, color) {
    console.log(`${color}[${name}] Iniciando na porta ${config.port}...`);
    
    const process = spawn('node', [config.script], {
        cwd: config.cwd,
        stdio: 'pipe',
        shell: true
    });

    process.stdout.on('data', (data) => {
        console.log(`${color}[${name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`${color}[${name}] ❌ ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
        console.log(`${color}[${name}] Processo finalizado com código ${code}`);
    });

    process.on('error', (error) => {
        console.error(`${color}[${name}] Erro: ${error.message}`);
    });

    return process;
}

// Função para parar todos os processos
function stopAllProcesses() {
    console.log('\n🛑 Parando todos os serviços...');
    
    if (backendProcess) {
        backendProcess.kill();
        backendProcess = null;
    }
    
    if (frontendProcess) {
        frontendProcess.kill();
        frontendProcess = null;
    }
    
    console.log('✅ Todos os serviços foram parados');
    process.exit(0);
}

// Função para verificar se as portas estão disponíveis
function checkPort(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        
        server.on('error', () => resolve(false));
    });
}

// Função principal
async function startDevelopment() {
    try {
        // Verificar se as portas estão disponíveis
        const backendPortAvailable = await checkPort(config.backend.port);
        const frontendPortAvailable = await checkPort(config.frontend.port);
        
        if (!backendPortAvailable) {
            console.log(`⚠️  Porta ${config.backend.port} já está em uso (Backend)`);
        }
        
        if (!frontendPortAvailable) {
            console.log(`⚠️  Porta ${config.frontend.port} já está em uso (Frontend)`);
        }
        
        // Iniciar backend
        console.log('🔧 Iniciando Backend...');
        backendProcess = startProcess('BACKEND', config.backend, '\x1b[36m'); // Cyan
        
        // Aguardar um pouco antes de iniciar o frontend
        setTimeout(() => {
            console.log('🎨 Iniciando Frontend...');
            frontendProcess = startProcess('FRONTEND', config.frontend, '\x1b[33m'); // Yellow
        }, 2000);
        
        // Mostrar informações úteis
        setTimeout(() => {
            console.log('\n📋 Serviços iniciados:');
            console.log(`🔧 Backend: http://localhost:${config.backend.port}`);
            console.log(`🎨 Frontend: http://localhost:${config.frontend.port}`);
            console.log('\n🎯 Comandos úteis:');
            console.log('• Ctrl+C: Parar todos os serviços');
            console.log('• npm run test: Executar testes');
            console.log('• npm run dev:db: Iniciar apenas backend');
            console.log('• npm run dev:ui: Iniciar apenas frontend');
            console.log('\n👨‍💻 Desenvolvedor: Alexandre Liberatto');
            console.log('📱 WhatsApp: 48991604054\n');
        }, 3000);
        
    } catch (error) {
        console.error('❌ Erro ao iniciar desenvolvimento:', error.message);
        process.exit(1);
    }
}

// Capturar sinais de interrupção
process.on('SIGINT', stopAllProcesses);
process.on('SIGTERM', stopAllProcesses);
process.on('exit', stopAllProcesses);

// Iniciar desenvolvimento
startDevelopment();
