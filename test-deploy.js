#!/usr/bin/env node

/**
 * Script para testar o deploy antes de enviar para o Render
 */

const path = require('path');

console.log('🧪 Testando configuração para deploy no Render...\n');

// Verificar se os arquivos necessários existem
const requiredFiles = [
    'backend/server.js',
    'backend/package.json',
    'package.json',
    'render.yaml'
];

console.log('📁 Verificando arquivos necessários:');
requiredFiles.forEach(file => {
    const fs = require('fs');
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Verificar package.json do backend
console.log('\n📦 Verificando package.json do backend:');
try {
    const backendPackage = require('./backend/package.json');
    console.log(`  ✅ main: ${backendPackage.main}`);
    console.log(`  ✅ start script: ${backendPackage.scripts.start}`);
    console.log(`  ✅ node version: ${backendPackage.engines?.node || 'não especificada'}`);
} catch (error) {
    console.log('  ❌ Erro ao ler package.json do backend:', error.message);
}

// Verificar package.json da raiz
console.log('\n📦 Verificando package.json da raiz:');
try {
    const rootPackage = require('./package.json');
    console.log(`  ✅ start script: ${rootPackage.scripts.start}`);
    console.log(`  ✅ build script: ${rootPackage.scripts.build}`);
} catch (error) {
    console.log('  ❌ Erro ao ler package.json da raiz:', error.message);
}

// Verificar variáveis de ambiente
console.log('\n🔧 Verificando configuração de ambiente:');
require('dotenv').config({ path: './backend/.env' });

const requiredEnvVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'JWT_SECRET'
];

requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`  ${value ? '✅' : '❌'} ${varName}: ${value ? 'definida' : 'não definida'}`);
});

console.log('\n🚀 Comandos que o Render executará:');
console.log('  Build: npm install && cd backend && npm install');
console.log('  Start: cd backend && npm start');

console.log('\n📝 Para fazer o deploy:');
console.log('1. Commit e push das alterações');
console.log('2. Configure as variáveis de ambiente no dashboard do Render');
console.log('3. Conecte o repositório GitHub no Render');
console.log('4. Use as configurações do arquivo render.yaml ou configure manualmente');

console.log('\n✨ Teste concluído!');
