/**
 * Script para instalar dependências em todo o projeto
 * Instala dependências na raiz, backend e frontend
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runCommand(command, args, cwd, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n🔄 ${description}...`);
        console.log(`📁 Diretório: ${cwd}`);
        console.log(`⚡ Comando: ${command} ${args.join(' ')}`);
        
        const child = spawn(command, args, {
            cwd,
            stdio: 'inherit',
            shell: true
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${description} - Concluído`);
                resolve();
            } else {
                console.log(`❌ ${description} - Falhou (código: ${code})`);
                reject(new Error(`Falha ao executar: ${command} ${args.join(' ')}`));
            }
        });
        
        child.on('error', (error) => {
            console.log(`❌ ${description} - Erro: ${error.message}`);
            reject(error);
        });
    });
}

function checkPackageJson(dir) {
    const packagePath = path.join(dir, 'package.json');
    return fs.existsSync(packagePath);
}

async function main() {
    console.log('📦 Instalando dependências do projeto...\n');
    
    const rootDir = path.join(__dirname, '..');
    const backendDir = path.join(rootDir, 'backend');
    const frontendDir = path.join(rootDir, 'frontend');
    
    try {
        // Instalar dependências da raiz
        if (checkPackageJson(rootDir)) {
            await runCommand('npm', ['install'], rootDir, 'Instalando dependências da raiz');
        } else {
            console.log('⚠️ package.json não encontrado na raiz, pulando...');
        }
        
        // Instalar dependências do backend
        if (checkPackageJson(backendDir)) {
            await runCommand('npm', ['install'], backendDir, 'Instalando dependências do backend');
        } else {
            console.log('⚠️ package.json não encontrado no backend, pulando...');
        }
        
        // Instalar dependências do frontend
        if (checkPackageJson(frontendDir)) {
            await runCommand('npm', ['install'], frontendDir, 'Instalando dependências do frontend');
        } else {
            console.log('⚠️ package.json não encontrado no frontend, pulando...');
        }
        
        console.log('\n🎉 Todas as dependências foram instaladas com sucesso!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Execute: npm run dev');
        console.log('2. Acesse: http://localhost:3000');
        
    } catch (error) {
        console.error('\n❌ Erro durante a instalação:', error.message);
        console.log('\n💡 Dicas para resolver:');
        console.log('- Verifique se o Node.js e NPM estão instalados');
        console.log('- Verifique sua conexão com a internet');
        console.log('- Tente executar: npm cache clean --force');
        process.exit(1);
    }
}

main();
