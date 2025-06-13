// Script de debug para verificar os dados no servidor
// Executar este script para verificar o estado do banco

const { pool } = require('./database');

async function debugDatabase() {
    try {
        console.log('🔍 Verificando dados no banco...');
        
        // Verificar caminhões
        const caminhoesResult = await pool.query('SELECT * FROM caminhoes');
        console.log(`📦 Caminhões encontrados: ${caminhoesResult.rows.length}`);
        caminhoesResult.rows.forEach(c => {
            console.log(`  - ${c.placa} (${c.modelo}) - ID: ${c.id}`);
        });
        
        // Verificar abastecimentos
        const abastecimentosResult = await pool.query('SELECT * FROM abastecimentos');
        console.log(`⛽ Abastecimentos encontrados: ${abastecimentosResult.rows.length}`);
        abastecimentosResult.rows.forEach(a => {
            console.log(`  - Data: ${a.data}, Caminhão: ${a.caminhao_id}, Litros: ${a.litros}`);
        });
        
        // Verificar despesas
        const despesasResult = await pool.query('SELECT * FROM despesas');
        console.log(`💰 Despesas encontradas: ${despesasResult.rows.length}`);
        despesasResult.rows.forEach(d => {
            console.log(`  - Data: ${d.data}, Valor: ${d.valor}, Categoria: ${d.categoria}`);
        });
        
        // Verificar estrutura das tabelas
        console.log('\n📊 Estrutura da tabela abastecimentos:');
        const estruturaResult = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'abastecimentos' 
            ORDER BY ordinal_position
        `);
        estruturaResult.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar banco:', error);
    } finally {
        await pool.end();
    }
}

debugDatabase();
