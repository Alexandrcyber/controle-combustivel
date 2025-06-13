// Patch de emergência para garantir que this.request funcione
// Este script deve ser carregado APÓS api.js para garantir que a correção seja aplicada

console.log('🔧 [PATCH] Aplicando patch de emergência para this.request...');

// Aguardar o apiClient estar disponível
function applyEmergencyPatch() {
    if (window.apiClient) {
        console.log('🔧 [PATCH] Aplicando correções...');
        
        // Função helper para criar request seguro
        function createSafeRequest(context, methodName) {
            return async function(endpoint, options = {}) {
                try {
                    if (window.apiClient && typeof window.apiClient.request === 'function') {
                        return await window.apiClient.request(endpoint, options);
                    } else {
                        throw new Error('apiClient.request não disponível');
                    }
                } catch (error) {
                    console.error(`[PATCH] Erro em ${methodName}:`, error);
                    throw error;
                }
            };
        }
        
        // Patch para abastecimentos
        if (window.apiClient.abastecimentos) {
            console.log('🔧 [PATCH] Corrigindo abastecimentos...');
            
            // Salvar função original se existir
            const originalBuscarTodos = window.apiClient.abastecimentos.buscarTodos;
            
            // Substituir por versão segura
            window.apiClient.abastecimentos.buscarTodos = async function() {
                console.log('[PATCH] abastecimentos.buscarTodos chamado');
                
                try {
                    const safeRequest = createSafeRequest(this, 'abastecimentos.buscarTodos');
                    const result = await safeRequest('/abastecimentos');
                    
                    // Mapear campos
                    return result.map(abastecimento => {
                        const { caminhao_id, periodo_inicio, periodo_fim, km_inicial, km_final, valor_litro, valor_total, ...resto } = abastecimento;
                        return {
                            ...resto,
                            caminhaoId: caminhao_id,
                            periodoInicio: periodo_inicio,
                            periodoFim: periodo_fim,
                            kmInicial: parseFloat(km_inicial) || 0,
                            kmFinal: parseFloat(km_final) || 0,
                            valorLitro: parseFloat(valor_litro) || 0,
                            valorTotal: parseFloat(valor_total) || 0,
                            litros: parseFloat(abastecimento.litros) || 0
                        };
                    });
                } catch (error) {
                    console.error('[PATCH] Erro em buscarTodos:', error);
                    return [];
                }
            };
            
            // Forçar bind do request
            window.apiClient.abastecimentos.request = createSafeRequest(window.apiClient.abastecimentos, 'abastecimentos');
        }
        
        // Patch para caminhões
        if (window.apiClient.caminhoes) {
            window.apiClient.caminhoes.request = createSafeRequest(window.apiClient.caminhoes, 'caminhoes');
        }
        
        // Patch para despesas
        if (window.apiClient.despesas) {
            window.apiClient.despesas.request = createSafeRequest(window.apiClient.despesas, 'despesas');
        }
        
        console.log('✅ [PATCH] Patches aplicados com sucesso!');
        
        // Testar se funciona
        setTimeout(async () => {
            try {
                console.log('🧪 [PATCH] Testando abastecimentos...');
                const abastecimentos = await window.apiClient.abastecimentos.buscarTodos();
                console.log(`✅ [PATCH] Teste bem-sucedido: ${abastecimentos.length} abastecimentos encontrados`);
            } catch (error) {
                console.error('❌ [PATCH] Teste falhou:', error);
            }
        }, 1000);
        
    } else {
        console.log('⏳ [PATCH] Aguardando apiClient...');
        setTimeout(applyEmergencyPatch, 500);
    }
}

// Aplicar patch imediatamente e também após carregamento
applyEmergencyPatch();

// Aplicar novamente quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEmergencyPatch);
} else {
    setTimeout(applyEmergencyPatch, 100);
}
