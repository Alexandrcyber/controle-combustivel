// Teste manual direto dos relatórios
console.log('=== TESTE MANUAL DOS RELATÓRIOS ===');

// Função para testar os relatórios manualmente
function testarRelatoriosManual() {
    console.log('1. Carregando dados...');
    
    // Força o carregamento dos dados
    if (typeof carregarDados === 'function') {
        carregarDados().then(() => {
            console.log('2. Dados carregados');
            console.log('Abastecimentos:', window.abastecimentos?.length || 0);
            console.log('Caminhões:', window.caminhoes?.length || 0);
            
            // Testa relatório de consumo
            console.log('3. Testando relatório de consumo...');
            if (typeof gerarRelatorioConsumo === 'function') {
                try {
                    gerarRelatorioConsumo(window.abastecimentos, window.caminhoes);
                    console.log('✅ Função gerarRelatorioConsumo executada');
                } catch (error) {
                    console.error('❌ Erro ao gerar relatório de consumo:', error);
                }
            } else {
                console.log('❌ Função gerarRelatorioConsumo não encontrada');
            }
            
            // Testa relatório de custos
            setTimeout(() => {
                console.log('4. Testando relatório de custos...');
                if (typeof gerarRelatorioCustos === 'function') {
                    try {
                        gerarRelatorioCustos(window.abastecimentos, window.caminhoes);
                        console.log('✅ Função gerarRelatorioCustos executada');
                    } catch (error) {
                        console.error('❌ Erro ao gerar relatório de custos:', error);
                    }
                } else {
                    console.log('❌ Função gerarRelatorioCustos não encontrada');
                }
            }, 1000);
            
        }).catch(error => {
            console.error('Erro ao carregar dados:', error);
        });
    } else {
        console.log('❌ Função carregarDados não encontrada');
    }
}

// Executa o teste quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testarRelatoriosManual, 2000);
    });
} else {
    setTimeout(testarRelatoriosManual, 2000);
}
