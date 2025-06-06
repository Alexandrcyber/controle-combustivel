#!/usr/bin/env node
/**
 * Script de Validação Final do Projeto
 * 
 * Este script valida se toda a estrutura e configuração
 * do projeto está correta para produção.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Iniciando validação final do projeto...\n');

const validationResults = {
    structure: [],
    configuration: [],
    security: [],
    performance: [],
    dependencies: [],
    errors: [],
    warnings: [],
    success: []
};

// Função auxiliar para verificar arquivo/pasta
function checkPath(filePath, type = 'file') {
    const exists = fs.existsSync(filePath);
    const isCorrectType = exists && (
        type === 'file' ? fs.statSync(filePath).isFile() : 
        type === 'dir' ? fs.statSync(filePath).isDirectory() : true
    );
    
    return { exists, isCorrectType };
}

// Função para validar JSON
function validateJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        return { valid: true };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

// 1. VALIDAÇÃO DA ESTRUTURA DE PASTAS
console.log('📁 Validando estrutura de pastas...');

const requiredDirs = [
    'backend',
    'frontend',
    'config',
    'tests',
    'docs',
    'scripts',
    'logs',
    'data',
    'backend/controllers',
    'backend/routes',
    'frontend/src',
    'frontend/src/js',
    'frontend/src/css',
    'frontend/src/img',
    'tests/unit',
    'tests/integration',
    'tests/e2e',
    'tests/manual',
    'tests/reports'
];

requiredDirs.forEach(dir => {
    const check = checkPath(dir, 'dir');
    if (check.exists && check.isCorrectType) {
        validationResults.success.push(`✅ Pasta existe: ${dir}`);
    } else {
        validationResults.errors.push(`❌ Pasta faltando: ${dir}`);
    }
});

// 2. VALIDAÇÃO DE ARQUIVOS ESSENCIAIS
console.log('📄 Validando arquivos essenciais...');

const requiredFiles = [
    'package.json',
    'README.md',
    '.env.example',
    'ecosystem.config.js',
    'backend/package.json',
    'backend/server.js',
    'backend/database.js',
    'frontend/package.json',
    'frontend/index.html',
    'frontend/src/js/app.js',
    'frontend/src/css/styles.css',
    'config/index.js',
    'docs/DEPLOY-COMPLETE.md'
];

requiredFiles.forEach(file => {
    const check = checkPath(file, 'file');
    if (check.exists && check.isCorrectType) {
        validationResults.success.push(`✅ Arquivo existe: ${file}`);
    } else {
        validationResults.errors.push(`❌ Arquivo faltando: ${file}`);
    }
});

// 3. VALIDAÇÃO DE CONFIGURAÇÕES JSON
console.log('🔧 Validando arquivos de configuração...');

const jsonFiles = [
    'package.json',
    'backend/package.json',
    'frontend/package.json'
];

jsonFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const validation = validateJSON(file);
        if (validation.valid) {
            validationResults.success.push(`✅ JSON válido: ${file}`);
        } else {
            validationResults.errors.push(`❌ JSON inválido: ${file} - ${validation.error}`);
        }
    }
});

// 4. VALIDAÇÃO DE DEPENDÊNCIAS
console.log('📦 Validando dependências...');

try {
    // Verificar se node_modules existe
    if (fs.existsSync('node_modules')) {
        validationResults.success.push('✅ node_modules instalado na raiz');
    } else {
        validationResults.warnings.push('⚠️  node_modules não encontrado na raiz');
    }
    
    if (fs.existsSync('backend/node_modules')) {
        validationResults.success.push('✅ node_modules instalado no backend');
    } else {
        validationResults.warnings.push('⚠️  node_modules não encontrado no backend');
    }
    
    if (fs.existsSync('frontend/node_modules')) {
        validationResults.success.push('✅ node_modules instalado no frontend');
    } else {
        validationResults.warnings.push('⚠️  node_modules não encontrado no frontend');
    }
    
} catch (error) {
    validationResults.errors.push(`❌ Erro ao verificar dependências: ${error.message}`);
}

// 5. VALIDAÇÃO DE SEGURANÇA
console.log('🔒 Validando configurações de segurança...');

// Verificar se .env não está comitado
if (fs.existsSync('.env')) {
    validationResults.warnings.push('⚠️  Arquivo .env existe - certifique-se de que está no .gitignore');
} else {
    validationResults.success.push('✅ Arquivo .env não está presente (correto para repositório)');
}

// Verificar .gitignore
if (fs.existsSync('.gitignore')) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    const securityPatterns = ['.env', 'node_modules', 'logs/', '*.log'];
    
    securityPatterns.forEach(pattern => {
        if (gitignoreContent.includes(pattern)) {
            validationResults.success.push(`✅ .gitignore contém: ${pattern}`);
        } else {
            validationResults.warnings.push(`⚠️  .gitignore não contém: ${pattern}`);
        }
    });
} else {
    validationResults.errors.push('❌ Arquivo .gitignore não encontrado');
}

// 6. VALIDAÇÃO DE PERFORMANCE
console.log('⚡ Validando configurações de performance...');

// Verificar configuração do PM2
if (fs.existsSync('ecosystem.config.js')) {
    try {
        const pm2Config = require(path.join(process.cwd(), 'ecosystem.config.js'));
        if (pm2Config.apps && pm2Config.apps.length > 0) {
            validationResults.success.push('✅ Configuração PM2 válida');
        } else {
            validationResults.errors.push('❌ Configuração PM2 inválida');
        }
    } catch (error) {
        validationResults.errors.push(`❌ Erro na configuração PM2: ${error.message}`);
    }
}

// Verificar configuração Nginx
if (fs.existsSync('config/nginx.conf')) {
    validationResults.success.push('✅ Configuração Nginx disponível');
} else {
    validationResults.warnings.push('⚠️  Configuração Nginx não encontrada');
}

// 7. VALIDAÇÃO DE SCRIPTS
console.log('🚀 Validando scripts do projeto...');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'start', 'test', 'build', 'setup'];

requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
        validationResults.success.push(`✅ Script disponível: ${script}`);
    } else {
        validationResults.warnings.push(`⚠️  Script não encontrado: ${script}`);
    }
});

// 8. GERAR RELATÓRIO FINAL
console.log('\n📊 Gerando relatório de validação...');

const totalChecks = validationResults.success.length + 
                   validationResults.warnings.length + 
                   validationResults.errors.length;

const successRate = ((validationResults.success.length / totalChecks) * 100).toFixed(1);

const reportContent = `# Relatório de Validação Final
Data: ${new Date().toLocaleString('pt-BR')}

## Resumo
- ✅ **Sucessos:** ${validationResults.success.length}
- ⚠️  **Avisos:** ${validationResults.warnings.length}
- ❌ **Erros:** ${validationResults.errors.length}
- 📊 **Taxa de Sucesso:** ${successRate}%

## Detalhes

### ✅ Sucessos (${validationResults.success.length})
${validationResults.success.map(item => `- ${item}`).join('\n')}

### ⚠️  Avisos (${validationResults.warnings.length})
${validationResults.warnings.map(item => `- ${item}`).join('\n')}

### ❌ Erros (${validationResults.errors.length})
${validationResults.errors.map(item => `- ${item}`).join('\n')}

## Status do Projeto
${validationResults.errors.length === 0 ? 
  '🎉 **PROJETO PRONTO PARA PRODUÇÃO!**' : 
  '🔧 **CORREÇÕES NECESSÁRIAS ANTES DO DEPLOY**'}

## Próximos Passos
${validationResults.errors.length === 0 ? `
1. Configurar variáveis de ambiente (.env)
2. Executar: \`npm run setup\`
3. Executar: \`npm run test:all\`
4. Deploy: \`npm run dev\` ou \`pm2 start ecosystem.config.js\`
` : `
1. Corrigir os erros listados acima
2. Executar novamente: \`node scripts/validate-project.js\`
3. Continuar apenas quando todos os erros estiverem corrigidos
`}

## Contato do Desenvolvedor
**Alexandre Liberatto**
WhatsApp: 48991604054
`;

fs.writeFileSync('docs/VALIDATION-REPORT.md', reportContent);

// Exibir resultado no console
console.log('\n' + '='.repeat(60));
console.log('📋 RELATÓRIO DE VALIDAÇÃO FINAL');
console.log('='.repeat(60));
console.log(`✅ Sucessos: ${validationResults.success.length}`);
console.log(`⚠️  Avisos: ${validationResults.warnings.length}`);
console.log(`❌ Erros: ${validationResults.errors.length}`);
console.log(`📊 Taxa de Sucesso: ${successRate}%`);

if (validationResults.errors.length > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:');
    validationResults.errors.forEach(error => console.log(`  ${error}`));
}

if (validationResults.warnings.length > 0) {
    console.log('\n⚠️  AVISOS:');
    validationResults.warnings.forEach(warning => console.log(`  ${warning}`));
}

console.log('\n📄 Relatório detalhado salvo em: docs/VALIDATION-REPORT.md');

if (validationResults.errors.length === 0) {
    console.log('\n🎉 PARABÉNS! O projeto está pronto para produção!');
    console.log('\n📋 Próximos passos:');
    console.log('1. npm run setup');
    console.log('2. Configurar .env');
    console.log('3. npm run test:all');
    console.log('4. npm run dev (desenvolvimento)');
    console.log('5. pm2 start ecosystem.config.js (produção)');
} else {
    console.log('\n🔧 Corrija os erros antes de continuar com o deploy.');
    process.exit(1);
}

console.log('\n👨‍💻 Desenvolvedor: Alexandre Liberatto');
console.log('📱 WhatsApp: 48991604054');
console.log('='.repeat(60));
