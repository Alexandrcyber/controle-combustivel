// Configuração de variáveis de ambiente para produção
// Este arquivo é gerado automaticamente durante o build do Netlify
window.ENV_CONFIG = {
  BACKEND_URL: 'https://controle-combustivel.onrender.com',
  API_BASE_URL: 'https://controle-combustivel.onrender.com/api',
  NODE_ENV: 'production',
  IS_NETLIFY: false
};

// Fazer as variáveis disponíveis globalmente
window.ENV_API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
window.ENV_BACKEND_URL = window.ENV_CONFIG.BACKEND_URL;

// Garantir que a configuração seja aplicada imediatamente
if (window.ENV_CONFIG) {
    // Atualizar a variável global de API_BASE_URL se necessário
    if (!window.API_BASE_URL || window.API_BASE_URL === '/api') {
        window.API_BASE_URL = window.ENV_CONFIG.API_BASE_URL;
    }
}

console.log('🌐 Configuração de ambiente carregada:', window.ENV_CONFIG);
