module.exports = {
  apps: [
    {
      // Aplicação Principal - Backend API
      name: 'controle-combustivel-api',
      script: './backend/server.js',
      cwd: __dirname,
      instances: 'max', // Usar todos os cores disponíveis
      exec_mode: 'cluster',
      
      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      
      // Auto restart
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        'tests',
        '.git'
      ],
      
      // Logs
      log_file: './logs/app/combined.log',
      out_file: './logs/app/out.log',
      error_file: './logs/app/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Memory and CPU limits
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Advanced settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      wait_ready: true,
      
      // Auto restart conditions
      restart_delay: 4000,
      exponential_backoff_restart_delay: 100,
      
      // Process management
      merge_logs: true,
      combine_logs: true,
      
      // Monitoring
      monitoring: true,
      pmx: true
    },
    
    // Frontend Server (opcional - para servir arquivos estáticos)
    {
      name: 'controle-combustivel-frontend',
      script: './frontend/server.js',
      cwd: __dirname,
      instances: 2,
      exec_mode: 'cluster',
      
      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Auto restart
      watch: false,
      
      // Logs
      log_file: './logs/app/frontend-combined.log',
      out_file: './logs/app/frontend-out.log',
      error_file: './logs/app/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Memory limits
      max_memory_restart: '200M',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Process management
      kill_timeout: 3000,
      listen_timeout: 3000,
      wait_ready: true,
      
      // Restart conditions
      restart_delay: 2000,
      
      // Monitoring
      monitoring: false // Frontend não precisa de tanto monitoramento
    }
  ],
  
  // Deployment configuration
  deploy: {
    // Produção
    production: {
      user: 'ubuntu',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:AlexandreLiberatto/controle-de-combustivel.git',
      path: '/var/www/controle-combustivel',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build:prod && npm run migrate && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'sudo apt update && sudo apt install -y nodejs npm postgresql',
      'post-setup': 'npm run setup && pm2 save && pm2 startup'
    },
    
    // Staging
    staging: {
      user: 'ubuntu',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:AlexandreLiberatto/controle-de-combustivel.git',
      path: '/var/www/controle-combustivel-staging',
      'post-deploy': 'npm install && npm run test:all && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001
      }
    },
    
    // Desenvolvimento
    development: {
      user: 'developer',
      host: ['dev-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:AlexandreLiberatto/controle-de-combustivel.git',
      path: '/home/developer/controle-combustivel',
      'post-deploy': 'npm install && npm run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      }
    }
  }
};
