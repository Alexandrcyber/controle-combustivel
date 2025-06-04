// Script para testar a conexão com o PostgreSQL (local e Neon)
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Cores para saída no console
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

async function testConnection() {
    console.log(`${colors.cyan}Testando conexão com o PostgreSQL...${colors.reset}`);

    // Carregar configurações
    let configObj;
    try {
        const configPath = path.join(__dirname, '../config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        configObj = JSON.parse(configData);
        console.log(`${colors.green}✓ Arquivo config.json carregado com sucesso${colors.reset}`);
    } catch (err) {
        console.error(`${colors.red}✗ Erro ao carregar configurações: ${err.message}${colors.reset}`);
        process.exit(1);
    }

    // Testar PostgreSQL local
    try {
        console.log(`\n${colors.cyan}Testando PostgreSQL Local:${colors.reset}`);
        console.log(`Host: ${configObj.postgresql.host}`);
        console.log(`Database: ${configObj.postgresql.database}`);
        console.log(`User: ${configObj.postgresql.user}`);
        console.log(`Port: ${configObj.postgresql.port}`);
        
        const localPool = new Pool(configObj.postgresql);
        const localClient = await localPool.connect();
        
        console.log(`${colors.green}✓ Conexão com PostgreSQL local estabelecida com sucesso!${colors.reset}`);
        
        // Verificar se o banco existe
        const dbResult = await localClient.query(`
            SELECT EXISTS (
                SELECT FROM pg_database WHERE datname = $1
            );
        `, [configObj.postgresql.database]);
        
        if (dbResult.rows[0].exists) {
            console.log(`${colors.green}✓ Banco de dados '${configObj.postgresql.database}' existe${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠ Banco de dados '${configObj.postgresql.database}' não existe${colors.reset}`);
            console.log(`${colors.cyan}ℹ Execute o seguinte comando para criar o banco de dados:${colors.reset}`);
            console.log(`CREATE DATABASE ${configObj.postgresql.database};`);
        }
        
        // Verificar tabelas
        if (dbResult.rows[0].exists) {
            try {
                const tablesResult = await localClient.query(`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    AND table_name IN ('caminhoes', 'abastecimentos');
                `);
                
                const tables = tablesResult.rows.map(row => row.table_name);
                
                if (tables.includes('caminhoes') && tables.includes('abastecimentos')) {
                    console.log(`${colors.green}✓ Tabelas 'caminhoes' e 'abastecimentos' existem${colors.reset}`);
                } else {
                    console.log(`${colors.yellow}⚠ Algumas tabelas necessárias não existem:${colors.reset}`);
                    if (!tables.includes('caminhoes')) console.log(`  - Tabela 'caminhoes' não existe`);
                    if (!tables.includes('abastecimentos')) console.log(`  - Tabela 'abastecimentos' não existe`);
                    console.log(`${colors.cyan}ℹ As tabelas serão criadas automaticamente ao iniciar o servidor${colors.reset}`);
                }
            } catch (err) {
                console.log(`${colors.yellow}⚠ Não foi possível verificar as tabelas: ${err.message}${colors.reset}`);
            }
        }
        
        localClient.release();
    } catch (err) {
        console.error(`${colors.red}✗ Erro ao conectar ao PostgreSQL local: ${err.message}${colors.reset}`);
    }

    // Testar Neon PostgreSQL (se configurado)
    if (configObj.neon && configObj.neon.enabled) {
        try {
            console.log(`\n${colors.cyan}Testando Neon PostgreSQL:${colors.reset}`);
            console.log(`Host: ${configObj.neon.host}`);
            console.log(`Database: ${configObj.neon.database}`);
            console.log(`User: ${configObj.neon.user}`);
            console.log(`SSL: ${configObj.neon.ssl ? 'Enabled' : 'Disabled'}`);
            
            // Configuração do SSL para o Neon
            const neonConfig = { ...configObj.neon };
            if (neonConfig.ssl) {
                neonConfig.ssl = {
                    rejectUnauthorized: true
                };
            }
            
            const neonPool = new Pool(neonConfig);
            const neonClient = await neonPool.connect();
            
            console.log(`${colors.green}✓ Conexão com Neon PostgreSQL estabelecida com sucesso!${colors.reset}`);
            
            // Verificar tabelas
            try {
                const tablesResult = await neonClient.query(`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    AND table_name IN ('caminhoes', 'abastecimentos');
                `);
                
                const tables = tablesResult.rows.map(row => row.table_name);
                
                if (tables.includes('caminhoes') && tables.includes('abastecimentos')) {
                    console.log(`${colors.green}✓ Tabelas 'caminhoes' e 'abastecimentos' existem${colors.reset}`);
                } else {
                    console.log(`${colors.yellow}⚠ Algumas tabelas necessárias não existem:${colors.reset}`);
                    if (!tables.includes('caminhoes')) console.log(`  - Tabela 'caminhoes' não existe`);
                    if (!tables.includes('abastecimentos')) console.log(`  - Tabela 'abastecimentos' não existe`);
                    console.log(`${colors.cyan}ℹ As tabelas serão criadas automaticamente ao iniciar o servidor${colors.reset}`);
                }
            } catch (err) {
                console.log(`${colors.yellow}⚠ Não foi possível verificar as tabelas: ${err.message}${colors.reset}`);
            }
            
            neonClient.release();
        } catch (err) {
            console.error(`${colors.red}✗ Erro ao conectar ao Neon PostgreSQL: ${err.message}${colors.reset}`);
        }
    } else {
        console.log(`\n${colors.yellow}ℹ Neon PostgreSQL não está configurado ou habilitado${colors.reset}`);
    }
}

// Executar o teste
testConnection().catch(err => {
    console.error(`${colors.red}Erro não tratado: ${err.message}${colors.reset}`);
});
