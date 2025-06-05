const { pool, addColumnIfNotExists, testConnection } = require('./database');

async function fixMissingColumns() {
    try {
        console.log('🔄 Verificando e corrigindo colunas faltantes...');
        
        // Testar conexão
        await testConnection();
        
        // Adicionar colunas faltantes na tabela caminhões
        await addColumnIfNotExists('caminhoes', 'status', 'VARCHAR(20) DEFAULT \'ativo\'');
        await addColumnIfNotExists('caminhoes', 'observacoes', 'TEXT');
        
        console.log('✅ Colunas verificadas e adicionadas se necessário!');
        
        // Verificar estrutura final
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'caminhoes'
            ORDER BY ordinal_position;
        `);
        
        console.log('\n📋 Estrutura atual da tabela caminhões:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao corrigir colunas:', error.message);
    } finally {
        await pool.end();
    }
}

fixMissingColumns();
