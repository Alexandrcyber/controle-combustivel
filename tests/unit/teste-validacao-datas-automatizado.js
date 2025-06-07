// Teste automatizado para validação de datas PDF
// Data: 7 de junho de 2025

console.log('🧪 Iniciando teste automatizado de validação de datas para PDF...');

// Função para simular clique em elemento
function simularClique(elementId) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.click();
        return true;
    }
    return false;
}

// Função para definir valor em campo
function definirValor(elementId, valor) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.value = valor;
        return true;
    }
    return false;
}

// Função para verificar se alerta foi exibido
function verificarAlerta() {
    // Verificar se SweetAlert2 está ativo
    const sweetAlert = document.querySelector('.swal2-container');
    if (sweetAlert) {
        console.log('✅ Alerta SweetAlert2 detectado!');
        const titulo = document.querySelector('.swal2-title')?.textContent;
        const texto = document.querySelector('.swal2-html-container')?.textContent;
        console.log('📋 Título:', titulo);
        console.log('📋 Texto:', texto);
        
        // Fechar o alerta
        const btnOk = document.querySelector('.swal2-confirm');
        if (btnOk) {
            btnOk.click();
        }
        
        return { detectado: true, titulo, texto };
    }
    
    return { detectado: false };
}

// Teste 1: Verificar se as funções existem
function teste1_verificarFuncoes() {
    console.log('\n🔍 Teste 1: Verificando se as funções existem...');
    
    const funcoes = {
        exportarPdfCompleto: typeof window.exportarPdfCompleto === 'function',
        exportarPdfCustos: typeof window.exportarPdfCustos === 'function',
        AlertError: typeof window.AlertError === 'object'
    };
    
    console.log('📊 Resultado:', funcoes);
    
    if (funcoes.exportarPdfCompleto && funcoes.exportarPdfCustos) {
        console.log('✅ Teste 1 PASSOU: Todas as funções necessárias estão disponíveis');
        return true;
    } else {
        console.log('❌ Teste 1 FALHOU: Funções não estão disponíveis');
        return false;
    }
}

// Teste 2: Verificar campos do formulário
function teste2_verificarCampos() {
    console.log('\n🔍 Teste 2: Verificando se os campos existem...');
    
    const campos = {
        // Campos do relatório de consumo
        dataInicio: !!document.getElementById('dataInicio'),
        dataFim: !!document.getElementById('dataFim'),
        caminhaoSelect: !!document.getElementById('caminhaoSelect'),
        exportarPdfCompleto: !!document.getElementById('exportarPdfCompleto'),
        
        // Campos do relatório de custos
        custosDataInicio: !!document.getElementById('custosDataInicio'),
        custosDataFim: !!document.getElementById('custosDataFim'),
        caminhaoCustosSelect: !!document.getElementById('caminhaoCustosSelect'),
        exportarPdf: !!document.getElementById('exportarPdf')
    };
    
    console.log('📊 Campos encontrados:', campos);
    
    const todosEncontrados = Object.values(campos).every(campo => campo);
    
    if (todosEncontrados) {
        console.log('✅ Teste 2 PASSOU: Todos os campos necessários estão presentes');
        return true;
    } else {
        console.log('❌ Teste 2 FALHOU: Alguns campos não foram encontrados');
        return false;
    }
}

// Teste 3: Testar validação do relatório de consumo
function teste3_validacaoConsumo() {
    console.log('\n🔍 Teste 3: Testando validação do relatório de consumo...');
    
    // Limpar campos de data
    definirValor('dataInicio', '');
    definirValor('dataFim', '');
    
    console.log('🧹 Campos limpos, tentando exportar PDF...');
    
    // Tentar exportar PDF
    if (typeof window.exportarPdfCompleto === 'function') {
        try {
            window.exportarPdfCompleto();
            
            // Aguardar um pouco para o alerta aparecer
            setTimeout(() => {
                const resultado = verificarAlerta();
                if (resultado.detectado) {
                    console.log('✅ Teste 3 PASSOU: Validação funcionou para relatório de consumo');
                    console.log('📋 Mensagem:', resultado.texto);
                } else {
                    console.log('❌ Teste 3 FALHOU: Alerta não foi exibido');
                }
            }, 100);
            
        } catch (error) {
            console.log('❌ Teste 3 ERRO:', error);
        }
    } else {
        console.log('❌ Teste 3 FALHOU: Função exportarPdfCompleto não encontrada');
    }
}

// Teste 4: Testar validação do relatório de custos
function teste4_validacaoCustos() {
    console.log('\n🔍 Teste 4: Testando validação do relatório de custos...');
    
    // Limpar campos de data
    definirValor('custosDataInicio', '');
    definirValor('custosDataFim', '');
    
    console.log('🧹 Campos limpos, tentando exportar PDF de custos...');
    
    // Tentar exportar PDF
    if (typeof window.exportarPdfCustos === 'function') {
        try {
            window.exportarPdfCustos();
            
            // Aguardar um pouco para o alerta aparecer
            setTimeout(() => {
                const resultado = verificarAlerta();
                if (resultado.detectado) {
                    console.log('✅ Teste 4 PASSOU: Validação funcionou para relatório de custos');
                    console.log('📋 Mensagem:', resultado.texto);
                } else {
                    console.log('❌ Teste 4 FALHOU: Alerta não foi exibido');
                }
            }, 100);
            
        } catch (error) {
            console.log('❌ Teste 4 ERRO:', error);
        }
    } else {
        console.log('❌ Teste 4 FALHOU: Função exportarPdfCustos não encontrada');
    }
}

// Executar todos os testes
function executarTodosOsTestes() {
    console.log('🚀 Executando bateria completa de testes...');
    console.log('⏰ Data/Hora:', new Date().toLocaleString('pt-BR'));
    
    setTimeout(() => teste1_verificarFuncoes(), 500);
    setTimeout(() => teste2_verificarCampos(), 1000);
    setTimeout(() => teste3_validacaoConsumo(), 1500);
    setTimeout(() => teste4_validacaoCustos(), 2500);
    
    setTimeout(() => {
        console.log('\n🏁 Bateria de testes concluída!');
        console.log('📊 Verifique os resultados acima para cada teste individual.');
    }, 3500);
}

// Aguardar carregamento completo da página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', executarTodosOsTestes);
} else {
    executarTodosOsTestes();
}

// Exportar função para uso manual
window.testarValidacoesPDF = executarTodosOsTestes;
