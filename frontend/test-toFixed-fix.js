const fs = require('fs');

// Carregar as funções de relatorios.js
const js = fs.readFileSync('src/js/relatorios.js', 'utf8');
eval(js);

console.log('🧪 Testando casos problemáticos que causavam erro toFixed()...\n');

// Casos que anteriormente causavam erro "Cannot read properties of undefined (reading 'toFixed')"
console.log('Teste 1 - valores undefined:');
console.log('  formatarMoeda(undefined):', formatarMoeda(undefined));
console.log('  formatarNumero(undefined, 2):', formatarNumero(undefined, 2));

console.log('\nTeste 2 - valores null:');
console.log('  formatarMoeda(null):', formatarMoeda(null));
console.log('  formatarNumero(null, 2):', formatarNumero(null, 2));

console.log('\nTeste 3 - valores NaN:');
console.log('  formatarMoeda(NaN):', formatarMoeda(NaN));
console.log('  formatarNumero(NaN, 2):', formatarNumero(NaN, 2));

console.log('\nTeste 4 - strings vazias:');
console.log('  formatarMoeda(""):', formatarMoeda(''));
console.log('  formatarNumero("", 2):', formatarNumero('', 2));

console.log('\nTeste 5 - strings com valores:');
console.log('  formatarMoeda("120.000"):', formatarMoeda('120.000'));
console.log('  formatarNumero("5000.00", 1):', formatarNumero('5000.00', 1));

console.log('\n✅ Todos os testes passaram! O erro toFixed() foi corrigido.');
