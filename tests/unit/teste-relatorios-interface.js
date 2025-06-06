// Script de teste para verificar se os relatórios estão funcionando na interface
console.log('=== TESTE DE INTERFACE DOS RELATÓRIOS ===');

// Função para aguardar um elemento aparecer
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function check() {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Elemento ${selector} não encontrado após ${timeout}ms`));
            } else {
                setTimeout(check, 100);
            }
        }
        
        check();
    });
}

// Função para testar relatórios
async function testarRelatorios() {
    try {
        console.log('1. Verificando se as variáveis globais existem...');
        console.log('window.abastecimentos:', window.abastecimentos ? 'OK' : 'ERRO');
        console.log('window.caminhoes:', window.caminhoes ? 'OK' : 'ERRO');
        
        // Navegue para a página de relatórios se não estiver lá
        console.log('2. Navegando para página de relatórios...');
        const relatoriosButton = document.querySelector('button[onclick="mostrarSecao(\'relatorios\')"]');
        if (relatoriosButton) {
            relatoriosButton.click();
            console.log('Clicou no botão de relatórios');
        }
        
        // Aguarda a seção de relatórios aparecer
        await waitForElement('#relatorios');
        console.log('3. Seção de relatórios carregada');
        
        // Testa relatório de consumo
        console.log('4. Testando relatório de consumo...');
        const btnConsumo = document.querySelector('#btn-relatorio-consumo');
        if (btnConsumo) {
            btnConsumo.click();
            console.log('Clicou no botão de relatório de consumo');
            
            // Aguarda o relatório aparecer
            setTimeout(() => {
                const relatorioConsumo = document.querySelector('#relatorio-consumo');
                if (relatorioConsumo && relatorioConsumo.innerHTML.trim() !== '') {
                    console.log('✅ Relatório de consumo gerado com sucesso');
                    console.log('Conteúdo do relatório:', relatorioConsumo.innerHTML.substring(0, 200) + '...');
                } else {
                    console.log('❌ Relatório de consumo não foi gerado ou está vazio');
                }
            }, 1000);
        } else {
            console.log('❌ Botão de relatório de consumo não encontrado');
        }
        
        // Testa relatório de custos
        setTimeout(() => {
            console.log('5. Testando relatório de custos...');
            const btnCustos = document.querySelector('#btn-relatorio-custos');
            if (btnCustos) {
                btnCustos.click();
                console.log('Clicou no botão de relatório de custos');
                
                // Aguarda o relatório aparecer
                setTimeout(() => {
                    const relatorioCustos = document.querySelector('#relatorio-custos');
                    if (relatorioCustos && relatorioCustos.innerHTML.trim() !== '') {
                        console.log('✅ Relatório de custos gerado com sucesso');
                        console.log('Conteúdo do relatório:', relatorioCustos.innerHTML.substring(0, 200) + '...');
                    } else {
                        console.log('❌ Relatório de custos não foi gerado ou está vazio');
                    }
                }, 1000);
            } else {
                console.log('❌ Botão de relatório de custos não encontrado');
            }
        }, 2000);
        
    } catch (error) {
        console.error('Erro durante o teste:', error);
    }
}

// Aguarda o DOM carregar e executa o teste
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testarRelatorios, 1000);
    });
} else {
    setTimeout(testarRelatorios, 1000);
}
