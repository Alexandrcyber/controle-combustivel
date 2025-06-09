const { pool } = require('./database');

async function createDespesasTable() {
    try {
        console.log('🔄 Criando tabela de despesas...');
        
        // Verificar se a tabela já existe
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'despesas'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('✅ Tabela despesas já existe!');
            return;
        }
        
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
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        
        await pool.query(`
            DROP TRIGGER IF EXISTS update_despesas_updated_at ON despesas;
            CREATE TRIGGER update_despesas_updated_at 
                BEFORE UPDATE ON despesas 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
        
        console.log('✅ Tabela despesas criada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao criar tabela despesas:', error);
    } finally {
        process.exit(0);
    }
}

createDespesasTable();
