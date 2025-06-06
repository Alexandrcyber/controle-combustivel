// Teste simples para verificar se os relatórios funcionam
console.log('🔍 TESTE RÁPIDO - SISTEMA DE RELATÓRIOS');

// Função para testar manualmente
window.testeManualRelatorios = function() {
    console.log('\n=== VERIFICAÇÕES BÁSICAS ===');
    
    // 1. Verificar variáveis globais
    console.log('window.caminhoes:', window.caminhoes?.length || 'undefined');
    console.log('window.abastecimentos:', window.abastecimentos?.length || 'undefined');
    
    // 2. Verificar se as funções existem
    console.log('gerarRelatorioConsumo:', typeof gerarRelatorioConsumo);
    console.log('gerarRelatorioCustos:', typeof gerarRelatorioCustos);
    
    // 3. Verificar elementos da interface
    const elementos = {
        'dataInicio': document.getElementById('dataInicio'),
        'dataFim': document.getElementById('dataFim'),
        'caminhaoSelect': document.getElementById('caminhaoSelect'),
        'relatorioResultados': document.getElementById('relatorioResultados')
    };
    
    console.log('\n=== ELEMENTOS DA INTERFACE ===');
    Object.keys(elementos).forEach(key => {
        console.log(`${key}:`, elementos[key] ? '✅ encontrado' : '❌ não encontrado');
    });
    
    return elementos;
};

// Função para preencher formulário e testar
window.testarRelatorioConsumo = function() {
    console.log('\n🧪 TESTANDO RELATÓRIO DE CONSUMO');
    
    try {
        // Preencher campos
        const dataInicio = document.getElementById('dataInicio');
        const dataFim = document.getElementById('dataFim');
        const caminhaoSelect = document.getElementById('caminhaoSelect');
        
        if (!dataInicio || !dataFim || !caminhaoSelect) {
            console.log('❌ Elementos não encontrados');
            return false;
        }
        
        // Definir período dos últimos 30 dias
        const hoje = new Date();
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        
        dataInicio.value = trintaDiasAtras.toISOString().split('T')[0];
        dataFim.value = hoje.toISOString().split('T')[0];
        caminhaoSelect.value = 'todos';
        
        console.log('📝 Formulário preenchido:');
        console.log('  Data início:', dataInicio.value);
        console.log('  Data fim:', dataFim.value);
        console.log('  Caminhão:', caminhaoSelect.value);
        
        // Executar função
        console.log('\n🔄 Executando gerarRelatorioConsumo...');
        gerarRelatorioConsumo();
        
        // Verificar resultado após um delay
        setTimeout(() => {
            const resultado = document.getElementById('relatorioResultados');
            if (resultado && resultado.innerHTML.trim()) {
                console.log('✅ Relatório gerado com sucesso!');
                console.log('📊 Primeira linha do resultado:', resultado.innerHTML.substring(0, 200) + '...');
            } else {
                console.log('❌ Relatório não foi gerado');
                console.log('📄 Conteúdo atual:', resultado ? resultado.innerHTML : 'elemento não encontrado');
            }
        }, 1000);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao testar relatório:', error);
        return false;
    }
};

console.log('\n💡 Funções disponíveis:');
console.log('  - testeManualRelatorios()');
console.log('  - testarRelatorioConsumo()');
console.log('\n📋 Execute no console para testar!');
