// Script de teste para validar o funcionamento do sistema de alertas
// Controle de Combustível - Teste de Integração

console.log('🧪 Iniciando teste de integração do sistema de alertas...');

// Aguardar que o DOM esteja completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM carregado');
    
    // Verificar se o SweetAlert2 está disponível
    if (typeof Swal !== 'undefined') {
        console.log('✅ SweetAlert2 está disponível');
    } else {
        console.error('❌ SweetAlert2 não está disponível');
        return;
    }
    
    // Verificar se o sistema de alertas personalizado está disponível
    if (typeof AlertSuccess !== 'undefined' && 
        typeof AlertError !== 'undefined' && 
        typeof AlertWarning !== 'undefined' && 
        typeof AlertInfo !== 'undefined' && 
        typeof AlertConfirm !== 'undefined' && 
        typeof AlertToast !== 'undefined') {
        console.log('✅ Sistema de alertas personalizado está disponível');
    } else {
        console.error('❌ Sistema de alertas personalizado não está disponível');
        return;
    }      // Aguardar um pouco para que tudo esteja carregado
    setTimeout(function() {
        console.log('🎯 Sistema de alertas carregado e pronto para uso');
        
        // Botão de teste removido conforme solicitado
        /*
        // Adicionar botão de teste rápido no dashboard (apenas para desenvolvimento)
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection && window.DEBUG_MODE) {
            const testButton = document.createElement('button');
            testButton.className = 'btn btn-outline-secondary btn-sm me-2';
            testButton.innerHTML = '<i class="bi bi-check-circle"></i> Testar Alertas';
            testButton.onclick = function() {
                console.log('🧪 Teste manual de alertas iniciado...');
                AlertSuccess.show('Teste Manual', 'Os alertas estão funcionando perfeitamente!');
            };
            
            // Procurar por uma área adequada para adicionar o botão
            const cardBody = dashboardSection.querySelector('.card-body');
            if (cardBody) {
                cardBody.appendChild(testButton);
                console.log('✅ Botão de teste adicionado ao dashboard (modo DEBUG)');
            }
        }
        */
        
    }, 1000);
});

// Função global para testar todos os tipos de alertas (apenas para desenvolvimento)
window.testarTodosAlertas = function() {
    if (!window.DEBUG_MODE) {
        console.log('ℹ️ Testes de alertas disponíveis apenas no modo DEBUG');
        return;
    }
    
    console.log('🧪 Testando todos os tipos de alertas...');
    
    let delay = 0;
    
    // Teste de toast de sucesso
    setTimeout(() => AlertToast.success('Toast de sucesso!'), delay += 500);
    
    // Teste de toast de erro
    setTimeout(() => AlertToast.error('Toast de erro!'), delay += 500);
    
    // Teste de toast de aviso
    setTimeout(() => AlertToast.warning('Toast de aviso!'), delay += 500);
    
    // Teste de toast de info
    setTimeout(() => AlertToast.info('Toast de informação!'), delay += 500);
    
    // Teste de alerta de sucesso
    setTimeout(() => AlertSuccess.show('Sucesso!', 'Operação realizada com sucesso!'), delay += 1000);
    
    // Teste de alerta de erro
    setTimeout(() => AlertError.show('Erro!', 'Algo deu errado!'), delay += 3000);
    
    // Teste de alerta de aviso
    setTimeout(() => AlertWarning.show('Atenção!', 'Verifique os dados!'), delay += 3000);
    
    // Teste de alerta de informação
    setTimeout(() => AlertInfo.show('Informação', 'Processo concluído!'), delay += 3000);
    
    console.log('✅ Teste de todos os alertas agendado');
};

// Adicionar comando de teste ao console apenas em modo DEBUG
if (window.DEBUG_MODE) {
    console.log('💡 Para testar todos os alertas manualmente, execute: testarTodosAlertas()');
};
