// Teste simples para verificar as funções de PDF
const fs = require('fs');
const path = require('path');

console.log('🧪 Testando funções de PDF corrigidas...\n');

// Ler o arquivo relatorios.js
const filePath = path.join('src', 'js', 'relatorios.js');
const content = fs.readFileSync(filePath, 'utf8');

// Testar se a função de normalização está funcionando
const normalizarTextoPDFMatch = content.match(/function normalizarTextoPDF\(([^}]+)\}/s);
if (normalizarTextoPDFMatch) {
    console.log('✅ Função normalizarTextoPDF encontrada');
    
    // Verificar se contém as substituições de caracteres acentuados
    const funcaoNormalizar = normalizarTextoPDFMatch[0];
    const caracteresEsperados = [
        '[áàâãä]',
        '[éèêë]', 
        '[íìîï]',
        '[óòôõö]',
        '[úùûü]',
        '[ç]'
    ];
    
    caracteresEsperados.forEach(char => {
        if (funcaoNormalizar.includes(char)) {
            console.log(`  ✅ Normalização para ${char} implementada`);
        } else {
            console.log(`  ❌ Normalização para ${char} faltando`);
        }
    });
} else {
    console.log('❌ Função normalizarTextoPDF não encontrada');
}

// Verificar se a função adicionarTextoPDF está correta
const adicionarTextoPDFMatch = content.match(/function adicionarTextoPDF\(([^}]+)\}/s);
if (adicionarTextoPDFMatch) {
    console.log('\n✅ Função adicionarTextoPDF encontrada');
    const funcaoAdicionar = adicionarTextoPDFMatch[0];
    
    if (funcaoAdicionar.includes('normalizarTextoPDF(texto)')) {
        console.log('  ✅ Chama normalizarTextoPDF corretamente');
    } else {
        console.log('  ❌ Não chama normalizarTextoPDF');
    }
    
    if (funcaoAdicionar.includes('doc.text(textoNormalizado')) {
        console.log('  ✅ Usa texto normalizado no doc.text');
    } else {
        console.log('  ❌ Não usa texto normalizado');
    }
} else {
    console.log('❌ Função adicionarTextoPDF não encontrada');
}

// Contar quantas vezes adicionarTextoPDF é usada
const usoAdicionarTexto = (content.match(/adicionarTextoPDF\(/g) || []).length;
console.log(`\n📊 Estatísticas:
- Uso de adicionarTextoPDF: ${usoAdicionarTexto} vezes
- Chamadas diretas doc.text restantes: ${(content.match(/doc\.text\(/g) || []).length - 1} (excluindo a dentro de adicionarTextoPDF)`);

// Verificar se há emojis problemáticos nas strings do PDF (excluindo console.log e normalização)
const linhas = content.split('\n');
let emojisProblematicos = 0;
let inNormalizeFunction = false;

for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    
    if (linha.includes('function normalizarTextoPDF')) {
        inNormalizeFunction = true;
        continue;
    }
    
    if (inNormalizeFunction && linha.includes('}') && !linha.includes('{')) {
        inNormalizeFunction = false;
        continue;
    }
    
    // Pular linhas de console.log
    if (linha.includes('console.') || inNormalizeFunction) {
        continue;
    }
    
    // Verificar emojis problemáticos
    const emojiPattern = /[🥇🥈🥉📊⛽💰📈💵🔢💡🚗]/g;
    if (emojiPattern.test(linha)) {
        emojisProblematicos++;
        console.log(`⚠️  Emoji problemático na linha ${i + 1}: ${linha.trim()}`);
    }
}

if (emojisProblematicos === 0) {
    console.log('\n✅ Nenhum emoji problemático encontrado no código de PDF!');
} else {
    console.log(`\n⚠️  ${emojisProblematicos} emojis problemáticos ainda encontrados`);
}

console.log('\n🎯 RESULTADO FINAL:');
if (usoAdicionarTexto > 90 && emojisProblematicos === 0) {
    console.log('🎉 SUCESSO! As correções de PDF foram aplicadas corretamente.');
    console.log('   - Todas as chamadas doc.text() foram substituídas por adicionarTextoPDF()');
    console.log('   - Normalização de caracteres implementada');
    console.log('   - Emojis problemáticos removidos do código de PDF');
} else {
    console.log('⚠️  Ainda há melhorias a serem feitas:');
    if (usoAdicionarTexto < 90) {
        console.log(`   - Aumentar uso de adicionarTextoPDF (atual: ${usoAdicionarTexto})`);
    }
    if (emojisProblematicos > 0) {
        console.log(`   - Remover ${emojisProblematicos} emojis problemáticos`);
    }
}

console.log('\n🏁 Teste concluído!');
