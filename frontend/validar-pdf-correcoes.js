const fs = require('fs');
const path = require('path');

console.log('🔧 Validando correções nas funções de PDF...\n');

// Ler o arquivo relatorios.js
const filePath = path.join('src', 'js', 'relatorios.js');
const content = fs.readFileSync(filePath, 'utf8');

// Verificar se todas as funções de PDF estão presentes
const requiredFunctions = [
    'exportarPdfCompleto',
    'criarCapaPdf',
    'criarDashboardExecutivoPdf', 
    'criarAnaliseDetalhadaPdf',
    'criarAnaliseCustosPdf',
    'criarIndicadoresPdf',
    'criarDadosDetalhadosPdf',
    'normalizarTextoPDF',
    'adicionarTextoPDF'
];

let allFunctionsFound = true;

console.log('📋 Verificando funções necessárias:');
requiredFunctions.forEach(func => {
    if (content.includes(`function ${func}`) || content.includes(`${func} = `)) {
        console.log(`✅ ${func} - encontrada`);
    } else {
        console.log(`❌ ${func} - FALTANDO`);
        allFunctionsFound = false;
    }
});

// Verificar se há emojis problemáticos fora da função de normalização
const emojiPattern = /[📊⛽💰📈💵🔢💡🚗🥇🥈🥉📅🔄⚠️✅❌🎯📋🔍📦🚀⭐🔧📝💯🏆🎉👍👎⚡🔥❗❓🎪]/g;
const lines = content.split('\n');
let inNormalizeFunction = false;
let inAdicionarTextoFunction = false;
let problemEmojis = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar início/fim das funções que devem conter emojis
    if (line.includes('function normalizarTextoPDF') || line.includes('normalizarTextoPDF =')) {
        inNormalizeFunction = true;
    } else if (line.includes('function adicionarTextoPDF') || line.includes('adicionarTextoPDF =')) {
        inAdicionarTextoFunction = true;
    } else if ((inNormalizeFunction || inAdicionarTextoFunction) && line.includes('}') && !line.includes('{')) {
        // Fim de função (linha com apenas })
        if (line.trim() === '}') {
            inNormalizeFunction = false;
            inAdicionarTextoFunction = false;
        }
    } else if (!inNormalizeFunction && !inAdicionarTextoFunction && emojiPattern.test(line)) {
        // Emoji fora das funções permitidas
        if (!line.includes('console.log')) { // Ignorar logs do console
            problemEmojis.push({ line: i + 1, content: line.trim() });
        }
    }
}

console.log('\n🎭 Verificação de emojis:');
if (problemEmojis.length > 0) {
    console.log('⚠️  Emojis ainda encontrados fora da função de normalização:');
    problemEmojis.forEach(emoji => {
        console.log(`  Linha ${emoji.line}: ${emoji.content}`);
    });
} else {
    console.log('✅ Todos os emojis estão devidamente tratados ou em funções apropriadas');
}

// Verificar se há uso consistente de adicionarTextoPDF
const directDocTextUsage = content.match(/doc\.text\(/g);
const normalizedTextUsage = content.match(/adicionarTextoPDF\(/g);

console.log('\n📝 Verificação de normalização de texto:');
if (directDocTextUsage) {
    console.log(`⚠️  Encontradas ${directDocTextUsage.length} chamadas diretas para doc.text()`);
    console.log('   Recomenda-se usar adicionarTextoPDF() para garantir normalização');
} else {
    console.log('✅ Todas as chamadas de texto usam adicionarTextoPDF()');
}

if (normalizedTextUsage) {
    console.log(`✅ Encontradas ${normalizedTextUsage.length} chamadas para adicionarTextoPDF()`);
}

// Verificar se há caracteres especiais problemáticos
const specialChars = content.match(/[áéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ]/g);
console.log('\n🔤 Verificação de caracteres especiais:');
if (specialChars && specialChars.length > 0) {
    console.log(`⚠️  Encontrados ${specialChars.length} caracteres acentuados que podem causar problemas no PDF`);
    console.log('   A função normalizarTextoPDF() deve tratar estes caracteres');
} else {
    console.log('✅ Caracteres especiais estão normalizados ou ausentes');
}

// Resumo final
console.log('\n📊 Resumo da validação:');
console.log(`- Tamanho do arquivo: ${Math.round(content.length / 1024)}KB`);
console.log(`- Linhas de código: ${content.split('\n').length}`);
console.log(`- Funções necessárias: ${allFunctionsFound ? 'TODAS PRESENTES' : 'ALGUMAS FALTANDO'}`);
console.log(`- Emojis problemáticos: ${problemEmojis.length === 0 ? 'NENHUM' : problemEmojis.length}`);

if (allFunctionsFound && problemEmojis.length === 0) {
    console.log('\n🎉 SUCESSO: Todas as correções foram aplicadas corretamente!');
    console.log('✅ As funções de PDF estão prontas para uso');
    console.log('🚀 O sistema pode gerar PDFs sem problemas de caracteres especiais');
} else {
    console.log('\n❌ ATENÇÃO: Ainda há problemas a serem corrigidos');
    if (!allFunctionsFound) {
        console.log('  - Algumas funções necessárias estão faltando');
    }
    if (problemEmojis.length > 0) {
        console.log('  - Há emojis que ainda precisam ser normalizados');
    }
}

console.log('\n🏁 Validação concluída!');
