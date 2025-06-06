/**
 * Configurações do Frontend
 * Este arquivo gerencia as configurações do lado cliente
 */

window.AppConfig = {
  // Detectar ambiente
  environment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'development' 
    : 'production',
  
  // Debug mode
  debug: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    // Configurações da API
  api: {
    baseUrl: (() => {
      // Verificar se existe variável de ambiente customizada
      if (window.ENV_API_BASE_URL) {
        return window.ENV_API_BASE_URL;
      }
      
      // Para desenvolvimento local, usar proxy
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return '/api'; // Usar proxy local configurado no servidor Express
      }
      
      // Configuração baseada no ambiente
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001/api';
      } else {
        // Em produção, assumir que a API está no mesmo domínio
        return `${window.location.protocol}//${window.location.hostname.replace('frontend-', 'backend-')}/api`;
      }
    })(),
    timeout: 30000,
    retries: 3
  },
  
  // Configurações de UI
  ui: {
    toastDuration: 5000,
    loadingDelay: 300,
    animationDuration: 300
  },
  
  // Configurações de validação
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['xlsx', 'xls', 'csv']
  },
  
  // Configurações de relatórios
  reports: {
    maxRecords: 10000,
    paginationSize: 100,
    exportFormats: ['xlsx', 'pdf']
  },
  
  // Configurações de cache
  cache: {
    enabled: true,
    duration: 5 * 60 * 1000, // 5 minutos
    keys: {
      caminhoes: 'app_caminhoes',
      abastecimentos: 'app_abastecimentos'
    }
  },
  
  // Método para obter configuração
  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  },
  
  // Método para definir configuração
  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let target = this;
    
    for (const k of keys) {
      if (!(k in target)) {
        target[k] = {};
      }
      target = target[k];
    }
    
    target[lastKey] = value;
  },
  
  // Validar configurações
  validate() {
    const errors = [];
    
    if (!this.api.baseUrl) {
      errors.push('API Base URL não configurada');
    }
    
    if (this.environment === 'production' && this.debug) {
      console.warn('⚠️ Debug mode ativado em produção');
    }
    
    if (errors.length > 0) {
      throw new Error(`Configurações inválidas:\n${errors.join('\n')}`);
    }
    
    return true;
  }
};

// Configurar variáveis globais para compatibilidade
window.API_BASE_URL = window.AppConfig.api.baseUrl;
window.DEBUG_MODE = window.AppConfig.debug;

// Validar configurações
try {
  window.AppConfig.validate();
  console.log(`[CONFIG] Ambiente: ${window.AppConfig.environment}`);
  console.log(`[CONFIG] API URL: ${window.AppConfig.api.baseUrl}`);
  console.log(`[CONFIG] Debug: ${window.AppConfig.debug ? 'ATIVADO' : 'DESATIVADO'}`);
} catch (error) {
  console.error('[CONFIG] Erro na validação:', error.message);
}
