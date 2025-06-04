// Servidor Node.js para API de conexão com PostgreSQL
const express = require('express');
const cors = require('cors');
const db = require('./src/js/db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do Express
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rota para verificar status da conexão
app.get('/api/status', async (req, res) => {
    try {
        const connected = await db.testConnection();
        if (connected) {
            res.json({ status: 'connected', message: 'Conexão com PostgreSQL estabelecida com sucesso' });
        } else {
            res.status(500).json({ status: 'error', message: 'Não foi possível conectar ao PostgreSQL' });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Inicializar banco de dados
app.post('/api/initialize', async (req, res) => {
    try {
        await db.initializeDatabase();
        res.json({ status: 'success', message: 'Banco de dados inicializado com sucesso' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Migrar dados do localStorage
app.post('/api/migrate', async (req, res) => {
    try {
        const { caminhoes, abastecimentos } = req.body;
        await db.migrateDataFromLocalStorage(caminhoes, abastecimentos);
        res.json({ status: 'success', message: 'Dados migrados com sucesso' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// API para caminhões
app.get('/api/caminhoes', async (req, res) => {
    try {
        const caminhoes = await db.getCaminhoes();
        res.json(caminhoes);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/caminhoes', async (req, res) => {
    try {
        const caminhao = await db.saveCaminhao(req.body);
        res.json(caminhao);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.delete('/api/caminhoes/:id', async (req, res) => {
    try {
        await db.deleteCaminhao(req.params.id);
        res.json({ status: 'success', message: 'Caminhão excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// API para abastecimentos
app.get('/api/abastecimentos', async (req, res) => {
    try {
        const abastecimentos = await db.getAbastecimentos();
        res.json(abastecimentos);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/abastecimentos', async (req, res) => {
    try {
        const abastecimento = await db.saveAbastecimento(req.body);
        res.json(abastecimento);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.delete('/api/abastecimentos/:id', async (req, res) => {
    try {
        await db.deleteAbastecimento(req.params.id);
        res.json({ status: 'success', message: 'Abastecimento excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Rota para limpar todos os abastecimentos
app.delete('/api/limpar-abastecimentos', async (req, res) => {
    try {
        const client = await db.pool.connect();
        await client.query('DELETE FROM abastecimentos');
        client.release();
        res.json({ status: 'success', message: 'Todos os abastecimentos foram excluídos' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Rota para limpar todos os caminhões
app.delete('/api/limpar-caminhoes', async (req, res) => {
    try {
        const client = await db.pool.connect();
        // Primeiro tentar limpar as chaves estrangeiras
        await client.query('DELETE FROM abastecimentos');
        // Depois excluir os caminhões
        await client.query('DELETE FROM caminhoes');
        client.release();
        res.json({ status: 'success', message: 'Todos os caminhões foram excluídos' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
