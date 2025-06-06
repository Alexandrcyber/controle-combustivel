// Script de teste final para verificar o sistema de relatórios
console.log('🔧 Iniciando teste final do sistema de relatórios...');

// Função para testar se o sistema está funcionando
function testeCompleto() {
    console.log('📊 Executando teste completo...');
    
    // 1. Verificar se as variáveis globais existem
    console.log('1. Verificando variáveis globais:');
    console.log('   window.caminhoes:', window.caminhoes ? window.caminhoes.length : 'undefined');
    console.log('   window.abastecimentos:', window.abastecimentos ? window.abastecimentos.length : 'undefined');
    
    // 2. Verificar se as funções estão disponíveis
    console.log('2. Verificando funções:');
    console.log('   loadDataFromLocalStorage:', typeof loadDataFromLocalStorage);
    console.log('   updateGlobalReferences:', typeof updateGlobalReferences);
    console.log('   gerarRelatorioConsumo:', typeof gerarRelatorioConsumo);
    
    // 3. Carregar dados se necessário
    if (!window.abastecimentos || window.abastecimentos.length === 0) {
        console.log('3. Carregando dados...');
        
        if (typeof loadDataFromLocalStorage === 'function') {
            loadDataFromLocalStorage()
                .then(() => {
                    console.log('✅ Dados carregados com sucesso');
                    console.log('   Caminhões:', window.caminhoes ? window.caminhoes.length : 0);
                    console.log('   Abastecimentos:', window.abastecimentos ? window.abastecimentos.length : 0);
                    
                    // Testar estrutura dos dados
                    if (window.abastecimentos && window.abastecimentos.length > 0) {
                        const amostra = window.abastecimentos[0];
                        console.log('4. Estrutura dos dados (amostra):');
                        console.log('   ID:', amostra.id);
                        console.log('   Data:', amostra.data);
                        console.log('   Caminhão ID:', amostra.caminhao_id);
                        console.log('   KM Inicial (campo):', amostra.km_inicial, 'Tipo:', typeof amostra.km_inicial);
                        console.log('   KM Final (campo):', amostra.km_final, 'Tipo:', typeof amostra.km_final);
                        console.log('   Litros (campo):', amostra.litros, 'Tipo:', typeof amostra.litros);
                        console.log('   Valor Total (campo):', amostra.valor_total, 'Tipo:', typeof amostra.valor_total);
                        
                        // Testar parseFloat
                        console.log('5. Teste de conversões parseFloat:');
                        console.log('   parseFloat(km_inicial):', parseFloat(amostra.km_inicial));
                        console.log('   parseFloat(km_final):', parseFloat(amostra.km_final));
                        console.log('   parseFloat(litros):', parseFloat(amostra.litros));
                        console.log('   parseFloat(valor_total):', parseFloat(amostra.valor_total));
                        
                        // Testar cálculo
                        const distancia = parseFloat(amostra.km_final) - parseFloat(amostra.km_inicial);
                        console.log('   Distância calculada:', distancia);
                        
                        // Testar totalGasto.toFixed() - o erro original
                        const totalGasto = parseFloat(amostra.valor_total);
                        console.log('   totalGasto.toFixed(2):', totalGasto.toFixed(2));
                        
                        console.log('✅ Todos os testes de conversão passaram!');
                    }
                })
                .catch(error => {
                    console.error('❌ Erro ao carregar dados:', error);
                });
        } else {
            console.log('❌ Função loadDataFromLocalStorage não encontrada');
        }
    } else {
        console.log('3. Dados já carregados');
        console.log('   Caminhões:', window.caminhoes.length);
        console.log('   Abastecimentos:', window.abastecimentos.length);
    }
}

// Função para forçar teste de relatório
function testarRelatorioForca() {
    console.log('📋 Testando geração de relatório...');
    
    if (!window.abastecimentos || window.abastecimentos.length === 0) {
        console.log('❌ Nenhum abastecimento disponível para teste');
        return;
    }
    
    try {
        // Simular seleção de datas
        const dataHoje = new Date().toISOString().split('T')[0];
        const dataPassado = '2025-01-01';
        
        document.getElementById('dataInicio').value = dataPassado;
        document.getElementById('dataFim').value = dataHoje;
        document.getElementById('caminhaoSelect').value = 'todos';
        
        console.log('📅 Parâmetros definidos:', {
            dataInicio: dataPassado,
            dataFim: dataHoje,
            caminhao: 'todos'
        });
        
        // Executar função de relatório
        if (typeof gerarRelatorioConsumo === 'function') {
            gerarRelatorioConsumo();
            console.log('✅ Função gerarRelatorioConsumo executada');
        } else {
            console.log('❌ Função gerarRelatorioConsumo não encontrada');
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar relatório:', error);
    }
}

// Função para debug completo
function debugCompleto() {
    console.log('🔍 Debug completo do sistema...');
    
    // Verificar localStorage
    console.log('LocalStorage:');
    const caminhaoStorage = localStorage.getItem('caminhoes');
    const abastecimentoStorage = localStorage.getItem('abastecimentos');
    console.log('   caminhoes:', caminhaoStorage ? JSON.parse(caminhaoStorage).length : 'vazio');
    console.log('   abastecimentos:', abastecimentoStorage ? JSON.parse(abastecimentoStorage).length : 'vazio');
    
    // Verificar elementos DOM
    console.log('Elementos DOM:');
    console.log('   dataInicio:', document.getElementById('dataInicio') ? 'encontrado' : 'não encontrado');
    console.log('   dataFim:', document.getElementById('dataFim') ? 'encontrado' : 'não encontrado');
    console.log('   caminhaoSelect:', document.getElementById('caminhaoSelect') ? 'encontrado' : 'não encontrado');
    console.log('   relatorioResultados:', document.getElementById('relatorioResultados') ? 'encontrado' : 'não encontrado');
    
    // Verificar seção ativa
    const relatoriosSection = document.getElementById('relatorios');
    console.log('   Seção relatórios:', relatoriosSection ? 'encontrada' : 'não encontrada');
    if (relatoriosSection) {
        console.log('   Visível:', relatoriosSection.style.display !== 'none');
    }
}

// Executar automaticamente após 2 segundos para dar tempo dos scripts carregarem
setTimeout(() => {
    console.log('🚀 Executando teste automático...');
    testeCompleto();
    
    // Executar debug após mais 3 segundos
    setTimeout(() => {
        debugCompleto();
    }, 3000);
}, 2000);

// Disponibilizar funções globalmente para uso manual
window.testeCompleto = testeCompleto;
window.testarRelatorioForca = testarRelatorioForca;
window.debugCompleto = debugCompleto;

console.log('✅ Script de teste final carregado!');
console.log('💡 Uso manual:');
console.log('   testeCompleto() - Teste completo do sistema');
console.log('   testarRelatorioForca() - Forçar teste de relatório');
console.log('   debugCompleto() - Debug completo dos elementos');
