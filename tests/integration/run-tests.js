/**
 * Runner para testes de integração
 * Executa testes que verificam a comunicação entre componentes
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const testsDir = path.join(__dirname, '..', 'integration');

function getTestFiles() {
    if (!fs.existsSync(testsDir)) {
        console.log('❌ Diretório de testes de integração não encontrado:', testsDir);
        return [];
    }
    
    return fs.readdirSync(testsDir)
        .filter(file => file.endsWith('.js'))
        .map(file => path.join(testsDir, file));
}

async function runIntegrationTest(testFile) {
    return new Promise((resolve, reject) => {
        console.log(`🔗 Executando: ${path.basename(testFile)}`);
        
        const child = spawn('node', [testFile], {
            stdio: 'pipe',
            cwd: path.dirname(testFile),
            env: { ...process.env, NODE_ENV: 'test' }
        });
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${path.basename(testFile)} - Integração OK`);
                resolve({ file: testFile, success: true, output });
            } else {
                console.log(`❌ ${path.basename(testFile)} - Integração Falhou`);
                console.log(`   Erro: ${errorOutput}`);
                resolve({ file: testFile, success: false, output, error: errorOutput });
            }
        });
        
        child.on('error', (error) => {
            console.log(`❌ ${path.basename(testFile)} - Erro ao executar`);
            resolve({ file: testFile, success: false, error: error.message });
        });
    });
}

async function main() {
    console.log('🔗 Executando Testes de Integração\n');
    
    const testFiles = getTestFiles();
    
    if (testFiles.length === 0) {
        console.log('📋 Nenhum teste de integração encontrado');
        console.log('💡 Crie arquivos .js em tests/integration/ para testes de integração');
        return;
    }
    
    console.log(`📊 Encontrados ${testFiles.length} teste(s) de integração\n`);
    
    const results = [];
    
    for (const testFile of testFiles) {
        const result = await runIntegrationTest(testFile);
        results.push(result);
    }
    
    // Relatório final
    console.log('\n📊 Relatório de Integração:');
    console.log('============================');
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Passaram: ${passed}`);
    console.log(`❌ Falharam: ${failed}`);
    console.log(`📊 Total: ${results.length}`);
    
    if (failed > 0) {
        console.log('\n❌ Testes que falharam:');
        results
            .filter(r => !r.success)
            .forEach(r => console.log(`   - ${path.basename(r.file)}`));
        
        process.exit(1);
    } else {
        console.log('\n🎉 Todos os testes de integração passaram!');
    }
}

main().catch(error => {
    console.error('❌ Erro ao executar testes de integração:', error);
    process.exit(1);
});
