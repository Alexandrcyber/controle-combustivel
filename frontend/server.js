const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const CAMINHOES_FILE = path.join(__dirname, 'data', 'caminhoes.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Garantir que o diretório data existe
async function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Função para ler caminhões do arquivo
async function lerCaminhoes() {
    try {
        const data = await fs.readFile(CAMINHOES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Se o arquivo não existe, retorna array vazio
        return [];
    }
}

// Função para salvar caminhões no arquivo
async function salvarCaminhoes(caminhoes) {
    await ensureDataDir();
    await fs.writeFile(CAMINHOES_FILE, JSON.stringify(caminhoes, null, 2));
}

// Rotas da API para caminhões

// GET - Buscar todos os caminhões
app.get('/api/caminhoes', async (req, res) => {
    try {
        const caminhoes = await lerCaminhoes();
        res.json(caminhoes);
    } catch (error) {
        console.error('Erro ao buscar caminhões:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST - Criar novo caminhão
app.post('/api/caminhoes', async (req, res) => {
    try {
        const novoCaminhao = req.body;
        
        // Gerar ID único se não fornecido
        if (!novoCaminhao.id) {
            novoCaminhao.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }
        
        const caminhoes = await lerCaminhoes();
        caminhoes.push(novoCaminhao);
        await salvarCaminhoes(caminhoes);
        
        res.status(201).json(novoCaminhao);
    } catch (error) {
        console.error('Erro ao criar caminhão:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// PUT - Atualizar caminhão existente
app.put('/api/caminhoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;
        
        const caminhoes = await lerCaminhoes();
        const index = caminhoes.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Caminhão não encontrado' });
        }
        
        caminhoes[index] = { ...caminhoes[index], ...dadosAtualizados, id };
        await salvarCaminhoes(caminhoes);
        
        res.json(caminhoes[index]);
    } catch (error) {
        console.error('Erro ao atualizar caminhão:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DELETE - Excluir caminhão
app.delete('/api/caminhoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const caminhoes = await lerCaminhoes();
        const index = caminhoes.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Caminhão não encontrado' });
        }
        
        const caminhaoRemovido = caminhoes.splice(index, 1)[0];
        await salvarCaminhoes(caminhoes);
        
        res.json(caminhaoRemovido);
    } catch (error) {
        console.error('Erro ao excluir caminhão:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚛 Servidor do Controle de Combustível rodando em http://localhost:${PORT}`);
    console.log(`📁 Caminhões serão salvos em: ${CAMINHOES_FILE}`);
});
