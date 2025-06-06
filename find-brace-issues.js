const fs = require('fs');

// Ler o arquivo relatorios.js
const content = fs.readFileSync('c:\\Users\\superpan\\Documents\\programacao\\projetos\\Controle-de-combustivel\\frontend\\src\\js\\relatorios.js', 'utf8');

// Dividir em linhas
const lines = content.split('\n');

let braceStack = [];
let lineNumber = 0;

for (const line of lines) {
    lineNumber++;
    
    // Contar chaves na linha
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '{') {
            braceStack.push({ line: lineNumber, char: '{', context: line.trim() });
        } else if (char === '}') {
            if (braceStack.length === 0) {
                console.log(`❌ Chave de fechamento extra na linha ${lineNumber}: ${line.trim()}`);
            } else {
                braceStack.pop();
            }
        }
    }
}

// Mostrar chaves não fechadas
if (braceStack.length > 0) {
    console.log(`❌ ${braceStack.length} chave(s) não fechada(s):`);
    braceStack.forEach(brace => {
        console.log(`  Linha ${brace.line}: ${brace.context}`);
    });
} else {
    console.log('✅ Todas as chaves estão balanceadas');
}
