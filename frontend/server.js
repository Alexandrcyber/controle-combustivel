const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Proxy middleware (opcional para futura implementação)
// Se quiser implementar um proxy para enviar requisições para o backend,
// pode usar pacotes como http-proxy-middleware

// Rota principal - para servir apenas arquivos estáticos

// Rota para servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tratamento de rotas não encontradas - redireciona para a página principal
app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor do Frontend rodando em http://localhost:${PORT}`);
    console.log(`🔌 Conectado ao backend em: ${process.env.API_BASE_URL || 'http://localhost:3001'}`);
});
