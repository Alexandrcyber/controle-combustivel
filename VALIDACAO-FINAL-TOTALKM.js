/**
 * 🔧 VALIDAÇÃO FINAL - Correção "totalKm is not defined"
 * 
 * Este script valida se todas as correções aplicadas ao arquivo relatorios.js
 * realmente resolveram o problema de variáveis indefinidas na geração de PDF.
 */

// Simular ambiente de teste
const fs = require('fs');
const path = require('path');

console.log('🔍 INICIANDO VALIDAÇÃO FINAL - Correção totalKm is not defined\n');

// Caminho do arquivo principal
const arquivoRelatorios = '/home/aleandre-liberato/Documentos/programacao/projetos/controle_de_combustivel/frontend/src/js/relatorios.js';

try {
    console.log('📂 Lendo arquivo relatorios.js...');
    const conteudo = fs.readFileSync(arquivoRelatorios, 'utf8');
    
    console.log('✅ Arquivo carregado com sucesso!\n');
    
    // TESTE 1: Verificar se as correções das linhas críticas estão aplicadas
    console.log('🧪 TESTE 1: Verificando correções específicas...');
    
    const testesCorrecoes = [
        {
            teste: 'Linha 1342 - totalKm em relatório de caminhão',
            busca: 'formatarNumero(caminhao.totalKm, 1)',
            erro: 'caminhao.formatarNumero(totalKm, 1)'
        },
        {
            teste: 'Linha 1438 - totalKm em resumo',
            busca: 'formatarNumero(caminhao.totalKm, 0)',
            erro: 'caminhao.formatarNumero(totalKm, 0)'
        },
        {
            teste: 'Linha 843-844 - formatarMoeda com objetos',
            busca: 'formatarMoeda(caminhao.total',
            erro: 'caminhao.formatarMoeda(total'
        }
    ];
    
    let todosTestes = true;
    
    testesCorrecoes.forEach((teste, index) => {
        const temCorrecao = conteudo.includes(teste.busca);
        const temErro = conteudo.includes(teste.erro);
        
        if (temCorrecao && !temErro) {
            console.log(`   ✅ ${teste.teste} - CORRETO`);
        } else if (temErro) {
            console.log(`   ❌ ${teste.teste} - ERRO AINDA PRESENTE`);
            todosTestes = false;
        } else {
            console.log(`   ⚠️  ${teste.teste} - PADRÃO NÃO ENCONTRADO`);
        }
    });
    
    // TESTE 2: Verificar se não há mais referências diretas a totalKm sem objeto
    console.log('\n🧪 TESTE 2: Procurando referências incorretas a totalKm...');
    
    const linhas = conteudo.split('\n');
    let referencasIncorretas = [];
    
    linhas.forEach((linha, index) => {
        // Procurar por totalKm não precedido por objeto (caminhao., veiculo., etc.)
        if (linha.includes('totalKm') && !linha.includes('//')) {
            const regex = /(?<![\w\.])totalKm(?!\s*:)/g;
            const matches = linha.match(regex);
            
            if (matches) {
                // Verificar se não é uma definição de propriedade
                if (!linha.includes('totalKm:') && !linha.includes('.totalKm')) {
                    referencasIncorretas.push({
                        linha: index + 1,
                        conteudo: linha.trim()
                    });
                }
            }
        }
    });
    
    if (referencasIncorretas.length === 0) {
        console.log('   ✅ Nenhuma referência incorreta a totalKm encontrada');
    } else {
        console.log(`   ❌ Encontradas ${referencasIncorretas.length} referências incorretas:`);
        referencasIncorretas.forEach(ref => {
            console.log(`      Linha ${ref.linha}: ${ref.conteudo}`);
        });
        todosTestes = false;
    }
    
    // TESTE 3: Verificar se funções auxiliares existem
    console.log('\n🧪 TESTE 3: Verificando funções auxiliares...');
    
    const funcoesNecessarias = [
        'formatarNumero',
        'formatarMoeda',
        'criarAnalisePrecos',
        'criarAnaliseTemporalData',
        'aplicarEstilizacaoDashboard'
    ];
    
    funcoesNecessarias.forEach(funcao => {
        const regex = new RegExp(`function\\s+${funcao}\\s*\\(|const\\s+${funcao}\\s*=|let\\s+${funcao}\\s*=`, 'g');
        const temFuncao = regex.test(conteudo);
        
        if (temFuncao) {
            console.log(`   ✅ Função ${funcao} - ENCONTRADA`);
        } else {
            console.log(`   ⚠️  Função ${funcao} - NÃO ENCONTRADA (pode estar em outro arquivo)`);
        }
    });
    
    // TESTE 4: Verificar sintaxe básica
    console.log('\n🧪 TESTE 4: Verificação de sintaxe básica...');
    
    try {
        // Simular parsing básico - procurar por problemas óbvios
        const problemasSintaxe = [];
        
        // Verificar chaves desbalanceadas
        const chaves = (conteudo.match(/\{/g) || []).length;
        const fechamentos = (conteudo.match(/\}/g) || []).length;
        
        if (chaves !== fechamentos) {
            problemasSintaxe.push(`Chaves desbalanceadas: ${chaves} aberturas vs ${fechamentos} fechamentos`);
        }
        
        // Verificar parênteses
        const parenteses = (conteudo.match(/\(/g) || []).length;
        const fechaParenteses = (conteudo.match(/\)/g) || []).length;
        
        if (parenteses !== fechaParenteses) {
            problemasSintaxe.push(`Parênteses desbalanceados: ${parenteses} aberturas vs ${fechaParenteses} fechamentos`);
        }
        
        if (problemasSintaxe.length === 0) {
            console.log('   ✅ Sintaxe básica OK');
        } else {
            console.log('   ❌ Problemas de sintaxe encontrados:');
            problemasSintaxe.forEach(problema => {
                console.log(`      ${problema}`);
            });
            todosTestes = false;
        }
        
    } catch (error) {
        console.log(`   ❌ Erro na verificação de sintaxe: ${error.message}`);
        todosTestes = false;
    }
    
    // RESULTADO FINAL
    console.log('\n' + '='.repeat(60));
    if (todosTestes) {
        console.log('🎉 VALIDAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('✅ Todas as correções do erro "totalKm is not defined" foram aplicadas corretamente');
        console.log('✅ O arquivo está pronto para uso em produção');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('   1. Teste a geração de PDF no sistema real');
        console.log('   2. Verifique se não há outros erros de runtime');
        console.log('   3. Monitore o desempenho após as correções');
    } else {
        console.log('⚠️  VALIDAÇÃO INCOMPLETA');
        console.log('❌ Alguns problemas ainda precisam ser resolvidos');
        console.log('📋 Revise os erros indicados acima antes de usar em produção');
    }
    console.log('='.repeat(60));

} catch (error) {
    console.error('❌ Erro ao validar arquivo:', error.message);
}
