// Configuração da conexão com o PostgreSQL
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar configurações do arquivo config.json
let config;
try {
    const configPath = path.join(__dirname, '../../config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    const configObj = JSON.parse(configData);
    
    // Verificar se devemos usar Neon PostgreSQL ou PostgreSQL local
    if (configObj.neon && configObj.neon.enabled === true) {
        console.log('Usando configuração do Neon PostgreSQL');
        config = configObj.neon;
        
        // Configuração do SSL para o Neon
        if (config.ssl) {
            config.ssl = {
                rejectUnauthorized: true
            };
        }
    } else {
        console.log('Usando configuração do PostgreSQL local');
        config = configObj.postgresql;
    }
} catch (err) {
    console.error('Erro ao carregar configurações do PostgreSQL:', err);
    // Configurações padrão em caso de falha
    config = {
        user: 'postgres',
        host: 'localhost',
        database: 'controle_combustivel',
        password: '11janeiro',
        port: 5432
    };
}

// Configurações de conexão
const pool = new Pool(config);

// Testar conexão
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Conexão com o PostgreSQL estabelecida com sucesso');
        client.release();
        return true;
    } catch (err) {
        console.error('Erro ao conectar ao PostgreSQL:', err);
        return false;
    }
}

// Função para inicializar o banco de dados
async function initializeDatabase() {
    try {
        // Conectar ao banco
        const client = await pool.connect();
        
        // Criar tabela de caminhões se não existir
        await client.query(`
            CREATE TABLE IF NOT EXISTS caminhoes (
                id SERIAL PRIMARY KEY,
                placa VARCHAR(10) NOT NULL,
                modelo VARCHAR(100) NOT NULL,
                ano INTEGER NOT NULL,
                capacidade NUMERIC(10,2) NOT NULL,
                motorista VARCHAR(100)
            )
        `);
        
        // Criar tabela de abastecimentos se não existir
        await client.query(`
            CREATE TABLE IF NOT EXISTS abastecimentos (
                id SERIAL PRIMARY KEY,
                data DATE NOT NULL,
                periodo_inicio DATE NOT NULL,
                periodo_fim DATE NOT NULL,
                caminhao_id INTEGER REFERENCES caminhoes(id),
                motorista VARCHAR(100) NOT NULL,
                km_inicial NUMERIC(10,2) NOT NULL,
                km_final NUMERIC(10,2) NOT NULL,
                litros NUMERIC(10,2) NOT NULL,
                valor_litro NUMERIC(10,2) NOT NULL,
                valor_total NUMERIC(10,2) NOT NULL,
                posto VARCHAR(100),
                observacoes TEXT
            )
        `);
        
        console.log('Tabelas criadas/verificadas com sucesso');
        client.release();
        return true;
    } catch (err) {
        console.error('Erro ao inicializar o banco de dados:', err);
        return false;
    }
}

// Função para migrar dados do localStorage para o PostgreSQL
async function migrateDataFromLocalStorage(caminhoes, abastecimentos) {
    try {
        const client = await pool.connect();
        
        // Iniciar transação
        await client.query('BEGIN');
        
        // Inserir caminhões
        for (const caminhao of caminhoes) {
            // Verificar se o caminhão já existe (baseado na placa)
            const existingResult = await client.query(
                'SELECT id FROM caminhoes WHERE placa = $1',
                [caminhao.placa]
            );
            
            if (existingResult.rows.length === 0) {
                // Inserir novo caminhão
                await client.query(
                    'INSERT INTO caminhoes (id, placa, modelo, ano, capacidade, motorista) VALUES ($1, $2, $3, $4, $5, $6)',
                    [caminhao.id, caminhao.placa, caminhao.modelo, caminhao.ano, caminhao.capacidade, caminhao.motorista || null]
                );
            }
        }
        
        // Inserir abastecimentos
        for (const abastecimento of abastecimentos) {
            // Verificar se o abastecimento já existe
            const existingResult = await client.query(
                'SELECT id FROM abastecimentos WHERE id = $1',
                [abastecimento.id]
            );
            
            if (existingResult.rows.length === 0) {
                // Inserir novo abastecimento
                await client.query(
                    `INSERT INTO abastecimentos 
                    (id, data, periodo_inicio, periodo_fim, caminhao_id, motorista, 
                    km_inicial, km_final, litros, valor_litro, valor_total, posto, observacoes) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                    [
                        abastecimento.id,
                        new Date(abastecimento.data),
                        new Date(abastecimento.periodoInicio),
                        new Date(abastecimento.periodoFim),
                        abastecimento.caminhaoId,
                        abastecimento.motorista,
                        abastecimento.kmInicial,
                        abastecimento.kmFinal,
                        abastecimento.litros,
                        abastecimento.valorLitro,
                        abastecimento.valorTotal,
                        abastecimento.posto || null,
                        abastecimento.observacoes || null
                    ]
                );
            }
        }
        
        // Finalizar transação
        await client.query('COMMIT');
        
        console.log('Dados migrados com sucesso para o PostgreSQL');
        client.release();
        return true;
    } catch (err) {
        console.error('Erro ao migrar dados para o PostgreSQL:', err);
        
        try {
            // Tentar fazer rollback em caso de erro
            const client = await pool.connect();
            await client.query('ROLLBACK');
            client.release();
        } catch (rollbackErr) {
            console.error('Erro ao fazer rollback da transação:', rollbackErr);
        }
        
        return false;
    }
}

// Funções para manipulação de caminhões
async function getCaminhoes() {
    try {
        const result = await pool.query('SELECT * FROM caminhoes ORDER BY id');
        return result.rows;
    } catch (err) {
        console.error('Erro ao buscar caminhões:', err);
        return [];
    }
}

async function saveCaminhao(caminhao) {
    try {
        const client = await pool.connect();
        
        if (caminhao.id) {
            // Atualizar caminhão existente
            await client.query(
                'UPDATE caminhoes SET placa = $1, modelo = $2, ano = $3, capacidade = $4, motorista = $5 WHERE id = $6',
                [caminhao.placa, caminhao.modelo, caminhao.ano, caminhao.capacidade, caminhao.motorista || null, caminhao.id]
            );
        } else {
            // Inserir novo caminhão
            const result = await client.query(
                'INSERT INTO caminhoes (placa, modelo, ano, capacidade, motorista) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [caminhao.placa, caminhao.modelo, caminhao.ano, caminhao.capacidade, caminhao.motorista || null]
            );
            caminhao.id = result.rows[0].id;
        }
        
        client.release();
        return caminhao;
    } catch (err) {
        console.error('Erro ao salvar caminhão:', err);
        throw err;
    }
}

async function deleteCaminhao(id) {
    try {
        const client = await pool.connect();
        
        // Iniciar transação
        await client.query('BEGIN');
        
        // Primeiro verificar se há abastecimentos relacionados
        const checkResult = await client.query(
            'SELECT COUNT(*) FROM abastecimentos WHERE caminhao_id = $1',
            [id]
        );
        
        const hasAbastecimentos = parseInt(checkResult.rows[0].count) > 0;
        
        if (hasAbastecimentos) {
            // Excluir abastecimentos relacionados
            await client.query('DELETE FROM abastecimentos WHERE caminhao_id = $1', [id]);
        }
        
        // Excluir o caminhão
        await client.query('DELETE FROM caminhoes WHERE id = $1', [id]);
        
        // Finalizar transação
        await client.query('COMMIT');
        
        client.release();
        return true;
    } catch (err) {
        console.error('Erro ao excluir caminhão:', err);
        
        try {
            // Tentar fazer rollback em caso de erro
            const client = await pool.connect();
            await client.query('ROLLBACK');
            client.release();
        } catch (rollbackErr) {
            console.error('Erro ao fazer rollback da transação:', rollbackErr);
        }
        
        return false;
    }
}

// Funções para manipulação de abastecimentos
async function getAbastecimentos() {
    try {
        const result = await pool.query(`
            SELECT a.*, c.placa, c.modelo 
            FROM abastecimentos a
            LEFT JOIN caminhoes c ON a.caminhao_id = c.id
            ORDER BY a.data DESC
        `);
        
        // Converter nomes de campos snake_case para camelCase para manter compatibilidade
        return result.rows.map(row => ({
            id: row.id,
            data: row.data,
            periodoInicio: row.periodo_inicio,
            periodoFim: row.periodo_fim,
            caminhaoId: row.caminhao_id,
            motorista: row.motorista,
            kmInicial: row.km_inicial,
            kmFinal: row.km_final,
            litros: row.litros,
            valorLitro: row.valor_litro,
            valorTotal: row.valor_total,
            posto: row.posto,
            observacoes: row.observacoes,
            // Dados adicionais do caminhão
            placa: row.placa,
            modelo: row.modelo
        }));
    } catch (err) {
        console.error('Erro ao buscar abastecimentos:', err);
        return [];
    }
}

async function saveAbastecimento(abastecimento) {
    try {
        const client = await pool.connect();
        
        if (abastecimento.id) {
            // Atualizar abastecimento existente
            await client.query(
                `UPDATE abastecimentos SET 
                data = $1, periodo_inicio = $2, periodo_fim = $3, caminhao_id = $4, motorista = $5,
                km_inicial = $6, km_final = $7, litros = $8, valor_litro = $9, valor_total = $10,
                posto = $11, observacoes = $12 
                WHERE id = $13`,
                [
                    new Date(abastecimento.data),
                    new Date(abastecimento.periodoInicio),
                    new Date(abastecimento.periodoFim),
                    abastecimento.caminhaoId,
                    abastecimento.motorista,
                    abastecimento.kmInicial,
                    abastecimento.kmFinal,
                    abastecimento.litros,
                    abastecimento.valorLitro,
                    abastecimento.valorTotal,
                    abastecimento.posto || null,
                    abastecimento.observacoes || null,
                    abastecimento.id
                ]
            );
        } else {
            // Inserir novo abastecimento
            const result = await client.query(
                `INSERT INTO abastecimentos 
                (data, periodo_inicio, periodo_fim, caminhao_id, motorista, 
                km_inicial, km_final, litros, valor_litro, valor_total, posto, observacoes) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
                [
                    new Date(abastecimento.data),
                    new Date(abastecimento.periodoInicio),
                    new Date(abastecimento.periodoFim),
                    abastecimento.caminhaoId,
                    abastecimento.motorista,
                    abastecimento.kmInicial,
                    abastecimento.kmFinal,
                    abastecimento.litros,
                    abastecimento.valorLitro,
                    abastecimento.valorTotal,
                    abastecimento.posto || null,
                    abastecimento.observacoes || null
                ]
            );
            abastecimento.id = result.rows[0].id;
        }
        
        client.release();
        return abastecimento;
    } catch (err) {
        console.error('Erro ao salvar abastecimento:', err);
        throw err;
    }
}

async function deleteAbastecimento(id) {
    try {
        await pool.query('DELETE FROM abastecimentos WHERE id = $1', [id]);
        return true;
    } catch (err) {
        console.error('Erro ao excluir abastecimento:', err);
        return false;
    }
}

// Exportar funções
module.exports = {
    pool,
    testConnection,
    initializeDatabase,
    migrateDataFromLocalStorage,
    getCaminhoes,
    saveCaminhao,
    deleteCaminhao,
    getAbastecimentos,
    saveAbastecimento,
    deleteAbastecimento
};
