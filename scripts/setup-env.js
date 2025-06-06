/**
 * Script de setup do ambiente
 * Cria arquivos .env e configura o projeto para desenvolvimento/produção
 */

const fs = require('fs');
const path = require('path');

function createEnvFile() {
    const envPath = path.join(__dirname, '..', '.env');
    
    if (fs.existsSync(envPath)) {
        console.log('📋 Arquivo .env já existe');
        return;
    }
    
    const envContent = `# Configurações do Ambiente - Gerado automaticamente
NODE_ENV=development

# Configurações do Servidor Backend
BACKEND_PORT=3001
BACKEND_HOST=localhost

# Configurações do Banco de Dados
DB_TYPE=json
DB_PATH=./data

# Configurações de CORS
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000

# Configurações do Frontend
FRONTEND_PORT=3000
FRONTEND_HOST=localhost

# URLs da API
API_BASE_URL=http://localhost:3001/api

# Configurações de Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Configurações de Segurança
JWT_SECRET=dev-secret-${Date.now()}
SESSION_SECRET=dev-session-${Date.now()}

# Data de criação: ${new Date().toISOString()}
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado com sucesso');
}

function createLogsDirectory() {
    const logsPath = path.join(__dirname, '..', 'logs');
    
    if (!fs.existsSync(logsPath)) {
        fs.mkdirSync(logsPath, { recursive: true });
        console.log('✅ Diretório de logs criado');
    } else {
        console.log('📋 Diretório de logs já existe');
    }
}

function createGitignore() {
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    
    const gitignoreContent = `# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.production
.env.test

# Logs
logs/
*.log
npm-debug.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Build outputs
dist/
build/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
temp/
tmp/

# Database files (if not using external DB)
*.db
*.sqlite
*.sqlite3

# Backup files
*.bak
*.backup
`;
    
    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log('✅ Arquivo .gitignore criado');
    } else {
        console.log('📋 Arquivo .gitignore já existe');
    }
}

function main() {
    console.log('🚀 Configurando ambiente do projeto...\n');
    
    try {
        createEnvFile();
        createLogsDirectory();
        createGitignore();
        
        console.log('\n✅ Setup concluído com sucesso!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Execute: npm run install:all');
        console.log('2. Execute: npm run dev');
        console.log('3. Acesse: http://localhost:3000');
        
    } catch (error) {
        console.error('❌ Erro durante o setup:', error.message);
        process.exit(1);
    }
}

main();
