const { pool } = require('../database');

// Gerar ID único
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Listar todos os caminhões
async function listarCaminhoes(req, res) {
    try {
        const result = await pool.query(
            'SELECT * FROM caminhoes ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar caminhões:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Buscar caminhão por ID
async function buscarCaminhaoPorId(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM caminhoes WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Caminhão não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar caminhão:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Criar novo caminhão
async function criarCaminhao(req, res) {
    try {
        const { placa, modelo, ano, capacidade, motorista, observacoes } = req.body;
        
        // Validações básicas
        if (!placa || !modelo) {
            return res.status(400).json({ error: 'Placa e modelo são obrigatórios' });
        }
        
        const id = generateId();
        const status = 'ativo'; // Status padrão
        
        const result = await pool.query(`
            INSERT INTO caminhoes (id, placa, modelo, ano, capacidade, motorista, status, observacoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [id, placa, modelo, ano || null, capacidade || null, motorista || null, status, observacoes || null]);
        
        res.status(201).json(result.rows[0]);    } catch (error) {
        console.error('Erro ao criar caminhão:', error);
        
        // Verificar se é erro de duplicata de placa
        if (error.code === '23505' && error.constraint === 'caminhoes_placa_key') {
            return res.status(400).json({ error: 'Já existe um caminhão com esta placa' });
        }
        
        // Fornecer uma mensagem de erro mais detalhada para ajudar na depuração
        res.status(500).json({ 
            error: 'Erro interno do servidor', 
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : null
        });
    }
}

// Atualizar caminhão
async function atualizarCaminhao(req, res) {
    try {
        const { id } = req.params;
        const { placa, modelo, ano, capacidade, motorista, status, observacoes } = req.body;
        
        // Verificar se o caminhão existe
        const existeResult = await pool.query('SELECT id FROM caminhoes WHERE id = $1', [id]);
        if (existeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Caminhão não encontrado' });
        }
        
        const result = await pool.query(`
            UPDATE caminhoes 
            SET placa = $2, modelo = $3, ano = $4, capacidade = $5, 
                motorista = $6, status = $7, observacoes = $8, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [id, placa, modelo, ano, capacidade, motorista, status, observacoes]);
        
        res.json(result.rows[0]);    } catch (error) {
        console.error('Erro ao atualizar caminhão:', error);
        
        // Verificar se é erro de duplicata de placa
        if (error.code === '23505' && error.constraint === 'caminhoes_placa_key') {
            return res.status(400).json({ error: 'Já existe um caminhão com esta placa' });
        }
        
        // Fornecer uma mensagem de erro mais detalhada para ajudar na depuração
        res.status(500).json({ 
            error: 'Erro interno do servidor', 
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : null
        });
    }
}

// Excluir caminhão
async function excluirCaminhao(req, res) {
    try {
        const { id } = req.params;
        
        // Verificar se existem abastecimentos vinculados
        const abastecimentosResult = await pool.query(
            'SELECT COUNT(*) as count FROM abastecimentos WHERE caminhao_id = $1',
            [id]
        );
        
        const countAbastecimentos = parseInt(abastecimentosResult.rows[0].count);
        
        if (countAbastecimentos > 0) {
            return res.status(400).json({ 
                error: `Não é possível excluir este caminhão pois existem ${countAbastecimentos} abastecimento(s) vinculado(s)` 
            });
        }
        
        const result = await pool.query(
            'DELETE FROM caminhoes WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Caminhão não encontrado' });
        }
        
        res.json({ message: 'Caminhão excluído com sucesso', caminhao: result.rows[0] });
    } catch (error) {
        console.error('Erro ao excluir caminhão:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Buscar caminhões ativos
async function listarCaminhoesAtivos(req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM caminhoes WHERE status = 'ativo' ORDER BY placa"
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar caminhões ativos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

module.exports = {
    listarCaminhoes,
    buscarCaminhaoPorId,
    criarCaminhao,
    atualizarCaminhao,
    excluirCaminhao,
    listarCaminhoesAtivos
};
