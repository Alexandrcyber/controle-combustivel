// SCRIPT PARA EXECUTAR NO CONSOLE DO NAVEGADOR
// Cole este código no console do navegador (F12 -> Console) na página http://localhost:8080

console.log('🚀 INICIANDO TESTE DOS RELATÓRIOS NO NAVEGADOR');

// Função para aguardar um elemento aparecer
function aguardarElemento(seletor, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const elemento = document.querySelector(seletor);
        if (elemento) {
            resolve(elemento);
            return;
        }
        
        const observer = new MutationObserver(() => {
            const elemento = document.querySelector(seletor);
            if (elemento) {
                observer.disconnect();
                resolve(elemento);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Elemento ${seletor} não encontrado em ${timeout}ms`));
        }, timeout);
    });
}

// Função principal de teste
async function testarRelatorios() {
    try {
        console.log('📋 1. Verificando se estamos na página de relatórios...');
        
        // Primeiro, vamos para a página de relatórios se não estivermos lá
        const linkRelatorios = document.querySelector('a[href="#relatorios"]');
        if (linkRelatorios) {
            console.log('🔗 Clicando no link de relatórios...');
            linkRelatorios.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('📊 2. Verificando dados disponíveis...');
        console.log('🚚 Caminhões:', window.caminhoes ? window.caminhoes.length : 'não encontrados');
        console.log('⛽ Abastecimentos:', window.abastecimentos ? window.abastecimentos.length : 'não encontrados');
        
        console.log('📝 3. Testando Relatório de Consumo...');
        
        // Aguardar formulário de consumo aparecer
        const formConsumo = await aguardarElemento('#relatorioConsumoForm');
        console.log('✅ Formulário de consumo encontrado');
        
        // Preencher campos do relatório de consumo
        const dataInicio = document.querySelector('#dataInicio');
        const dataFim = document.querySelector('#dataFim');
        const caminhaoSelect = document.querySelector('#caminhaoSelect');
        
        if (dataInicio && dataFim) {
            dataInicio.value = '2024-01-01';
            dataFim.value = '2024-12-31';
            console.log('📅 Datas preenchidas');
        }
        
        if (caminhaoSelect && caminhaoSelect.options.length > 1) {
            caminhaoSelect.selectedIndex = 1; // Selecionar primeiro caminhão
            console.log('🚚 Caminhão selecionado');
        }
        
        // Submeter formulário de consumo
        console.log('🔄 Submetendo formulário de consumo...');
        
        // Criar evento de submit
        const eventoSubmit = new Event('submit', {
            bubbles: true,
            cancelable: true
        });
        
        formConsumo.dispatchEvent(eventoSubmit);
        
        // Aguardar resultado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const resultados = document.querySelector('#relatorioResultados');
        if (resultados && resultados.style.display !== 'none') {
            console.log('✅ Relatório de consumo gerado com sucesso!');
            console.log('📊 Conteúdo do resultado:', resultados.innerHTML.substring(0, 200) + '...');
        } else {
            console.log('❌ Relatório de consumo não foi exibido');
        }
        
        console.log('💰 4. Testando Relatório de Custos...');
        
        // Aguardar formulário de custos
        const formCustos = await aguardarElemento('#relatorioCustosForm');
        console.log('✅ Formulário de custos encontrado');
        
        // Preencher campos do relatório de custos
        const mesInicio = document.querySelector('#mesInicio');
        const mesFim = document.querySelector('#mesFim');
        const tipoAgrupamento = document.querySelector('#tipoAgrupamento');
        
        if (mesInicio && mesFim) {
            mesInicio.value = '2024-01';
            mesFim.value = '2024-12';
            console.log('📅 Meses preenchidos');
        }
        
        if (tipoAgrupamento) {
            tipoAgrupamento.value = 'mes';
            console.log('📊 Tipo de agrupamento selecionado');
        }
        
        // Submeter formulário de custos
        console.log('🔄 Submetendo formulário de custos...');
        const eventoSubmitCustos = new Event('submit', {
            bubbles: true,
            cancelable: true
        });
        
        formCustos.dispatchEvent(eventoSubmitCustos);
        
        // Aguardar resultado
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (resultados && resultados.style.display !== 'none') {
            console.log('✅ Relatório de custos gerado com sucesso!');
            console.log('📊 Conteúdo do resultado:', resultados.innerHTML.substring(0, 200) + '...');
        } else {
            console.log('❌ Relatório de custos não foi exibido');
        }
        
        console.log('🎯 5. Verificando botões de exportação...');
        const btnExcel = document.querySelector('#exportarExcel');
        const btnPdf = document.querySelector('#exportarPdf');
        
        if (btnExcel && btnPdf) {
            console.log('✅ Botões de exportação encontrados');
            console.log('📤 Excel habilitado:', !btnExcel.disabled);
            console.log('📄 PDF habilitado:', !btnPdf.disabled);
        } else {
            console.log('❌ Botões de exportação não encontrados');
        }
        
        console.log('🏁 TESTE CONCLUÍDO!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar teste
testarRelatorios();
