const express = require('express');
const cors = require('cors');
const path = require('path');

// Carregar configurações do .env específico do backend
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Importar configurações centralizadas
const config = require('../config');

const { testConnection, initDatabase } = require('./database');
const { runMigrations } = require('./migrations');

// Importar rotas
const caminhoesRoutes = require('./routes/caminhoes');
const abastecimentosRoutes = require('./routes/abastecimentos');

const app = express();
const PORT = config.backend.port;

console.log(`[BACKEND] Iniciando servidor em modo: ${config.environment}`);
console.log(`[BACKEND] Porta configurada: ${PORT}`);

// Configurar CORS usando configurações centralizadas
const corsOptions = {
    origin: config.cors.origin,
    credentials: true,
    optionsSuccessStatus: 200
};

console.log(`[BACKEND] CORS configurado para origins: ${config.cors.origin.join(', ')}`);

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de log para desenvolvimento
if (config.debug) {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Rotas da API
app.use('/api/caminhoes', caminhoesRoutes);
app.use('/api/abastecimentos', abastecimentosRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Rota para informações do banco
app.get('/api/info', async (req, res) => {
    try {
        const caminhoesResult = await require('./database').pool.query('SELECT COUNT(*) as count FROM caminhoes');
        const abastecimentosResult = await require('./database').pool.query('SELECT COUNT(*) as count FROM abastecimentos');
        
        res.json({
            database: 'connected',
            caminhoes: parseInt(caminhoesResult.rows[0].count),
            abastecimentos: parseInt(abastecimentosResult.rows[0].count),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            database: 'error',
            error: error.message 
        });
    }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Função para inicializar o servidor
async function startServer() {
    try {
        console.log('🚀 Iniciando servidor...');
        
        // Testar conexão com o banco
        console.log('🔗 Testando conexão com o banco de dados...');
        const connected = await testConnection();
        
        if (!connected) {
            console.error('❌ Falha na conexão com o banco de dados');
            console.error('Verifique as configurações no arquivo .env');
            process.exit(1);
        }
        
        // Inicializar banco de dados (criar tabelas base)
        console.log('🗃️  Inicializando estrutura do banco...');
        await initDatabase();
        
        // Executar migrações pendentes
        console.log('🔄 Verificando migrações...');
        await runMigrations();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`✅ Servidor rodando na porta ${PORT}`);
            console.log(`🌐 API disponível em: http://localhost:${PORT}/api`);
            console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📊 Info: http://localhost:${PORT}/api/info`);
            
            if (process.env.NODE_ENV === 'development') {
                console.log('🛠️  Modo de desenvolvimento ativo');
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao inicializar servidor:', error.message);
        process.exit(1);
    }
}

// Tratamento de sinais para shutdown graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Recebido SIGINT, encerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Recebido SIGTERM, encerrando servidor...');
    process.exit(0);
});

// Tratar erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejeitada não tratada:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Exceção não capturada:', error);
    process.exit(1);
});

// Inicializar servidor
startServer();

module.exports = app;
