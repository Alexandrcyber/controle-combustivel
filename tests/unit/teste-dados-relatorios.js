// Teste específico para verificar carregamento de dados nos relatórios
console.log('🔍 Iniciando teste de carregamento de dados...');

async function testarCarregamentoDados() {
    try {
        // Verificar se existe window.dbApi
        if (!window.dbApi) {
            console.error('❌ window.dbApi não está disponível');
            return;
        }

        console.log('✅ window.dbApi disponível');

        // Testar busca de caminhões
        const caminhoes = await window.dbApi.buscarCaminhoes();
        console.log(`📦 Caminhões encontrados: ${caminhoes.length}`);
        console.log('Caminhões:', caminhoes);

        // Testar busca de abastecimentos
        const abastecimentos = await window.dbApi.buscarAbastecimentos();
        console.log(`⛽ Abastecimentos encontrados: ${abastecimentos.length}`);
        console.log('Abastecimentos:', abastecimentos);

        // Verificar variáveis globais
        console.log('🌐 Variáveis globais:');
        console.log(`window.caminhoes: ${window.caminhoes?.length || 'undefined'}`);
        console.log(`window.abastecimentos: ${window.abastecimentos?.length || 'undefined'}`);

        // Verificar se as variáveis estão sincronizadas
        if (window.caminhoes && window.abastecimentos) {
            console.log('✅ Variáveis globais estão definidas');
            
            // Testar função de relatório simples
            console.log('🧪 Testando geração de relatório...');
            
            if (window.abastecimentos.length > 0) {
                const primeiro = window.abastecimentos[0];
                console.log('Primeiro abastecimento:', primeiro);
                
                // Verificar campos essenciais
                const camposEssenciais = ['caminhao_id', 'km_inicial', 'km_final', 'valor_total', 'litros'];
                const camposFaltantes = [];
                
                camposEssenciais.forEach(campo => {
                    if (primeiro[campo] === undefined) {
                        camposFaltantes.push(campo);
                    }
                });
                
                if (camposFaltantes.length > 0) {
                    console.error(`❌ Campos faltantes: ${camposFaltantes.join(', ')}`);
                } else {
                    console.log('✅ Todos os campos essenciais estão presentes');
                    
                    // Testar conversão de valores
                    try {
                        const distancia = parseFloat(primeiro.km_final) - parseFloat(primeiro.km_inicial);
                        const valorTotal = parseFloat(primeiro.valor_total);
                        const litros = parseFloat(primeiro.litros);
                        
                        console.log(`✅ Conversões funcionando: ${distancia}km, R$${valorTotal.toFixed(2)}, ${litros}L`);
                    } catch (convError) {
                        console.error('❌ Erro nas conversões:', convError);
                    }
                }
            } else {
                console.warn('⚠️ Nenhum abastecimento encontrado para teste');
            }
        } else {
            console.error('❌ Variáveis globais não estão definidas');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Executar teste quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testarCarregamentoDados, 1000); // Aguardar 1 segundo após DOMContentLoaded
    });
} else {
    testarCarregamentoDados();
}

// Disponibilizar globalmente para execução manual
window.testarCarregamentoDados = testarCarregamentoDados;

console.log('💡 Execute window.testarCarregamentoDados() no console para testar manualmente');
