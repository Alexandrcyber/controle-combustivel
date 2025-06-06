// Script para testar o sistema de relatórios
// Execute este script no console do navegador para verificar se os relatórios estão funcionando

async function testarRelatorios() {
    console.log('🧪 INICIANDO TESTE DO SISTEMA DE RELATÓRIOS');
    console.log('===============================================');
    
    try {
        // 1. Verificar se as variáveis globais estão disponíveis
        console.log('\n1️⃣ Verificando variáveis globais...');
        console.log('window.caminhoes:', window.caminhoes ? window.caminhoes.length : 'undefined');
        console.log('window.abastecimentos:', window.abastecimentos ? window.abastecimentos.length : 'undefined');
        
        // 2. Verificar se as funções de relatório existem
        console.log('\n2️⃣ Verificando funções de relatório...');
        console.log('gerarRelatorioConsumo:', typeof gerarRelatorioConsumo);
        console.log('gerarRelatorioCustos:', typeof gerarRelatorioCustos);
        
        // 3. Buscar dados da API diretamente
        console.log('\n3️⃣ Buscando dados da API...');
        const caminhoes = await window.dbApi.buscarCaminhoes();
        const abastecimentos = await window.dbApi.buscarAbastecimentos();
        
        console.log(`✅ Caminhões encontrados: ${caminhoes.length}`);
        console.log(`✅ Abastecimentos encontrados: ${abastecimentos.length}`);
        
        if (caminhoes.length > 0) {
            console.log('📊 Primeiro caminhão:', caminhoes[0]);
        }
        
        if (abastecimentos.length > 0) {
            console.log('⛽ Primeiro abastecimento:', abastecimentos[0]);
        }
        
        // 4. Simular preenchimento do formulário de relatório de consumo
        console.log('\n4️⃣ Testando relatório de consumo...');
        
        // Preencher campos necessários
        const dataInicio = document.getElementById('dataInicio');
        const dataFim = document.getElementById('dataFim');
        const caminhaoSelect = document.getElementById('caminhaoSelect');
        
        if (dataInicio && dataFim && caminhaoSelect) {
            // Definir período dos últimos 30 dias
            const hoje = new Date();
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(hoje.getDate() - 30);
            
            dataInicio.value = trintaDiasAtras.toISOString().split('T')[0];
            dataFim.value = hoje.toISOString().split('T')[0];
            caminhaoSelect.value = 'todos';
            
            console.log('📝 Campos preenchidos:');
            console.log('  Data início:', dataInicio.value);
            console.log('  Data fim:', dataFim.value);
            console.log('  Caminhão:', caminhaoSelect.value);
            
            // Tentar gerar relatório
            console.log('\n🔄 Executando gerarRelatorioConsumo...');
            gerarRelatorioConsumo(abastecimentos, caminhoes);
            
            // Verificar se o resultado foi exibido
            setTimeout(() => {
                const resultado = document.getElementById('relatorioResultados');
                if (resultado && resultado.innerHTML.trim()) {
                    console.log('✅ Relatório de consumo gerado com sucesso!');
                    console.log('📄 Conteúdo do relatório (primeiros 200 caracteres):');
                    console.log(resultado.innerHTML.substring(0, 200) + '...');
                } else {
                    console.log('❌ Relatório de consumo não foi gerado');
                    console.log('📄 Conteúdo atual do container:', resultado ? resultado.innerHTML : 'elemento não encontrado');
                }
            }, 1000);
            
        } else {
            console.log('❌ Elementos do formulário não encontrados');
            console.log('dataInicio:', !!dataInicio);
            console.log('dataFim:', !!dataFim);
            console.log('caminhaoSelect:', !!caminhaoSelect);
        }
        
        // 5. Testar relatório de custos
        console.log('\n5️⃣ Testando relatório de custos...');
        
        const mesInicio = document.getElementById('mesInicio');
        const mesFim = document.getElementById('mesFim');
        const tipoAgrupamento = document.getElementById('tipoAgrupamento');
        
        if (mesInicio && mesFim && tipoAgrupamento) {
            // Definir período do último mês
            const agora = new Date();
            const anoAtual = agora.getFullYear();
            const mesAtual = agora.getMonth() + 1;
            
            mesInicio.value = `${anoAtual}-${mesAtual.toString().padStart(2, '0')}`;
            mesFim.value = `${anoAtual}-${mesAtual.toString().padStart(2, '0')}`;
            tipoAgrupamento.value = 'caminhao';
            
            console.log('📝 Campos preenchidos:');
            console.log('  Mês início:', mesInicio.value);
            console.log('  Mês fim:', mesFim.value);
            console.log('  Agrupamento:', tipoAgrupamento.value);
            
            // Tentar gerar relatório
            console.log('\n🔄 Executando gerarRelatorioCustos...');
            gerarRelatorioCustos(abastecimentos, caminhoes);
            
            // Verificar resultado
            setTimeout(() => {
                const resultado = document.getElementById('relatorioResultados');
                if (resultado && resultado.innerHTML.trim()) {
                    console.log('✅ Relatório de custos gerado com sucesso!');
                } else {
                    console.log('❌ Relatório de custos não foi gerado');
                }
            }, 1500);
            
        } else {
            console.log('❌ Elementos do formulário de custos não encontrados');
        }
        
        console.log('\n✅ TESTE CONCLUÍDO');
        console.log('Aguarde alguns segundos para ver os resultados dos relatórios...');
        
    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Aguardar carregamento da página e executar teste
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testarRelatorios, 2000); // Aguardar 2 segundos após o carregamento
    });
} else {
    setTimeout(testarRelatorios, 1000); // Executar em 1 segundo se já carregou
}

console.log('📋 Script de teste dos relatórios carregado!');
console.log('💡 Execute manualmente: testarRelatorios()');
