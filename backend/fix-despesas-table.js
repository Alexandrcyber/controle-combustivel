// Script simples para testar e criar tabela de despesas
const { Pool } = require('pg');

// Usar as mesmas configurações que o servidor principal usa
let poolConfig;

try {
    require('dotenv').config();
    
    if (process.env.DATABASE_URL) {
        poolConfig = {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
        };
    } else {
        poolConfig = {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        };
    }
} catch (e) {
    console.log('⚠️  Erro ao carregar .env, usando configurações de fallback');
    // Fallback para configuração funcional conhecida do sistema
    poolConfig = {
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost/gestao_logistica',
        ssl: false
    };
}

console.log('🔗 Configuração do banco:', {
    usando: process.env.DATABASE_URL ? 'DATABASE_URL' : 'configurações individuais',
    ssl: poolConfig.ssl !== false
});

const pool = new Pool(poolConfig);

async function createDespesasTableSimple() {
    try {
        console.log('🔄 Testando conexão...');
        await pool.query('SELECT NOW()');
        console.log('✅ Conexão estabelecida!');
        
        console.log('🔄 Verificando se tabela despesas existe...');
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'despesas'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('✅ Tabela despesas já existe!');
            
            // Testar com uma consulta simples
            const count = await pool.query('SELECT COUNT(*) FROM despesas');
            console.log(`📊 Número de despesas na tabela: ${count.rows[0].count}`);
        } else {
            console.log('⚠️  Tabela despesas não existe, criando...');
            
            // Criar tabela de despesas
            await pool.query(`
                CREATE TABLE despesas (
                    id VARCHAR(50) PRIMARY KEY,
                    data DATE NOT NULL,
                    fornecedor VARCHAR(200) NOT NULL,
                    descricao TEXT NOT NULL,
                    valor DECIMAL(10,2) NOT NULL,
                    categoria VARCHAR(100),
                    observacoes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            console.log('✅ Tabela despesas criada com sucesso!');
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        // Se falhar, tentar uma conexão mais simples
        console.log('🔄 Tentando conexão sem SSL...');
        const simplePool = new Pool({
            host: 'localhost',
            port: 5432,
            database: 'gestao_logistica',
            user: 'postgres',
            password: 'admin',
            ssl: false
        });
        
        try {
            await simplePool.query('SELECT NOW()');
            console.log('✅ Conexão local estabelecida!');
            
            const tableCheck = await simplePool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'despesas'
                );
            `);
            
            if (!tableCheck.rows[0].exists) {
                await simplePool.query(`
                    CREATE TABLE despesas (
                        id VARCHAR(50) PRIMARY KEY,
                        data DATE NOT NULL,
                        fornecedor VARCHAR(200) NOT NULL,
                        descricao TEXT NOT NULL,
                        valor DECIMAL(10,2) NOT NULL,
                        categoria VARCHAR(100),
                        observacoes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);
                console.log('✅ Tabela despesas criada na conexão local!');
            }
            
            await simplePool.end();
        } catch (localError) {
            console.error('❌ Erro na conexão local também:', localError.message);
        }
    } finally {
        try {
            await pool.end();
        } catch (e) {
            // Ignorar erro ao fechar pool
        }
        process.exit(0);
    }
}

createDespesasTableSimple();
