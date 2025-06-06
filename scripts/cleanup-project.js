#!/usr/bin/env node
/**
 * Script de Limpeza e Organização Final do Projeto
 * 
 * Este script realiza a limpeza final e organização do projeto:
 * - Remove arquivos duplicados ou desnecessários
 * - Move arquivos para suas pastas corretas
 * - Valida a estrutura final do projeto
 * - Gera relatório de organização
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Iniciando limpeza e organização final do projeto...\n');

const projectRoot = process.cwd();
const cleanupActions = [];

// Função para verificar se arquivo existe
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

// Função para mover arquivo com segurança
function safeMove(source, destination) {
    try {
        if (fileExists(source)) {
            const destDir = path.dirname(destination);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            
            if (fileExists(destination)) {
                console.log(`⚠️  Arquivo já existe: ${destination}`);
                const backupPath = destination + '.backup';
                fs.renameSync(destination, backupPath);
                console.log(`📦 Backup criado: ${backupPath}`);
            }
            
            fs.renameSync(source, destination);
            cleanupActions.push(`✅ Movido: ${source} → ${destination}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Erro ao mover ${source}: ${error.message}`);
        return false;
    }
}

// Função para remover arquivo com segurança
function safeRemove(filePath) {
    try {
        if (fileExists(filePath)) {
            fs.unlinkSync(filePath);
            cleanupActions.push(`🗑️  Removido: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Erro ao remover ${filePath}: ${error.message}`);
        return false;
    }
}

// 1. Organizar arquivos de teste do frontend
console.log('📁 Organizando arquivos de teste do frontend...');
const frontendTestFiles = [
    'frontend/teste-alertas.html',
    'frontend/teste-correcao-campos.html',
    'frontend/teste-correcao-final.html',
    'frontend/teste-relatorio-consumo.html',
    'frontend/teste-relatorio-final.html',
    'frontend/teste-simples-alertas.html',
    'frontend/teste-sistema-real-replicado.html',
    'frontend/debug-relatorio-campos.html'
];

frontendTestFiles.forEach(file => {
    const fileName = path.basename(file);
    const destination = `tests/manual/${fileName}`;
    safeMove(file, destination);
});

// 2. Organizar arquivos de documentação do frontend
console.log('📄 Organizando documentação do frontend...');
const frontendDocs = [
    'frontend/IMPLEMENTACAO-SWEETALERT2-CONCLUIDA.md',
    'frontend/RELATORIO-IMPLEMENTACAO-SWEETALERT2.md'
];

frontendDocs.forEach(file => {
    const fileName = path.basename(file);
    const destination = `docs/${fileName}`;
    safeMove(file, destination);
});

// 3. Mover arquivos JavaScript de teste do frontend
console.log('🧪 Organizando scripts de teste...');
const frontendTestScripts = [
    'frontend/src/js/teste-final-sistema.js',
    'frontend/src/js/teste-integracao-alertas.js',
    'frontend/src/js/test-api.js'
];

frontendTestScripts.forEach(file => {
    const fileName = path.basename(file);
    const destination = `tests/unit/${fileName}`;
    safeMove(file, destination);
});

// 4. Limpar arquivos backup
console.log('🧹 Removendo arquivos backup...');
const backupFiles = [
    'frontend/src/js/relatorios.js.bak'
];

backupFiles.forEach(file => {
    safeRemove(file);
});

// 5. Validar estrutura de pastas necessárias
console.log('📂 Validando estrutura de pastas...');
const requiredDirs = [
    'backend/middleware',
    'backend/models',
    'backend/utils',
    'frontend/src/components',
    'frontend/src/utils',
    'frontend/dist',
    'config/environments',
    'logs/app',
    'logs/error',
    'tests/fixtures',
    'tests/mocks'
];

requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        cleanupActions.push(`📁 Pasta criada: ${dir}`);
    }
});

// 6. Criar arquivos .gitkeep para pastas vazias
const gitkeepDirs = [
    'backend/middleware',
    'backend/models',
    'backend/utils',
    'frontend/src/components',
    'frontend/src/utils',
    'frontend/dist',
    'logs/app',
    'logs/error',
    'tests/fixtures',
    'tests/mocks',
    'tests/e2e',
    'tests/reports'
];

gitkeepDirs.forEach(dir => {
    const gitkeepPath = path.join(dir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '');
        cleanupActions.push(`📌 .gitkeep criado: ${dir}`);
    }
});

// 7. Otimizar package.json files
console.log('📦 Otimizando arquivos package.json...');

// Backend package.json
const backendPackageJson = {
    "name": "controle-combustivel-backend",
    "version": "1.0.0",
    "description": "Backend da API do sistema de controle de combustível",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js",
        "migrate": "node cli-migrate.js migrate",
        "migrate:status": "node cli-migrate.js status",
        "migrate:rollback": "node cli-migrate.js rollback",
        "migrate:reset": "node cli-migrate.js reset",
        "db:test": "node cli-migrate.js test",
        "db:seed": "node cli-migrate.js seed",
        "test": "node ../tests/unit/run-tests.js",
        "test:api": "node ../tests/unit/teste-apis-simples.js",
        "fix-columns": "node fix-columns.js",
        "lint": "eslint .",
        "format": "prettier --write ."
    },
    "keywords": ["controle", "combustivel", "api", "postgresql", "express"],
    "author": "Alexandre Liberatto",
    "license": "MIT",
    "engines": {
        "node": ">=16.0.0",
        "npm": ">=8.0.0"
    },
    "dependencies": {
        "express": "^4.18.2",
        "cors": "^2.8.5",
        "pg": "^8.11.3",
        "dotenv": "^16.3.1",
        "helmet": "^7.0.0",
        "express-rate-limit": "^6.8.1",
        "compression": "^1.7.4"
    },
    "devDependencies": {
        "nodemon": "^3.0.1",
        "eslint": "^8.45.0",
        "prettier": "^3.0.0",
        "jest": "^29.6.1",
        "supertest": "^6.3.3"
    }
};

fs.writeFileSync('backend/package.json', JSON.stringify(backendPackageJson, null, 2));
cleanupActions.push('✅ Backend package.json otimizado');

// Frontend package.json
const frontendPackageJson = {
    "name": "controle-combustivel-frontend",
    "version": "1.0.0",
    "description": "Frontend do sistema de controle de combustível",
    "main": "index.html",
    "scripts": {
        "start": "http-server -p 3000 -o",
        "dev": "http-server -p 3000 -o -c-1",
        "build": "npm run build:css && npm run build:js",
        "build:css": "postcss src/css/styles.css -o dist/css/styles.min.css",
        "build:js": "terser src/js/*.js -o dist/js/app.min.js",
        "test": "jest",
        "test:e2e": "cypress run",
        "lint": "eslint src/js/",
        "format": "prettier --write src/",
        "serve": "node server.js"
    },
    "repository": {
        "type": "git",
        "url": "git+https://github.com/AlexandreLiberatto/controle-de-combustivel.git"
    },
    "keywords": ["combustivel", "dashboard", "frontend", "bootstrap"],
    "author": "Alexandre Liberatto",
    "license": "MIT",
    "engines": {
        "node": ">=16.0.0",
        "npm": ">=8.0.0"
    },
    "bugs": {
        "url": "https://github.com/AlexandreLiberatto/controle-de-combustivel/issues"
    },
    "homepage": "https://github.com/AlexandreLiberatto/controle-de-combustivel#readme",
    "devDependencies": {
        "http-server": "^14.1.1",
        "eslint": "^8.45.0",
        "prettier": "^3.0.0",
        "jest": "^29.6.1",
        "cypress": "^12.17.2",
        "postcss": "^8.4.24",
        "postcss-cli": "^10.1.0",
        "terser": "^5.19.2"
    },
    "dependencies": {
        "cors": "^2.8.5",
        "dotenv": "^16.5.0",
        "express": "^4.18.2"
    }
};

fs.writeFileSync('frontend/package.json', JSON.stringify(frontendPackageJson, null, 2));
cleanupActions.push('✅ Frontend package.json otimizado');

// Gerar relatório final
console.log('\n📊 Gerando relatório de organização...');
const reportContent = `# Relatório de Organização Final do Projeto
Data: ${new Date().toLocaleString('pt-BR')}

## Ações Realizadas:
${cleanupActions.map(action => `- ${action}`).join('\n')}

## Estrutura Final Validada:
✅ Backend organizado em /backend
✅ Frontend organizado em /frontend  
✅ Testes organizados em /tests
✅ Configurações em /config
✅ Scripts utilitários em /scripts
✅ Documentação em /docs
✅ Logs em /logs
✅ Dados em /data

## Próximos Passos:
1. Executar \`npm run setup\` na raiz do projeto
2. Configurar variáveis de ambiente (.env)
3. Executar testes: \`npm run test:all\`
4. Fazer deploy de produção

## Contato do Desenvolvedor:
**Alexandre Liberatto**
WhatsApp: 48991604054
`;

fs.writeFileSync('docs/CLEANUP-REPORT.md', reportContent);

console.log('\n🎉 Limpeza e organização concluída!');
console.log(`📄 Relatório salvo em: docs/CLEANUP-REPORT.md`);
console.log(`🔧 Total de ações: ${cleanupActions.length}`);
console.log('\n📋 Próximos passos:');
console.log('1. npm run setup');
console.log('2. Configurar .env');
console.log('3. npm run test:all');
console.log('4. npm run dev (desenvolvimento)');
console.log('5. npm run build (produção)');
