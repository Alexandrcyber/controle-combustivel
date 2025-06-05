#!/usr/bin/env node

/**
 * CLI para gerenciamento de migrações do banco de dados
 * 
 * Uso:
 *   node cli-migrate.js migrate        # Executa todas as migrações pendentes
 *   node cli-migrate.js status         # Mostra o status das migrações
 *   node cli-migrate.js rollback <version> # Reverte uma migração específica
 *   node cli-migrate.js test           # Testa a conexão com o banco
 */

const { testConnection, initDatabase } = require('./database');
const { runMigrations, migrationStatus, rollbackMigration } = require('./migrations');

// Função principal
async function main() {
    const command = process.argv[2];
    const version = process.argv[3];

    console.log('🗃️  CLI de Migrações - Controle de Combustível');
    console.log('==============================================\n');

    try {
        // Testar conexão primeiro
        const connected = await testConnection();
        if (!connected) {
            console.error('❌ Não foi possível conectar ao banco de dados.');
            console.error('Verifique as configurações no arquivo .env');
            process.exit(1);
        }

        switch (command) {
            case 'migrate':
                console.log('🚀 Executando migrações...\n');
                await initDatabase(); // Garante que as tabelas base existam
                await runMigrations();
                break;

            case 'status':
                await migrationStatus();
                break;

            case 'rollback':
                if (!version) {
                    console.error('❌ É necessário especificar a versão para rollback');
                    console.error('Exemplo: node cli-migrate.js rollback 1.2.0');
                    process.exit(1);
                }
                await rollbackMigration(version);
                break;

            case 'test':
                console.log('✅ Conexão com o banco de dados testada com sucesso!');
                break;

            case 'help':
            case '--help':
            case '-h':
                showHelp();
                break;

            default:
                console.error('❌ Comando não reconhecido');
                showHelp();
                process.exit(1);
        }

        console.log('\n🎉 Operação concluída com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Erro durante a execução:', error.message);
        process.exit(1);
    }
}

function showHelp() {
    console.log(`
Comandos disponíveis:

  migrate              Executa todas as migrações pendentes
  status               Mostra o status de todas as migrações
  rollback <version>   Reverte uma migração específica (apenas remove o registro)
  test                 Testa a conexão com o banco de dados
  help                 Mostra esta ajuda

Exemplos:
  node cli-migrate.js migrate
  node cli-migrate.js status
  node cli-migrate.js rollback 1.2.0
  node cli-migrate.js test

Configuração:
  Certifique-se de que o arquivo .env está configurado corretamente com:
  - DB_HOST
  - DB_PORT
  - DB_NAME
  - DB_USER
  - DB_PASSWORD
  - DB_SSL
`);
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = { main };
