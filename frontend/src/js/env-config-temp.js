// Configuração de variáveis de ambiente para produção
// Este arquivo é gerado automaticamente durante o build do Netlify

// SOLUÇÃO TEMPORÁRIA: Forçar uso do backend direto até variáveis serem configuradas
console.log('🔧 Carregando configuração de ambiente...');

window.ENV_CONFIG = {
  BACKEND_URL: 'https://controle-combustivel.onrender.com',
  API_BASE_URL: 'https://controle-combustivel.onrender.com/api',
  NODE_ENV: 'production',
  IS_NETLIFY: true,
  TEMP_FIX: true // Indica que é uma solução temporária
};

// Fazer as variáveis disponíveis globalmente
window.ENV_API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
window.ENV_BACKEND_URL = window.ENV_CONFIG.BACKEND_URL;

// FORÇAR configuração para garantir que seja aplicada
window.API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;

// Detectar se estamos no Netlify
const isNetlify = window.location.hostname.includes('netlify.app');

if (isNetlify) {
    console.log('🌐 Netlify detectado - usando backend direto');
    // No Netlify, bypass proxy e usar backend direto
    window.ENV_CONFIG.API_BASE_URL = 'https://controle-combustivel.onrender.com/api';
    window.ENV_API_BASE_URL = 'https://controle-combustivel.onrender.com/api';
    window.API_BASE_URL = 'https://controle-combustivel.onrender.com/api';
}

console.log('✅ Configuração de ambiente carregada:', window.ENV_CONFIG);
console.log('🎯 API_BASE_URL final:', window.API_BASE_URL);
