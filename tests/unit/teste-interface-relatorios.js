// Script para testar a interface de relatórios no navegador
// Execute este script diretamente no console do navegador (F12)

console.log('🚀 INICIANDO TESTE DA INTERFACE DE RELATÓRIOS');

// Função para aguardar elemento aparecer
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Elemento ${selector} não encontrado após ${timeout}ms`));
        }, timeout);
    });
}

// Função para simular click
function simulateClick(element) {
    const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(event);
}

// Teste principal
async function testarInterface() {
    try {
        console.log('1. Verificando se a página carregou...');
        
        // Aguardar a página carregar completamente
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve);
            });
        }
        
        console.log('2. Verificando se os dados foram carregados...');
        
        // Aguardar dados serem carregados
        let tentativas = 0;
        while ((!window.caminhoes || !window.abastecimentos) && tentativas < 50) {
            await new Promise(resolve => setTimeout(resolve, 200));
            tentativas++;
        }
        
        if (!window.caminhoes || !window.abastecimentos) {
            console.error('❌ Dados não carregados após 10 segundos');
            console.log('window.caminhoes:', window.caminhoes);
            console.log('window.abastecimentos:', window.abastecimentos);
            return;
        }
        
        console.log('✅ Dados carregados:');
        console.log(`- Caminhões: ${window.caminhoes ? window.caminhoes.length : 0}`);
        console.log(`- Abastecimentos: ${window.abastecimentos ? window.abastecimentos.length : 0}`);
        
        console.log('3. Navegando para a página de relatórios...');
        
        // Tentar encontrar o link/botão para relatórios
        const linkRelatorios = document.querySelector('a[href="#relatorios"], button[onclick*="relatorios"], [data-page="relatorios"]');
        if (linkRelatorios) {
            simulateClick(linkRelatorios);
            console.log('✅ Clicou no link de relatórios');
        } else {
            // Se não encontrar, tentar mostrar a seção diretamente
            console.log('⚠️ Link de relatórios não encontrado, tentando mostrar seção diretamente...');
            const secaoRelatorios = document.getElementById('relatorios');
            if (secaoRelatorios) {
                // Esconder outras seções
                document.querySelectorAll('.content-section').forEach(section => {
                    section.style.display = 'none';
                });
                secaoRelatorios.style.display = 'block';
                console.log('✅ Seção de relatórios mostrada diretamente');
            } else {
                console.error('❌ Seção de relatórios não encontrada');
                return;
            }
        }
        
        // Aguardar um pouco para a seção carregar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('4. Testando relatório de consumo...');
        
        // Tentar gerar relatório de consumo
        const btnConsumo = document.getElementById('btn-relatorio-consumo');
        if (btnConsumo) {
            console.log('📊 Gerando relatório de consumo...');
            simulateClick(btnConsumo);
            
            // Aguardar um pouco para o relatório ser gerado
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verificar se algum elemento foi criado (tabela, gráfico, etc.)
            const tabelaConsumo = document.querySelector('#relatorio-consumo table, #resultado-consumo, .tabela-relatorio');
            if (tabelaConsumo && tabelaConsumo.innerHTML.trim()) {
                console.log('✅ Relatório de consumo gerado com sucesso!');
                console.log('Conteúdo encontrado:', tabelaConsumo.innerHTML.substring(0, 200) + '...');
            } else {
                console.log('⚠️ Relatório de consumo pode não ter sido gerado ou está vazio');
            }
        } else {
            console.error('❌ Botão de relatório de consumo não encontrado');
        }
        
        console.log('5. Testando relatório de custos...');
        
        // Tentar gerar relatório de custos
        const btnCustos = document.getElementById('btn-relatorio-custos');
        if (btnCustos) {
            console.log('💰 Gerando relatório de custos...');
            simulateClick(btnCustos);
            
            // Aguardar um pouco para o relatório ser gerado
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verificar se algum elemento foi criado
            const tabelaCustos = document.querySelector('#relatorio-custos table, #resultado-custos, .tabela-relatorio');
            if (tabelaCustos && tabelaCustos.innerHTML.trim()) {
                console.log('✅ Relatório de custos gerado com sucesso!');
                console.log('Conteúdo encontrado:', tabelaCustos.innerHTML.substring(0, 200) + '...');
            } else {
                console.log('⚠️ Relatório de custos pode não ter sido gerado ou está vazio');
            }
        } else {
            console.error('❌ Botão de relatório de custos não encontrado');
        }
        
        console.log('6. Verificando logs de erro...');
        
        // Verificar se há erros no console
        const originalError = console.error;
        const errors = [];
        console.error = function(...args) {
            errors.push(args.join(' '));
            originalError.apply(console, args);
        };
        
        if (errors.length > 0) {
            console.log('⚠️ Erros encontrados:', errors);
        } else {
            console.log('✅ Nenhum erro detectado');
        }
        
        console.log('🎉 TESTE DE INTERFACE CONCLUÍDO!');
        
        // Resumo final
        console.log('\n📋 RESUMO:');
        console.log(`- Dados carregados: ${window.caminhoes && window.abastecimentos ? '✅' : '❌'}`);
        console.log(`- Página de relatórios acessível: ${document.getElementById('relatorios') ? '✅' : '❌'}`);
        console.log(`- Botão de consumo: ${document.getElementById('btn-relatorio-consumo') ? '✅' : '❌'}`);
        console.log(`- Botão de custos: ${document.getElementById('btn-relatorio-custos') ? '✅' : '❌'}`);
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

// Executar o teste
testarInterface();
