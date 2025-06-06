const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do banco Neon
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_T4zrGOjhYp8V@ep-holy-tooth-acmcyz6e-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

// Função para gerar ID único
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Caminhões
app.get('/api/caminhoes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM caminhoes ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar caminhões:', error);
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
});

app.get('/api/caminhoes/ativos', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM caminhoes WHERE status = 'ativo' ORDER BY placa");
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar caminhões ativos:', error);
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
});

app.post('/api/caminhoes', async (req, res) => {
    try {
        const { placa, modelo, ano, capacidade, motorista, observacoes } = req.body;
        
        if (!placa || !modelo) {
            return res.status(400).json({ error: 'Placa e modelo são obrigatórios' });
        }
        
        const id = generateId();
        const status = 'ativo';
        
        const result = await pool.query(`
            INSERT INTO caminhoes (id, placa, modelo, ano, capacidade, motorista, status, observacoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [id, placa, modelo, ano || null, capacidade || null, motorista || null, status, observacoes || null]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar caminhão:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Já existe um caminhão com esta placa' });
        }
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
});

// Abastecimentos
app.get('/api/abastecimentos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, c.placa, c.modelo 
            FROM abastecimentos a 
            LEFT JOIN caminhoes c ON a.caminhao_id = c.id 
            ORDER BY a.data DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar abastecimentos:', error);
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
});

app.post('/api/abastecimentos', async (req, res) => {
    try {
        const { caminhao_id, data, quantidade, preco_litro, local } = req.body;
        
        if (!caminhao_id || !data || !quantidade || !preco_litro) {
            return res.status(400).json({ error: 'Campos obrigatórios: caminhao_id, data, quantidade, preco_litro' });
        }
        
        // Verificar se o caminhão existe
        const caminhaoCheck = await pool.query('SELECT id FROM caminhoes WHERE id = $1', [caminhao_id]);
        if (caminhaoCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Caminhão não encontrado' });
        }
        
        const id = generateId();
        const valor_total = quantidade * preco_litro;
        
        const result = await pool.query(`
            INSERT INTO abastecimentos (id, caminhao_id, data, quantidade, preco_litro, valor_total, local)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [id, caminhao_id, data, quantidade, preco_litro, valor_total, local || null]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar abastecimento:', error);
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
});

// Dashboard
app.get('/api/dashboard', async (req, res) => {
    try {
        const stats = await Promise.all([
            pool.query('SELECT COUNT(*) as total FROM caminhoes'),
            pool.query("SELECT COUNT(*) as ativos FROM caminhoes WHERE status = 'ativo'"),
            pool.query('SELECT COUNT(*) as total FROM abastecimentos'),
            pool.query('SELECT SUM(quantidade) as total_litros FROM abastecimentos'),
            pool.query('SELECT SUM(valor_total) as total_gasto FROM abastecimentos')
        ]);
        
        res.json({
            caminhoes: {
                total: parseInt(stats[0].rows[0].total),
                ativos: parseInt(stats[1].rows[0].ativos)
            },
            abastecimentos: {
                total: parseInt(stats[2].rows[0].total),
                total_litros: parseFloat(stats[3].rows[0].total_litros) || 0,
                total_gasto: parseFloat(stats[4].rows[0].total_gasto) || 0
            }
        });
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
    console.log(`🌐 API disponível em: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Testar conexão com banco
pool.query('SELECT NOW() as timestamp')
    .then(result => {
        console.log('✅ Conectado ao banco Neon:', result.rows[0].timestamp);
    })
    .catch(error => {
        console.error('❌ Erro na conexão com banco:', error.message);
    });
