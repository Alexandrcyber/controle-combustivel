const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Middleware
app.use(cors());

// Middleware de debug para ver todas as requisições
app.use((req, res, next) => {
    console.log(`📥 Requisição recebida: ${req.method} ${req.url}`);
    next();
});

// Middleware específico para debug de /api
app.use('/api', (req, res, next) => {
    console.log(`🔧 Middleware /api executado: ${req.method} ${req.url}`);
    next();
});

// Configuração do proxy para redirecionar chamadas /api para o backend
// IMPORTANTE: O proxy deve vir ANTES dos middlewares de parsing do body
app.use('/api', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    // pathRewrite é necessário porque o Express remove o /api antes de passar para o proxy
    pathRewrite: { '^/': '/api/' },
    logLevel: 'debug',
    selfHandleResponse: false,
    // Configurações importantes para POST requests
    secure: false,
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => {
        console.error('❌ Erro no proxy:', err.message);
        console.error('❌ Stack trace:', err.stack);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro de conexão com o backend', details: err.message });
        }
    },    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxy: ${req.method} ${req.url} -> ${BACKEND_URL}${proxyReq.path}`);
        
        // Para POST requests, garantir que o Content-Type está correto
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log(`📤 Headers originais:`, req.headers);
            console.log(`📤 Headers do proxy:`, proxyReq.getHeaders());
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ Proxy Response: ${proxyRes.statusCode} ${req.url}`);
    }
}));

// Servir arquivos estáticos
app.use(express.static('.'));

// Rota para servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tratamento de rotas não encontradas - APENAS para rotas que não são /api
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint não encontrado' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor do Frontend rodando em http://localhost:${PORT}`);
    console.log(`🔌 Proxy configurado para: ${BACKEND_URL}`);
    console.log(`📡 Chamadas /api serão redirecionadas para o backend`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
});
