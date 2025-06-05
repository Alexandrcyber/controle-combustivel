const { pool } = require('../database');

// Gerar ID único
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Listar todos os abastecimentos
async function listarAbastecimentos(req, res) {
    try {
        const { caminhao_id, data_inicio, data_fim, motorista } = req.query;
        
        let query = `
            SELECT a.*, c.placa, c.modelo 
            FROM abastecimentos a 
            LEFT JOIN caminhoes c ON a.caminhao_id = c.id 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;
        
        // Filtros opcionais
        if (caminhao_id) {
            query += ` AND a.caminhao_id = $${paramCount}`;
            params.push(caminhao_id);
            paramCount++;
        }
        
        if (data_inicio) {
            query += ` AND a.data >= $${paramCount}`;
            params.push(data_inicio);
            paramCount++;
        }
        
        if (data_fim) {
            query += ` AND a.data <= $${paramCount}`;
            params.push(data_fim);
            paramCount++;
        }
        
        if (motorista) {
            query += ` AND LOWER(a.motorista) LIKE LOWER($${paramCount})`;
            params.push(`%${motorista}%`);
            paramCount++;
        }
        
        query += ' ORDER BY a.data DESC, a.created_at DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar abastecimentos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Buscar abastecimento por ID
async function buscarAbastecimentoPorId(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT a.*, c.placa, c.modelo 
            FROM abastecimentos a 
            LEFT JOIN caminhoes c ON a.caminhao_id = c.id 
            WHERE a.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Abastecimento não encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar abastecimento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Criar novo abastecimento
async function criarAbastecimento(req, res) {
    try {
        const {
            data,
            periodo_inicio,
            periodo_fim,
            caminhao_id,
            motorista,
            km_inicial,
            km_final,
            litros,
            valor_litro,
            valor_total,
            posto,
            observacoes
        } = req.body;
        
        // Validações básicas
        if (!data || !caminhao_id || !motorista || !litros || !valor_litro) {
            return res.status(400).json({ 
                error: 'Data, caminhão, motorista, litros e valor por litro são obrigatórios' 
            });
        }
        
        // Verificar se o caminhão existe
        const caminhaoResult = await pool.query('SELECT id FROM caminhoes WHERE id = $1', [caminhao_id]);
        if (caminhaoResult.rows.length === 0) {
            return res.status(400).json({ error: 'Caminhão não encontrado' });
        }
        
        const id = generateId();
        
        const result = await pool.query(`
            INSERT INTO abastecimentos 
            (id, data, periodo_inicio, periodo_fim, caminhao_id, motorista, 
             km_inicial, km_final, litros, valor_litro, valor_total, posto, observacoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `, [id, data, periodo_inicio, periodo_fim, caminhao_id, motorista, 
            km_inicial, km_final, litros, valor_litro, valor_total, posto, observacoes]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar abastecimento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Atualizar abastecimento
async function atualizarAbastecimento(req, res) {
    try {
        const { id } = req.params;
        const {
            data,
            periodo_inicio,
            periodo_fim,
            caminhao_id,
            motorista,
            km_inicial,
            km_final,
            litros,
            valor_litro,
            valor_total,
            posto,
            observacoes
        } = req.body;
        
        // Verificar se o abastecimento existe
        const existeResult = await pool.query('SELECT id FROM abastecimentos WHERE id = $1', [id]);
        if (existeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Abastecimento não encontrado' });
        }
        
        // Verificar se o caminhão existe (se foi alterado)
        if (caminhao_id) {
            const caminhaoResult = await pool.query('SELECT id FROM caminhoes WHERE id = $1', [caminhao_id]);
            if (caminhaoResult.rows.length === 0) {
                return res.status(400).json({ error: 'Caminhão não encontrado' });
            }
        }
        
        const result = await pool.query(`
            UPDATE abastecimentos 
            SET data = $2, periodo_inicio = $3, periodo_fim = $4, caminhao_id = $5,
                motorista = $6, km_inicial = $7, km_final = $8, litros = $9,
                valor_litro = $10, valor_total = $11, posto = $12, observacoes = $13,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, [id, data, periodo_inicio, periodo_fim, caminhao_id, motorista,
            km_inicial, km_final, litros, valor_litro, valor_total, posto, observacoes]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar abastecimento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Excluir abastecimento
async function excluirAbastecimento(req, res) {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM abastecimentos WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Abastecimento não encontrado' });
        }
        
        res.json({ message: 'Abastecimento excluído com sucesso', abastecimento: result.rows[0] });
    } catch (error) {
        console.error('Erro ao excluir abastecimento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Relatório de consumo por caminhão
async function relatorioConsumo(req, res) {
    try {
        const { data_inicio, data_fim, caminhao_id } = req.query;
        
        let query = `
            SELECT 
                c.id as caminhao_id,
                c.placa,
                c.modelo,
                COUNT(a.id) as total_abastecimentos,
                SUM(a.litros) as total_litros,
                SUM(a.valor_total) as total_valor,
                AVG(a.valor_litro) as preco_medio_litro,
                MIN(a.data) as primeiro_abastecimento,
                MAX(a.data) as ultimo_abastecimento
            FROM caminhoes c
            LEFT JOIN abastecimentos a ON c.id = a.caminhao_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (data_inicio) {
            query += ` AND (a.data >= $${paramCount} OR a.data IS NULL)`;
            params.push(data_inicio);
            paramCount++;
        }
        
        if (data_fim) {
            query += ` AND (a.data <= $${paramCount} OR a.data IS NULL)`;
            params.push(data_fim);
            paramCount++;
        }
        
        if (caminhao_id) {
            query += ` AND c.id = $${paramCount}`;
            params.push(caminhao_id);
            paramCount++;
        }
        
        query += `
            GROUP BY c.id, c.placa, c.modelo
            ORDER BY c.placa
        `;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao gerar relatório de consumo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// Relatório de custos por período
async function relatorioCustos(req, res) {
    try {
        const { data_inicio, data_fim, agrupamento = 'mes' } = req.query;
        
        let selectGroup;
        let orderGroup;
        
        switch (agrupamento) {
            case 'dia':
                selectGroup = `DATE(a.data) as periodo`;
                orderGroup = `DATE(a.data)`;
                break;
            case 'semana':
                selectGroup = `DATE_TRUNC('week', a.data) as periodo`;
                orderGroup = `DATE_TRUNC('week', a.data)`;
                break;
            case 'ano':
                selectGroup = `EXTRACT(YEAR FROM a.data) as periodo`;
                orderGroup = `EXTRACT(YEAR FROM a.data)`;
                break;
            default: // mes
                selectGroup = `DATE_TRUNC('month', a.data) as periodo`;
                orderGroup = `DATE_TRUNC('month', a.data)`;
        }
        
        let query = `
            SELECT 
                ${selectGroup},
                COUNT(a.id) as total_abastecimentos,
                SUM(a.litros) as total_litros,
                SUM(a.valor_total) as total_valor,
                AVG(a.valor_litro) as preco_medio_litro
            FROM abastecimentos a
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;
        
        if (data_inicio) {
            query += ` AND a.data >= $${paramCount}`;
            params.push(data_inicio);
            paramCount++;
        }
        
        if (data_fim) {
            query += ` AND a.data <= $${paramCount}`;
            params.push(data_fim);
            paramCount++;
        }
        
        query += `
            GROUP BY ${selectGroup}
            ORDER BY ${orderGroup}
        `;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao gerar relatório de custos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

module.exports = {
    listarAbastecimentos,
    buscarAbastecimentoPorId,
    criarAbastecimento,
    atualizarAbastecimento,
    excluirAbastecimento,
    relatorioConsumo,
    relatorioCustos
};
