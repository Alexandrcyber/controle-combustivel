// Configuração de variáveis de ambiente
// Este arquivo detecta automaticamente o ambiente e configura as URLs apropriadas

console.log('🔧 Carregando configuração de ambiente...');

// Detectar ambiente
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isNetlify = window.location.hostname.includes('netlify.app');

let config;

if (isLocalhost) {
    // Ambiente local de desenvolvimento
    console.log('🏠 Ambiente local detectado');
    config = {
        BACKEND_URL: 'http://localhost:3001',
        API_BASE_URL: '/api', // Usar proxy local
        NODE_ENV: 'development',
        IS_NETLIFY: false,
        IS_LOCAL: true
    };
} else if (isNetlify) {
    // Ambiente Netlify
    console.log('🌐 Netlify detectado');
    config = {
        BACKEND_URL: 'https://controle-combustivel.onrender.com',
        API_BASE_URL: '/api', // Usar proxy do Netlify
        NODE_ENV: 'production',
        IS_NETLIFY: true,
        IS_LOCAL: false
    };
} else {
    // Ambiente de produção padrão
    console.log('🚀 Ambiente de produção detectado');
    config = {
        BACKEND_URL: 'https://controle-combustivel.onrender.com',
        API_BASE_URL: 'https://controle-combustivel.onrender.com/api',
        NODE_ENV: 'production',
        IS_NETLIFY: false,
        IS_LOCAL: false
    };
}

window.ENV_CONFIG = config;

// Fazer as variáveis disponíveis globalmente
window.ENV_API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
window.ENV_BACKEND_URL = window.ENV_CONFIG.BACKEND_URL;

// FORÇAR configuração para garantir que seja aplicada
window.API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;

console.log('✅ Configuração de ambiente carregada:', window.ENV_CONFIG);
console.log('🎯 API_BASE_URL final:', window.API_BASE_URL);
