const { pool } = require('../database');

// Gerar ID único
function generateId() {
    return 'desp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Listar todas as despesas
async function listarDespesas(req, res) {
    try {
        const { data_inicio, data_fim, fornecedor, categoria } = req.query;
        
        let query = `
            SELECT * FROM despesas 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;
        
        // Filtros opcionais
        if (data_inicio) {
            query += ` AND data >= $${paramCount}`;
            params.push(data_inicio);
            paramCount++;
        }
        
        if (data_fim) {
            query += ` AND data <= $${paramCount}`;
            params.push(data_fim);
            paramCount++;
        }
        
        if (fornecedor) {
            query += ` AND LOWER(fornecedor) LIKE LOWER($${paramCount})`;
            params.push(`%${fornecedor}%`);
            paramCount++;
        }
        
        if (categoria) {
            query += ` AND LOWER(categoria) LIKE LOWER($${paramCount})`;
            params.push(`%${categoria}%`);
            paramCount++;
        }
        
        query += ' ORDER BY data DESC, created_at DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar despesas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Buscar despesa por ID
async function buscarDespesaPorId(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM despesas WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Despesa não encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar despesa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Criar nova despesa
async function criarDespesa(req, res) {
    try {
        // Extrair campos do corpo
        const {
            data,
            fornecedor,
            descricao,
            valor,
            categoria,
            observacoes
        } = req.body;
        
        // Validações básicas
        if (!data || !fornecedor || !descricao || !valor) {
            return res.status(400).json({ 
                error: 'Data, fornecedor, descrição e valor são obrigatórios' 
            });
        }
        
        // Validar se o valor é um número positivo
        const valorNumerico = parseFloat(valor);
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            return res.status(400).json({ 
                error: 'Valor deve ser um número positivo' 
            });
        }
        
        const id = generateId();
        
        const result = await pool.query(`
            INSERT INTO despesas (
                id, data, fornecedor, descricao, valor, categoria, observacoes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            id,
            data,
            fornecedor,
            descricao,
            valorNumerico,
            categoria || null,
            observacoes || null
        ]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar despesa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Atualizar despesa
async function atualizarDespesa(req, res) {
    try {
        const { id } = req.params;
        
        // Extrair campos do corpo
        const {
            data,
            fornecedor,
            descricao,
            valor,
            categoria,
            observacoes
        } = req.body;
        
        // Validações básicas
        if (!data || !fornecedor || !descricao || !valor) {
            return res.status(400).json({ 
                error: 'Data, fornecedor, descrição e valor são obrigatórios' 
            });
        }
        
        // Validar se o valor é um número positivo
        const valorNumerico = parseFloat(valor);
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            return res.status(400).json({ 
                error: 'Valor deve ser um número positivo' 
            });
        }
        
        // Verificar se a despesa existe
        const existeResult = await pool.query('SELECT id FROM despesas WHERE id = $1', [id]);
        if (existeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Despesa não encontrada' });
        }
        
        const result = await pool.query(`
            UPDATE despesas 
            SET data = $2, fornecedor = $3, descricao = $4, valor = $5,
                categoria = $6, observacoes = $7, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [
            id,
            data,
            fornecedor,
            descricao,
            valorNumerico,
            categoria || null,
            observacoes || null
        ]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar despesa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Excluir despesa
async function excluirDespesa(req, res) {
    try {
        const { id } = req.params;
        
        // Verificar se a despesa existe
        const existeResult = await pool.query('SELECT id FROM despesas WHERE id = $1', [id]);
        if (existeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Despesa não encontrada' });
        }
        
        await pool.query('DELETE FROM despesas WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Relatório de despesas por categoria
async function relatorioPorCategoria(req, res) {
    try {
        const { data_inicio, data_fim } = req.query;
        
        let query = `
            SELECT 
                categoria,
                COUNT(*) as total_despesas,
                SUM(valor) as total_valor,
                AVG(valor) as valor_medio,
                MAX(valor) as maior_valor,
                MIN(valor) as menor_valor
            FROM despesas 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;
        
        if (data_inicio) {
            query += ` AND data >= $${paramCount}`;
            params.push(data_inicio);
            paramCount++;
        }
        
        if (data_fim) {
            query += ` AND data <= $${paramCount}`;
            params.push(data_fim);
            paramCount++;
        }
        
        query += ` GROUP BY categoria ORDER BY total_valor DESC`;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao gerar relatório por categoria:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Relatório de despesas por período
async function relatorioPorPeriodo(req, res) {
    try {
        const { data_inicio, data_fim, intervalo = 'mes' } = req.query;
        
        let dateFormat;
        switch (intervalo) {
            case 'dia':
                dateFormat = 'YYYY-MM-DD';
                break;
            case 'semana':
                dateFormat = 'YYYY-WW';
                break;
            case 'mes':
            default:
                dateFormat = 'YYYY-MM';
                break;
        }
        
        let query = `
            SELECT 
                TO_CHAR(data, '${dateFormat}') as periodo,
                COUNT(*) as total_despesas,
                SUM(valor) as total_valor,
                AVG(valor) as valor_medio
            FROM despesas 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;
        
        if (data_inicio) {
            query += ` AND data >= $${paramCount}`;
            params.push(data_inicio);
            paramCount++;
        }
        
        if (data_fim) {
            query += ` AND data <= $${paramCount}`;
            params.push(data_fim);
            paramCount++;
        }
        
        query += ` GROUP BY periodo ORDER BY periodo ASC`;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao gerar relatório por período:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

module.exports = {
    listarDespesas,
    buscarDespesaPorId,
    criarDespesa,
    atualizarDespesa,
    excluirDespesa,
    relatorioPorCategoria,
    relatorioPorPeriodo
};
