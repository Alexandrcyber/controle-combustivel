// Script final para testar relatórios com dados da API
console.log('=== TESTE FINAL DOS RELATÓRIOS COM DADOS DA API ===');

async function testarRelatoriosComAPI() {
    try {
        console.log('1. Verificando se a API está disponível...');
        
        if (!window.dbApi) {
            console.error('❌ window.dbApi não está disponível');
            return;
        }
        
        if (!window.apiClient) {
            console.error('❌ window.apiClient não está disponível');
            return;
        }
        
        console.log('✅ APIs estão disponíveis');
        
        // 2. Carregar dados da API
        console.log('\n2. Carregando dados da API...');
        const caminhoes = await window.dbApi.buscarCaminhoes();
        const abastecimentos = await window.dbApi.buscarAbastecimentos();
        
        console.log(`✅ Carregados: ${caminhoes.length} caminhões e ${abastecimentos.length} abastecimentos`);
        
        if (caminhoes.length === 0 || abastecimentos.length === 0) {
            console.warn('⚠️ Não há dados suficientes para gerar relatórios');
            console.log('Criando dados de teste...');
            
            // Criar um caminhão de teste se não existir
            if (caminhoes.length === 0) {
                const caminhaoTeste = {
                    placa: 'TESTE-123',
                    modelo: 'Caminhão Teste',
                    ano: 2023,
                    capacidade: 300,
                    motorista: 'Motorista Teste'
                };
                
                const caminhaoSalvo = await window.dbApi.salvarCaminhao(caminhaoTeste);
                caminhoes.push(caminhaoSalvo);
                console.log('✅ Caminhão de teste criado:', caminhaoSalvo);
            }
            
            // Criar abastecimento de teste se não existir
            if (abastecimentos.length === 0) {
                const hoje = new Date();
                const abastecimentoTeste = {
                    data: hoje.toISOString().split('T')[0],
                    periodoInicio: hoje.toISOString().split('T')[0],
                    periodoFim: hoje.toISOString().split('T')[0],
                    caminhaoId: caminhoes[0].id,
                    motorista: 'Motorista Teste',
                    kmInicial: 1000,
                    kmFinal: 1100,
                    litros: 50,
                    valorLitro: 5.50,
                    valorTotal: 275,
                    posto: 'Posto Teste'
                };
                
                const abastecimentoSalvo = await window.dbApi.salvarAbastecimento(abastecimentoTeste);
                abastecimentos.push(abastecimentoSalvo);
                console.log('✅ Abastecimento de teste criado:', abastecimentoSalvo);
            }
        }
        
        // 3. Atualizar variáveis globais
        console.log('\n3. Atualizando variáveis globais...');
        window.caminhoes = caminhoes;
        window.abastecimentos = abastecimentos;
        
        console.log('✅ Variáveis globais atualizadas:');
        console.log('   window.caminhoes:', window.caminhoes.length);
        console.log('   window.abastecimentos:', window.abastecimentos.length);
        
        // 4. Verificar se as funções de relatório existem
        console.log('\n4. Verificando funções de relatório...');
        
        if (typeof gerarRelatorioConsumo === 'function') {
            console.log('✅ gerarRelatorioConsumo encontrada');
        } else {
            console.error('❌ gerarRelatorioConsumo não encontrada');
            return;
        }
        
        if (typeof gerarRelatorioCustos === 'function') {
            console.log('✅ gerarRelatorioCustos encontrada');
        } else {
            console.error('❌ gerarRelatorioCustos não encontrada');
            return;
        }
        
        // 5. Testar geração de relatório de consumo
        console.log('\n5. Testando relatório de consumo...');
        try {
            gerarRelatorioConsumo(abastecimentos, caminhoes);
            
            setTimeout(() => {
                const relatorioConsumo = document.querySelector('#relatorio-consumo');
                if (relatorioConsumo && relatorioConsumo.innerHTML.trim() !== '') {
                    console.log('✅ Relatório de consumo gerado com sucesso');
                    console.log('Conteúdo:', relatorioConsumo.innerHTML.substring(0, 300) + '...');
                } else {
                    console.log('❌ Relatório de consumo está vazio ou não foi gerado');
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Erro ao gerar relatório de consumo:', error);
        }
        
        // 6. Testar geração de relatório de custos
        setTimeout(() => {
            console.log('\n6. Testando relatório de custos...');
            try {
                gerarRelatorioCustos(abastecimentos, caminhoes);
                
                setTimeout(() => {
                    const relatorioCustos = document.querySelector('#relatorio-custos');
                    if (relatorioCustos && relatorioCustos.innerHTML.trim() !== '') {
                        console.log('✅ Relatório de custos gerado com sucesso');
                        console.log('Conteúdo:', relatorioCustos.innerHTML.substring(0, 300) + '...');
                    } else {
                        console.log('❌ Relatório de custos está vazio ou não foi gerado');
                    }
                    
                    console.log('\n=== TESTE CONCLUÍDO ===');
                }, 1000);
                
            } catch (error) {
                console.error('❌ Erro ao gerar relatório de custos:', error);
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

// Executar teste quando a página estiver carregada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testarRelatoriosComAPI, 2000);
    });
} else {
    setTimeout(testarRelatoriosComAPI, 2000);
}
