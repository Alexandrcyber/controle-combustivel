// Script para forçar re-execução da migração 1.2.0
const { pool, initDatabase } = require('./database');

async function forceMigration120() {
    try {
        console.log('🔄 Forçando re-execução da migração 1.2.0...');
        
        // Conectar ao banco
        await pool.query('SELECT NOW()');
        console.log('✅ Conectado ao banco!');
        
        // Remover registro da migração 1.2.0
        await pool.query('DELETE FROM schema_migrations WHERE version = $1', ['1.2.0']);
        console.log('🗑️  Registro da migração 1.2.0 removido');
        
        // Verificar se a tabela existe
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'despesas'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('⚠️  Tabela despesas existe, removendo para recriar...');
            await pool.query('DROP TABLE IF EXISTS despesas CASCADE');
            console.log('🗑️  Tabela despesas removida');
        }
        
        // Criar tabela de despesas diretamente
        console.log('🔄 Criando tabela despesas...');
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
        
        // Criar índices
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data);
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_despesas_fornecedor ON despesas(fornecedor);
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON despesas(categoria);
        `);

        // Criar trigger (função já deve existir da migração 1.1.0)
        await pool.query(`
            DROP TRIGGER IF EXISTS update_despesas_updated_at ON despesas;
            CREATE TRIGGER update_despesas_updated_at 
                BEFORE UPDATE ON despesas 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
        
        // Registrar migração como aplicada
        await pool.query(
            'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
            ['1.2.0', 'Criação da tabela de despesas']
        );
        
        console.log('✅ Migração 1.2.0 aplicada com sucesso!');
        
        // Testar a tabela
        const count = await pool.query('SELECT COUNT(*) FROM despesas');
        console.log(`📊 Tabela despesas criada com ${count.rows[0].count} registros`);
        
    } catch (error) {
        console.error('❌ Erro ao aplicar migração:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

forceMigration120();
