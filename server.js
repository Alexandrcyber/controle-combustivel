/**
 * Arquivo de entrada principal para deploy no Render
 * Este arquivo carrega e inicia o servidor backend
 */

const path = require('path');

console.log('🚀 Iniciando aplicação...');

// Carregar dotenv primeiro
try {
    require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
    console.log('✅ Dotenv carregado');
} catch (error) {
    console.log('⚠️ Dotenv não carregado (variáveis podem vir do ambiente):', error.message);
}

// Se estiver no Render, definir variáveis específicas
if (process.env.RENDER) {
    console.log('📡 Detectado ambiente Render');
    process.env.BACKEND_HOST = '0.0.0.0';
    
    // Adicionar o diretório raiz ao NODE_PATH para resolver dependências
    process.env.NODE_PATH = path.join(__dirname, 'node_modules');
    require('module')._initPaths();
    console.log('🔧 NODE_PATH configurado para:', process.env.NODE_PATH);
}

console.log('🔧 Variáveis de ambiente carregadas:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- RENDER:', process.env.RENDER);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'definida' : 'não definida');

// Importar e inicializar o servidor backend
console.log('🔄 Carregando servidor backend...');
require('./backend/server');
