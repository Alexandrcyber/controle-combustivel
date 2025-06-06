/**
 * Configurações centralizadas do sistema
 * Este arquivo carrega as variáveis de ambiente e define configurações padrão
 */

require('dotenv').config();

const config = {
  // Ambiente
  environment: process.env.NODE_ENV || 'development',
  
  // Servidor Backend
  backend: {
    port: parseInt(process.env.BACKEND_PORT) || 3001,
    host: process.env.BACKEND_HOST || 'localhost',
  },
  
  // Servidor Frontend
  frontend: {
    port: parseInt(process.env.FRONTEND_PORT) || 3000,
    host: process.env.FRONTEND_HOST || 'localhost',
  },
    // Banco de Dados
  database: {
    type: process.env.DB_TYPE || 'postgresql',
    url: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true',
    path: process.env.DB_PATH || './data',
  },
  
  // API
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001/api',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:3000', 'http://127.0.0.1:3000'],
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  },
  
  // Segurança
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    sessionSecret: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',
  },
  
  // Debug
  debug: process.env.NODE_ENV === 'development',
  
  // Validação de configurações obrigatórias
  validate() {
    const required = [];
    
    if (this.environment === 'production') {
      if (this.security.jwtSecret.includes('default')) {
        required.push('JWT_SECRET deve ser definido em produção');
      }
      if (this.security.sessionSecret.includes('default')) {
        required.push('SESSION_SECRET deve ser definido em produção');
      }
    }
    
    if (required.length > 0) {
      throw new Error(`Configurações obrigatórias não definidas:\n${required.join('\n')}`);
    }
    
    return true;
  }
};

// Validar configurações
config.validate();

module.exports = config;
