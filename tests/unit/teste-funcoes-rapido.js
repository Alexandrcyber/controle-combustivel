// TESTE RÁPIDO DAS FUNÇÕES DE RELATÓRIOS
// Cole este código no console do navegador (F12 -> Console)

console.log('🔍 TESTE RÁPIDO DAS FUNÇÕES DE RELATÓRIOS');

// Verificar se as funções existem
console.log('gerarRelatorioConsumo existe:', typeof gerarRelatorioConsumo);
console.log('gerarRelatorioCustos existe:', typeof gerarRelatorioCustos);

// Verificar dados disponíveis
console.log('window.caminhoes:', window.caminhoes ? window.caminhoes.length + ' caminhões' : 'não disponível');
console.log('window.abastecimentos:', window.abastecimentos ? window.abastecimentos.length + ' abastecimentos' : 'não disponível');

// Teste direto das funções
if (typeof gerarRelatorioConsumo === 'function' && window.abastecimentos && window.caminhoes) {
    console.log('🧪 Testando gerarRelatorioConsumo...');
    try {
        gerarRelatorioConsumo(window.abastecimentos, window.caminhoes);
        console.log('✅ gerarRelatorioConsumo executada sem erros');
    } catch (error) {
        console.error('❌ Erro em gerarRelatorioConsumo:', error);
    }
}

if (typeof gerarRelatorioCustos === 'function' && window.abastecimentos && window.caminhoes) {
    console.log('🧪 Testando gerarRelatorioCustos...');
    try {
        gerarRelatorioCustos(window.abastecimentos, window.caminhoes);
        console.log('✅ gerarRelatorioCustos executada sem erros');
    } catch (error) {
        console.error('❌ Erro em gerarRelatorioCustos:', error);
    }
}

// Verificar se os resultados foram exibidos
const resultados = document.querySelector('#relatorioResultados');
if (resultados) {
    console.log('📊 Área de resultados encontrada');
    console.log('Visível:', resultados.style.display !== 'none');
    console.log('Conteúdo (primeiros 200 chars):', resultados.innerHTML.substring(0, 200));
} else {
    console.log('❌ Área de resultados não encontrada');
}
