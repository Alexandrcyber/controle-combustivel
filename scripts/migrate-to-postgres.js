// Script para migrar dados do localStorage para PostgreSQL
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const readline = require('readline');

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

// Interface para leitura de input do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function pergunta(questao) {
    return new Promise(resolve => {
        rl.question(questao, resposta => {
            resolve(resposta);
        });
    });
}

async function migrarDados() {
    console.log(`${colors.cyan}=== Ferramenta de Migração do LocalStorage para PostgreSQL ===${colors.reset}`);
    console.log(`${colors.yellow}Esta ferramenta irá migrar dados do localStorage para o banco PostgreSQL${colors.reset}`);
    
    // Carregar configurações
    let configObj;
    try {
        const configPath = path.join(__dirname, '../config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        configObj = JSON.parse(configData);
        console.log(`${colors.green}✓ Arquivo config.json carregado com sucesso${colors.reset}`);
    } catch (err) {
        console.error(`${colors.red}✗ Erro ao carregar configurações: ${err.message}${colors.reset}`);
        rl.close();
        process.exit(1);
    }
    
    // Perguntar qual banco usar
    let config;
    if (configObj.neon && configObj.neon.enabled) {
        const escolha = await pergunta(`${colors.cyan}Qual banco deseja usar para migração? (1: PostgreSQL Local, 2: Neon PostgreSQL) [1]: ${colors.reset}`);
        if (escolha === '2') {
            console.log(`${colors.cyan}Usando Neon PostgreSQL para migração${colors.reset}`);
            config = { ...configObj.neon };
            if (config.ssl) {
                config.ssl = {
                    rejectUnauthorized: true
                };
            }
        } else {
            console.log(`${colors.cyan}Usando PostgreSQL Local para migração${colors.reset}`);
            config = configObj.postgresql;
        }
    } else {
        console.log(`${colors.cyan}Usando PostgreSQL Local para migração${colors.reset}`);
        config = configObj.postgresql;
    }
    
    // Solicitar o arquivo JSON com os dados do localStorage
    console.log(`${colors.yellow}Você precisa fornecer um arquivo JSON com os dados do localStorage${colors.reset}`);
    console.log(`${colors.cyan}Siga estes passos:${colors.reset}`);
    console.log(`1. Abra o sistema no navegador (index.html)`);
    console.log(`2. Abra o console do navegador (F12)`);
    console.log(`3. Execute o seguinte comando no console:`);
    console.log(`   ${colors.yellow}copy(JSON.stringify({caminhoes: JSON.parse(localStorage.getItem('caminhoes') || '[]'), abastecimentos: JSON.parse(localStorage.getItem('abastecimentos') || '[]')}))${colors.reset}`);
    console.log(`4. Cole o resultado em um arquivo chamado 'localStorage_data.json'`);
    console.log(`5. Salve o arquivo na raiz do projeto`);
    
    const continuar = await pergunta(`${colors.cyan}Você já criou o arquivo? (s/n): ${colors.reset}`);
    if (continuar.toLowerCase() !== 's') {
        console.log(`${colors.yellow}Migração cancelada. Execute novamente quando tiver o arquivo pronto.${colors.reset}`);
        rl.close();
        return;
    }
    
    // Carregar dados do arquivo
    let dadosLocalStorage;
    try {
        const dadosPath = path.join(__dirname, '../localStorage_data.json');
        const dadosRaw = fs.readFileSync(dadosPath, 'utf8');
        dadosLocalStorage = JSON.parse(dadosRaw);
        console.log(`${colors.green}✓ Arquivo localStorage_data.json carregado com sucesso${colors.reset}`);
        
        // Validar estrutura dos dados
        if (!dadosLocalStorage.caminhoes || !Array.isArray(dadosLocalStorage.caminhoes)) {
            throw new Error('Formato inválido: Propriedade "caminhoes" ausente ou não é um array');
        }
        if (!dadosLocalStorage.abastecimentos || !Array.isArray(dadosLocalStorage.abastecimentos)) {
            throw new Error('Formato inválido: Propriedade "abastecimentos" ausente ou não é um array');
        }
        
        console.log(`${colors.cyan}Dados encontrados:${colors.reset}`);
        console.log(`- Caminhões: ${dadosLocalStorage.caminhoes.length}`);
        console.log(`- Abastecimentos: ${dadosLocalStorage.abastecimentos.length}`);
    } catch (err) {
        console.error(`${colors.red}✗ Erro ao carregar dados do localStorage: ${err.message}${colors.reset}`);
        rl.close();
        process.exit(1);
    }
    
    // Confirmar antes de prosseguir
    const confirmacao = await pergunta(`${colors.yellow}ATENÇÃO: Esta operação irá inserir os dados no banco PostgreSQL. Continuar? (s/n): ${colors.reset}`);
    if (confirmacao.toLowerCase() !== 's') {
        console.log(`${colors.yellow}Migração cancelada pelo usuário.${colors.reset}`);
        rl.close();
        return;
    }
    
    // Conectar ao banco de dados e realizar a migração
    const pool = new Pool(config);
    
    try {
        // Conectar ao banco
        const client = await pool.connect();
        console.log(`${colors.green}✓ Conexão com o banco de dados estabelecida${colors.reset}`);
        
        // Verificar se as tabelas existem, caso contrário criar
        try {
            await client.query('BEGIN');
            
            // Criar tabela caminhoes se não existir
            await client.query(`
                CREATE TABLE IF NOT EXISTS caminhoes (
                    id SERIAL PRIMARY KEY,
                    placa TEXT NOT NULL,
                    modelo TEXT,
                    ano INTEGER,
                    capacidade NUMERIC,
                    motorista TEXT
                )
            `);
            
            // Criar tabela abastecimentos se não existir
            await client.query(`
                CREATE TABLE IF NOT EXISTS abastecimentos (
                    id SERIAL PRIMARY KEY,
                    data DATE,
                    periodo_inicio DATE,
                    periodo_fim DATE,
                    caminhao_id INTEGER REFERENCES caminhoes(id),
                    motorista TEXT,
                    km_inicial NUMERIC,
                    km_final NUMERIC,
                    litros NUMERIC,
                    valor_litro NUMERIC,
                    valor_total NUMERIC,
                    posto TEXT,
                    observacoes TEXT
                )
            `);
            
            await client.query('COMMIT');
            console.log(`${colors.green}✓ Tabelas verificadas/criadas com sucesso${colors.reset}`);
        } catch (err) {
            await client.query('ROLLBACK');
            throw new Error(`Erro ao criar tabelas: ${err.message}`);
        }
        
        // Verificar se já existem dados nas tabelas
        const caminhaoCount = await client.query('SELECT COUNT(*) FROM caminhoes');
        const abastecimentoCount = await client.query('SELECT COUNT(*) FROM abastecimentos');
        
        if (parseInt(caminhaoCount.rows[0].count) > 0 || parseInt(abastecimentoCount.rows[0].count) > 0) {
            console.log(`${colors.yellow}⚠ Atenção: Já existem dados no banco de dados:${colors.reset}`);
            console.log(`- Caminhões: ${caminhaoCount.rows[0].count}`);
            console.log(`- Abastecimentos: ${abastecimentoCount.rows[0].count}`);
            
            const limparBanco = await pergunta(`${colors.yellow}Deseja limpar o banco antes de importar? (s/n): ${colors.reset}`);
            
            if (limparBanco.toLowerCase() === 's') {
                try {
                    await client.query('BEGIN');
                    await client.query('DELETE FROM abastecimentos');
                    await client.query('DELETE FROM caminhoes');
                    await client.query('ALTER SEQUENCE caminhoes_id_seq RESTART WITH 1');
                    await client.query('ALTER SEQUENCE abastecimentos_id_seq RESTART WITH 1');
                    await client.query('COMMIT');
                    console.log(`${colors.green}✓ Banco de dados limpo com sucesso${colors.reset}`);
                } catch (err) {
                    await client.query('ROLLBACK');
                    throw new Error(`Erro ao limpar banco de dados: ${err.message}`);
                }
            }
        }
        
        // Migrar caminhões
        console.log(`${colors.cyan}Migrando caminhões...${colors.reset}`);
        const caminhaoIdMap = new Map(); // Para mapear IDs antigos para novos
        
        try {
            await client.query('BEGIN');
            
            for (const caminhao of dadosLocalStorage.caminhoes) {
                const result = await client.query(`
                    INSERT INTO caminhoes (placa, modelo, ano, capacidade, motorista)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                `, [caminhao.placa, caminhao.modelo, caminhao.ano, caminhao.capacidade, caminhao.motorista]);
                
                // Mapear ID antigo para novo
                caminhaoIdMap.set(caminhao.id, result.rows[0].id);
            }
            
            await client.query('COMMIT');
            console.log(`${colors.green}✓ ${dadosLocalStorage.caminhoes.length} caminhões migrados com sucesso${colors.reset}`);
        } catch (err) {
            await client.query('ROLLBACK');
            throw new Error(`Erro ao migrar caminhões: ${err.message}`);
        }
        
        // Migrar abastecimentos
        console.log(`${colors.cyan}Migrando abastecimentos...${colors.reset}`);
        
        try {
            await client.query('BEGIN');
            
            for (const abastecimento of dadosLocalStorage.abastecimentos) {
                // Obter o novo ID do caminhão
                const novoCaminhaoId = caminhaoIdMap.get(abastecimento.caminhao_id);
                
                await client.query(`
                    INSERT INTO abastecimentos (
                        data, periodo_inicio, periodo_fim, caminhao_id, motorista,
                        km_inicial, km_final, litros, valor_litro, valor_total,
                        posto, observacoes
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `, [
                    abastecimento.data ? new Date(abastecimento.data) : null,
                    abastecimento.periodo_inicio ? new Date(abastecimento.periodo_inicio) : null,
                    abastecimento.periodo_fim ? new Date(abastecimento.periodo_fim) : null,
                    novoCaminhaoId,
                    abastecimento.motorista,
                    abastecimento.km_inicial,
                    abastecimento.km_final,
                    abastecimento.litros,
                    abastecimento.valor_litro,
                    abastecimento.valor_total,
                    abastecimento.posto,
                    abastecimento.observacoes
                ]);
            }
            
            await client.query('COMMIT');
            console.log(`${colors.green}✓ ${dadosLocalStorage.abastecimentos.length} abastecimentos migrados com sucesso${colors.reset}`);
        } catch (err) {
            await client.query('ROLLBACK');
            throw new Error(`Erro ao migrar abastecimentos: ${err.message}`);
        }
        
        console.log(`${colors.green}===========================================${colors.reset}`);
        console.log(`${colors.green}✓ Migração concluída com sucesso!${colors.reset}`);
        console.log(`${colors.green}===========================================${colors.reset}`);
        
        client.release();
    } catch (err) {
        console.error(`${colors.red}✗ Erro durante a migração: ${err.message}${colors.reset}`);
    } finally {
        rl.close();
        await pool.end();
    }
}

// Executar a migração
migrarDados().catch(err => {
    console.error(`${colors.red}Erro não tratado: ${err.message}${colors.reset}`);
    rl.close();
});
