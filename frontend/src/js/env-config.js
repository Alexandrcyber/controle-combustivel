// Configuração de variáveis de ambiente para produção
// Este arquivo é gerado automaticamente durante o build do Netlify
window.ENV_CONFIG = {
  BACKEND_URL: 'https://controle-combustivel.onrender.com',
  API_BASE_URL: 'https://controle-combustivel.onrender.com/api',
  NODE_ENV: 'production',
  IS_NETLIFY: true
};

// Fazer as variáveis disponíveis globalmente
window.ENV_API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
window.ENV_BACKEND_URL = window.ENV_CONFIG.BACKEND_URL;

console.log('🌐 Configuração de ambiente carregada:', window.ENV_CONFIG);
