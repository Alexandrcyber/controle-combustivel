// Configuração de emergência - força uso do backend direto
// Use este arquivo se as variáveis de ambiente do Netlify não estiverem funcionando

console.log('🚨 Usando configuração de emergência!');

window.ENV_CONFIG = {
  BACKEND_URL: 'https://controle-combustivel.onrender.com',
  API_BASE_URL: 'https://controle-combustivel.onrender.com/api',
  NODE_ENV: 'production',
  IS_NETLIFY: true,
  EMERGENCY_MODE: true
};

// Fazer as variáveis disponíveis globalmente
window.ENV_API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
window.ENV_BACKEND_URL = window.ENV_CONFIG.BACKEND_URL;

// FORÇAR uso do backend direto
window.API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;

console.log('🚨 MODO EMERGÊNCIA - Configuração forçada:', window.ENV_CONFIG);
console.log('🚨 API_BASE_URL forçada para:', window.API_BASE_URL);
