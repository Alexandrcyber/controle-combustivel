const { pool, migrationApplied, registerMigration, addColumnIfNotExists } = require('./database');

// Array com todas as migrações do sistema
const migrations = [
    {
        version: '1.0.0',
        description: 'Criação das tabelas base (caminhoes e abastecimentos)',
        up: async () => {
            // Esta migração já está implementada no database.js
            // Mantida aqui apenas para referência
        }
    },
    {
        version: '1.1.0', 
        description: 'Adição de colunas status e observações, triggers de updated_at',
        up: async () => {
            // Esta migração já está implementada no database.js
            // Mantida aqui apenas para referência
        }
    },
    {
        version: '1.2.0',
        description: 'Adição de campos para controle de manutenção',
        up: async () => {
            console.log('🔄 Aplicando migração 1.2.0 - Campos de manutenção...');
            
            // Adicionar campos de manutenção aos caminhões
            await addColumnIfNotExists('caminhoes', 'ultima_manutencao', 'DATE');
            await addColumnIfNotExists('caminhoes', 'proxima_manutencao', 'DATE');
            await addColumnIfNotExists('caminhoes', 'km_ultima_manutencao', 'DECIMAL(10,2)');
            await addColumnIfNotExists('caminhoes', 'intervalo_manutencao_km', 'DECIMAL(10,2) DEFAULT 10000');
            
            // Criar tabela de histórico de manutenções
            await pool.query(`
                CREATE TABLE IF NOT EXISTS manutencoes (
                    id VARCHAR(50) PRIMARY KEY,
                    caminhao_id VARCHAR(50) REFERENCES caminhoes(id) ON DELETE CASCADE,
                    data_manutencao DATE NOT NULL,
                    tipo VARCHAR(50) NOT NULL,
                    descricao TEXT,
                    km_realizacao DECIMAL(10,2),
                    valor DECIMAL(10,2),
                    oficina VARCHAR(100),
                    observacoes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            // Criar índice para a nova tabela
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_manutencoes_caminhao_id ON manutencoes(caminhao_id);
            `);
            
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_manutencoes_data ON manutencoes(data_manutencao);
            `);
        }
    },
    {
        version: '1.3.0',
        description: 'Adição de campos para controle de documentação',
        up: async () => {
            console.log('🔄 Aplicando migração 1.3.0 - Campos de documentação...');
            
            // Adicionar campos de documentação aos caminhões
            await addColumnIfNotExists('caminhoes', 'numero_chassi', 'VARCHAR(50) UNIQUE');
            await addColumnIfNotExists('caminhoes', 'numero_renavam', 'VARCHAR(20) UNIQUE');
            await addColumnIfNotExists('caminhoes', 'vencimento_licenciamento', 'DATE');
            await addColumnIfNotExists('caminhoes', 'vencimento_seguro', 'DATE');
            await addColumnIfNotExists('caminhoes', 'numero_apolice_seguro', 'VARCHAR(50)');
            
            // Criar tabela de documentos
            await pool.query(`
                CREATE TABLE IF NOT EXISTS documentos (
                    id VARCHAR(50) PRIMARY KEY,
                    caminhao_id VARCHAR(50) REFERENCES caminhoes(id) ON DELETE CASCADE,
                    tipo_documento VARCHAR(50) NOT NULL,
                    numero_documento VARCHAR(100),
                    data_emissao DATE,
                    data_vencimento DATE,
                    orgao_emissor VARCHAR(100),
                    observacoes TEXT,
                    arquivo_path VARCHAR(500),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            // Criar índices para a nova tabela
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_documentos_caminhao_id ON documentos(caminhao_id);
            `);
            
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_documentos_vencimento ON documentos(data_vencimento);
            `);
        }
    }
];

// Função para aplicar todas as migrações pendentes
async function runMigrations() {
    try {
        console.log('🔄 Verificando migrações pendentes...');
        
        for (const migration of migrations) {
            if (!(await migrationApplied(migration.version))) {
                console.log(`🔄 Aplicando migração ${migration.version} - ${migration.description}...`);
                
                // Executar a migração
                await migration.up();
                
                // Registrar que a migração foi aplicada
                await registerMigration(migration.version, migration.description);
                
                console.log(`✅ Migração ${migration.version} aplicada com sucesso!`);
            } else {
                console.log(`⏭️  Migração ${migration.version} já aplicada`);
            }
        }
        
        console.log('✅ Todas as migrações foram verificadas!');
    } catch (error) {
        console.error('❌ Erro ao executar migrações:', error.message);
        throw error;
    }
}

// Função para verificar o status das migrações
async function migrationStatus() {
    try {
        console.log('\n📊 Status das Migrações:');
        console.log('========================');
        
        for (const migration of migrations) {
            const applied = await migrationApplied(migration.version);
            const status = applied ? '✅ APLICADA' : '⏳ PENDENTE';
            console.log(`${migration.version} - ${migration.description}: ${status}`);
        }
        
        console.log('========================\n');
    } catch (error) {
        console.error('❌ Erro ao verificar status das migrações:', error.message);
    }
}

// Função para reverter migração (rollback) - para casos especiais
async function rollbackMigration(version) {
    try {
        console.log(`🔄 Revertendo migração ${version}...`);
        
        // Remover o registro da migração
        await pool.query('DELETE FROM schema_migrations WHERE version = $1', [version]);
        
        console.log(`✅ Migração ${version} revertida (registro removido)`);
        console.log('⚠️  ATENÇÃO: O rollback apenas remove o registro. As mudanças no schema devem ser revertidas manualmente se necessário.');
    } catch (error) {
        console.error(`❌ Erro ao reverter migração ${version}:`, error.message);
        throw error;
    }
}

module.exports = {
    migrations,
    runMigrations,
    migrationStatus,
    rollbackMigration
};
