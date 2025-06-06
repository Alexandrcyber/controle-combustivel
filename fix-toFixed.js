// Script para corrigir todas as ocorrências de toFixed() no relatorios.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'js', 'relatorios.js');

console.log('🔧 Iniciando correção do erro toFixed()...');

// Ler o arquivo
let content = fs.readFileSync(filePath, 'utf8');

// Lista de substituições para tornar toFixed() seguro
const replacements = [
    // Substituições diretas de toFixed() por funções seguras
    {
        from: /(\w+)\.toFixed\(2\)/g,
        to: 'formatarMoeda($1)'
    },
    {
        from: /(\w+)\.toFixed\(1\)/g,
        to: 'formatarNumero($1, 1)'
    },
    {
        from: /(\w+)\.toFixed\(0\)/g,
        to: 'formatarNumero($1, 0)'
    },
    // Substituições de expressões complexas
    {
        from: /\(([^)]+)\)\.toFixed\(2\)/g,
        to: 'formatarMoeda($1)'
    },
    {
        from: /\(([^)]+)\)\.toFixed\(1\)/g,
        to: 'formatarNumero($1, 1)'
    },
    {
        from: /\(([^)]+)\)\.toFixed\(0\)/g,
        to: 'formatarNumero($1, 0)'
    }
];

// Aplicar substituições
let changeCount = 0;
replacements.forEach(replacement => {
    const before = content;
    content = content.replace(replacement.from, replacement.to);
    if (content !== before) {
        changeCount++;
        console.log(`✅ Aplicada substituição: ${replacement.from.source}`);
    }
});

// Salvar o arquivo modificado
fs.writeFileSync(filePath, content, 'utf8');

console.log(`🎉 Correção concluída! ${changeCount} tipos de substituições aplicadas.`);
console.log('📁 Arquivo corrigido:', filePath);
