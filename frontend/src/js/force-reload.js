// Força um reload dos dados e aplica todas as correções
// Este script deve garantir que os problemas sejam resolvidos

console.log('🔄 [FORCE-RELOAD] Iniciando reload forçado...');

// Aguardar um pouco para todos os scripts carregarem
setTimeout(async () => {
    console.log('🔄 [FORCE-RELOAD] Verificando e corrigindo sistema...');
    
    try {
        // 1. Verificar se apiClient existe e está funcionando
        if (window.apiClient && window.dbApi) {
            console.log('✅ [FORCE-RELOAD] APIs detectadas');
                  // 2. Forçar recarregamento de despesas primeiro
        console.log('🔄 [FORCE-RELOAD] Forçando reload de despesas...');
        try {
            const despesas = await window.dbApi.buscarDespesas();
            console.log(`✅ [FORCE-RELOAD] ${despesas.length} despesas carregadas`);
            window.despesas = despesas;
        } catch (error) {
            console.error('❌ [FORCE-RELOAD] Erro ao carregar despesas:', error);
        }
        
        // 3. Forçar recarregamento de abastecimentos
        console.log('🔄 [FORCE-RELOAD] Forçando reload de abastecimentos...');            try {
                const abastecimentos = await window.dbApi.buscarAbastecimentos();
                console.log(`✅ [FORCE-RELOAD] ${abastecimentos.length} abastecimentos carregados`);
                
                // 4. Atualizar variáveis globais
                window.abastecimentos = abastecimentos;
                  // 5. Forçar atualização do dashboard
                if (typeof updateDashboard === 'function') {
                    console.log('🔄 [FORCE-RELOAD] Atualizando dashboard...');
                    updateDashboard();
                }
                
                // 6. Forçar renderização das tabelas
                if (typeof renderAbastecimentos === 'function') {
                    console.log('🔄 [FORCE-RELOAD] Renderizando tabela de abastecimentos...');
                    renderAbastecimentos();
                }
                
                if (typeof renderCaminhoes === 'function') {
                    console.log('🔄 [FORCE-RELOAD] Renderizando tabela de caminhões...');
                    renderCaminhoes();
                }
                  // 7. Atualizar gráficos (incluindo despesas)
                if (typeof updateCharts === 'function') {
                    console.log('🔄 [FORCE-RELOAD] Atualizando gráficos...');
                    updateCharts();
                }
                  // 8. Forçar atualização específica dos gráficos de despesas
                setTimeout(() => {
                    if (typeof updateDespesasChartsOnly === 'function' && window.despesas && window.despesas.length > 0) {
                        console.log('🔄 [FORCE-RELOAD] Atualizando gráficos de despesas...');
                        updateDespesasChartsOnly();
                    }
                }, 500);
                
                console.log('🎉 [FORCE-RELOAD] Reload completo realizado com sucesso!');
                
                // Mostrar notificação de sucesso
                if (window.Swal) {
                    Swal.fire({
                        title: 'Sistema Atualizado!',
                        text: 'Dados recarregados com sucesso',
                        icon: 'success',
                        timer: 3000,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                }
                
            } catch (error) {
                console.error('❌ [FORCE-RELOAD] Erro ao recarregar abastecimentos:', error);
                
                // Mostrar erro ao usuário
                if (window.Swal) {
                    Swal.fire({
                        title: 'Erro no Carregamento',
                        text: 'Problemas ao carregar dados. Recarregue a página.',
                        icon: 'error',
                        confirmButtonText: 'Recarregar',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.reload();
                        }
                    });
                }
            }
            
        } else {
            console.log('⏳ [FORCE-RELOAD] APIs não disponíveis ainda, tentando novamente...');
            setTimeout(() => window.location.reload(), 5000);
        }
        
    } catch (error) {
        console.error('❌ [FORCE-RELOAD] Erro geral:', error);
    }
    
}, 3000); // Aguardar 3 segundos para todos os scripts carregarem
