/**
 * Arquivo de entrada principal para deploy no Render
 * Este arquivo carrega e inicia o servidor backend
 */

const path = require('path');

console.log('🚀 Iniciando aplicação...');

// Carregar configurações do backend
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Se estiver no Render, definir variáveis específicas
if (process.env.RENDER) {
    console.log('📡 Detectado ambiente Render');
    process.env.BACKEND_HOST = '0.0.0.0';
}

// Importar e inicializar o servidor backend
console.log('🔄 Carregando servidor backend...');
require('./backend/server');
