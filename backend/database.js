const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com PostgreSQL
// Suporte para Neon (PostgreSQL cloud) usando DATABASE_URL ou configurações individuais
let poolConfig;

if (process.env.DATABASE_URL) {
    // Usar DATABASE_URL para Neon ou outros provedores cloud
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
    };
} else {
    // Usar configurações individuais para desenvolvimento local
    poolConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };
}

const pool = new Pool(poolConfig);

// Log da configuração (sem mostrar credenciais)
if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Configuração do banco:', {
        host: poolConfig.host || 'CONNECTION_STRING',
        database: poolConfig.database || 'FROM_URL',
        ssl: poolConfig.ssl !== false
    });
}

// Versão atual do schema do banco
const SCHEMA_VERSION = '1.0.0';

// Função para verificar se uma tabela existe
async function tableExists(tableName) {
    try {
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            );
        `, [tableName]);
        return result.rows[0].exists;
    } catch (error) {
        console.error(`Erro ao verificar existência da tabela ${tableName}:`, error.message);
        return false;
    }
}

// Função para verificar se uma coluna existe
async function columnExists(tableName, columnName) {
    try {
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = $1 
                AND column_name = $2
            );
        `, [tableName, columnName]);
        return result.rows[0].exists;
    } catch (error) {
        console.error(`Erro ao verificar existência da coluna ${columnName} na tabela ${tableName}:`, error.message);
        return false;
    }
}

// Função para adicionar coluna se não existir
async function addColumnIfNotExists(tableName, columnName, columnDefinition) {
    try {
        const exists = await columnExists(tableName, columnName);
        if (!exists) {
            await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`);
            console.log(`✅ Coluna ${columnName} adicionada à tabela ${tableName}`);
        }
    } catch (error) {
        console.error(`❌ Erro ao adicionar coluna ${columnName} à tabela ${tableName}:`, error.message);
        throw error;
    }
}

// Função para criar ou atualizar a tabela de migrações
async function createMigrationsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                version VARCHAR(20) NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT
            );
        `);
    } catch (error) {
        console.error('Erro ao criar tabela de migrações:', error.message);
        throw error;
    }
}

// Função para verificar se uma migração já foi aplicada
async function migrationApplied(version) {
    try {
        const result = await pool.query(
            'SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version = $1);',
            [version]
        );
        return result.rows[0].exists;
    } catch (error) {
        console.error('Erro ao verificar migração:', error.message);
        return false;
    }
}

// Função para registrar uma migração aplicada
async function registerMigration(version, description) {
    try {
        await pool.query(
            'INSERT INTO schema_migrations (version, description) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING;',
            [version, description]
        );
    } catch (error) {
        console.error('Erro ao registrar migração:', error.message);
        throw error;
    }
}

// Função para inicializar as tabelas
async function initDatabase() {
    try {
        console.log('🔄 Iniciando migração do banco de dados...');
        
        // Criar tabela de migrações primeiro
        await createMigrationsTable();
        
        // Migração 1.0.0 - Criação das tabelas base
        if (!(await migrationApplied('1.0.0'))) {
            console.log('🔄 Aplicando migração 1.0.0 - Criação das tabelas base...');
            
            // Criar tabela de caminhões
            await pool.query(`
                CREATE TABLE IF NOT EXISTS caminhoes (
                    id VARCHAR(50) PRIMARY KEY,
                    placa VARCHAR(20) NOT NULL UNIQUE,
                    modelo VARCHAR(100) NOT NULL,
                    ano INTEGER,
                    capacidade DECIMAL(10,2),
                    motorista VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Criar tabela de abastecimentos
            await pool.query(`
                CREATE TABLE IF NOT EXISTS abastecimentos (
                    id VARCHAR(50) PRIMARY KEY,
                    data DATE NOT NULL,
                    periodo_inicio DATE,
                    periodo_fim DATE,
                    caminhao_id VARCHAR(50) REFERENCES caminhoes(id) ON DELETE CASCADE,
                    motorista VARCHAR(100) NOT NULL,
                    km_inicial DECIMAL(10,2),
                    km_final DECIMAL(10,2),
                    litros DECIMAL(10,3) NOT NULL,
                    valor_litro DECIMAL(10,3) NOT NULL,
                    valor_total DECIMAL(10,2) NOT NULL,
                    posto VARCHAR(100),
                    observacoes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Criar índices para melhor performance
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_abastecimentos_caminhao_id ON abastecimentos(caminhao_id);
            `);
            
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_abastecimentos_data ON abastecimentos(data);
            `);
            
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_caminhoes_placa ON caminhoes(placa);
            `);

            await registerMigration('1.0.0', 'Criação das tabelas base (caminhoes e abastecimentos)');
            console.log('✅ Migração 1.0.0 aplicada com sucesso!');
        }

        // Migração 1.1.0 - Adição de colunas status e observações
        if (!(await migrationApplied('1.1.0'))) {
            console.log('🔄 Aplicando migração 1.1.0 - Colunas status e observações...');
            
            // Adicionar colunas à tabela de caminhões
            await addColumnIfNotExists('caminhoes', 'status', 'VARCHAR(20) DEFAULT \'ativo\'');
            await addColumnIfNotExists('caminhoes', 'observacoes', 'TEXT');
            
            // Criar trigger para atualizar updated_at automaticamente
            await pool.query(`
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql';
            `);
            
            await pool.query(`
                DROP TRIGGER IF EXISTS update_caminhoes_updated_at ON caminhoes;
                CREATE TRIGGER update_caminhoes_updated_at 
                    BEFORE UPDATE ON caminhoes 
                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            `);
            
            await pool.query(`
                DROP TRIGGER IF EXISTS update_abastecimentos_updated_at ON abastecimentos;
                CREATE TRIGGER update_abastecimentos_updated_at 
                    BEFORE UPDATE ON abastecimentos 
                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            `);

            await registerMigration('1.1.0', 'Adição de colunas status e observações, triggers de updated_at');
            console.log('✅ Migração 1.1.0 aplicada com sucesso!');
        }        // Migração 1.2.0 - Criação da tabela de despesas
        if (!(await migrationApplied('1.2.0'))) {
            console.log('🔄 Aplicando migração 1.2.0 - Criação da tabela de despesas...');
            
            // Criar tabela de despesas
            await pool.query(`
                CREATE TABLE IF NOT EXISTS despesas (
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

            // Criar índices para melhor performance
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data);
            `);
            
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_despesas_fornecedor ON despesas(fornecedor);
            `);
            
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON despesas(categoria);
            `);

            // Criar trigger para atualizar updated_at automaticamente
            await pool.query(`
                DROP TRIGGER IF EXISTS update_despesas_updated_at ON despesas;
                CREATE TRIGGER update_despesas_updated_at 
                    BEFORE UPDATE ON despesas 
                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            `);

            await registerMigration('1.2.0', 'Criação da tabela de despesas');
            console.log('✅ Migração 1.2.0 aplicada com sucesso!');
        }

        // Aqui você pode adicionar futuras migrações usando o sistema em migrations.js
        // Para executar migrações: npm run migrate

        console.log('✅ Banco de dados inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error.message);
        throw error;
    }
}

// Função para testar conexão
async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Conexão com PostgreSQL estabelecida:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Erro na conexão com PostgreSQL:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    initDatabase,
    testConnection,
    tableExists,
    columnExists,
    addColumnIfNotExists,
    migrationApplied,
    registerMigration,
    SCHEMA_VERSION
};
