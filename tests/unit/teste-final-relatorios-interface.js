// Script final para testar relatórios via interface correta
// Execute este script no console do navegador (F12) após abrir http://localhost:8080

console.log('🚀 INICIANDO TESTE FINAL DOS RELATÓRIOS');

// Função para aguardar e simular submit de formulário
function submitForm(formId, testName) {
    return new Promise((resolve) => {
        const form = document.getElementById(formId);
        if (form) {
            console.log(`📋 Encontrado formulário: ${formId}`);
            
            // Simular submit do formulário
            const event = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(event);
            console.log(`✅ Submit enviado para ${testName}`);
            
            // Aguardar processamento
            setTimeout(() => {
                resolve(true);
            }, 3000);
        } else {
            console.error(`❌ Formulário ${formId} não encontrado`);
            resolve(false);
        }
    });
}

// Função principal de teste
async function testarRelatoriosInterface() {
    try {
        console.log('1. Verificando estado da página...');
        
        // Verificar se estamos na página correta
        if (!document.getElementById('relatoriosSection')) {
            console.error('❌ Seção de relatórios não encontrada. Certifique-se de estar na página correta.');
            return;
        }
        
        console.log('2. Verificando dados carregados...');
        
        // Aguardar dados serem carregados
        let tentativas = 0;
        while ((!window.caminhoes || !window.abastecimentos) && tentativas < 30) {
            await new Promise(resolve => setTimeout(resolve, 500));
            tentativas++;
        }
        
        if (!window.caminhoes || !window.abastecimentos) {
            console.error('❌ Dados não carregados após 15 segundos');
            console.log('window.caminhoes:', window.caminhoes);
            console.log('window.abastecimentos:', window.abastecimentos);
            return;
        }
        
        console.log('✅ Dados carregados:');
        console.log(`- Caminhões: ${window.caminhoes.length}`);
        console.log(`- Abastecimentos: ${window.abastecimentos.length}`);
        
        console.log('3. Navegando para seção de relatórios...');
        
        // Mostrar seção de relatórios
        const relatoriosSection = document.getElementById('relatoriosSection');
        if (relatoriosSection) {
            // Esconder outras seções
            document.querySelectorAll('[id$="Section"]').forEach(section => {
                section.style.display = 'none';
            });
            relatoriosSection.style.display = 'block';
            console.log('✅ Seção de relatórios ativada');
        }
        
        // Aguardar um pouco para renderização
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('4. Preenchendo formulário de consumo...');
        
        // Preencher formulário de consumo
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
            
            console.log('✅ Formulário de consumo preenchido');
            console.log(`  Data início: ${dataInicio.value}`);
            console.log(`  Data fim: ${dataFim.value}`);
            console.log(`  Caminhão: ${caminhaoSelect.value}`);
        } else {
            console.error('❌ Elementos do formulário de consumo não encontrados');
        }
        
        console.log('5. Testando relatório de consumo...');
        
        // Testar relatório de consumo
        const successConsumo = await submitForm('relatorioConsumoForm', 'Relatório de Consumo');
        
        if (successConsumo) {
            // Verificar se o relatório foi gerado
            const resultados = document.getElementById('relatorioResultados');
            if (resultados && resultados.innerHTML.includes('Relatório de Consumo')) {
                console.log('✅ Relatório de consumo gerado com sucesso!');
                
                // Verificar elementos específicos
                const tabelas = resultados.querySelectorAll('table');
                const graficos = resultados.querySelectorAll('canvas');
                
                console.log(`📊 Tabelas encontradas: ${tabelas.length}`);
                console.log(`📈 Gráficos encontrados: ${graficos.length}`);
                
                if (tabelas.length > 0) {
                    console.log('✅ Dados tabulares presentes');
                }
                
                if (graficos.length > 0) {
                    console.log('✅ Elementos gráficos presentes');
                }
                
            } else {
                console.log('⚠️ Relatório de consumo pode não ter sido gerado corretamente');
                console.log('Conteúdo atual:', resultados ? resultados.innerHTML.substring(0, 300) : 'Elemento não encontrado');
            }
        }
        
        console.log('6. Preenchendo formulário de custos...');
        
        // Preencher formulário de custos
        const mesInicio = document.getElementById('mesInicio');
        const mesFim = document.getElementById('mesFim');
        const tipoAgrupamento = document.getElementById('tipoAgrupamento');
        
        if (mesInicio && mesFim && tipoAgrupamento) {
            const agora = new Date();
            const anoAtual = agora.getFullYear();
            const mesAtual = agora.getMonth() + 1;
            
            mesInicio.value = `${anoAtual}-${mesAtual.toString().padStart(2, '0')}`;
            mesFim.value = `${anoAtual}-${mesAtual.toString().padStart(2, '0')}`;
            tipoAgrupamento.value = 'caminhao';
            
            console.log('✅ Formulário de custos preenchido');
            console.log(`  Mês início: ${mesInicio.value}`);
            console.log(`  Mês fim: ${mesFim.value}`);
            console.log(`  Agrupamento: ${tipoAgrupamento.value}`);
        } else {
            console.error('❌ Elementos do formulário de custos não encontrados');
        }
        
        console.log('7. Testando relatório de custos...');
        
        // Testar relatório de custos
        const successCustos = await submitForm('relatorioCustosForm', 'Relatório de Custos');
        
        if (successCustos) {
            // Verificar se o relatório foi gerado
            const resultados = document.getElementById('relatorioResultados');
            if (resultados && resultados.innerHTML.includes('Relatório de Custos')) {
                console.log('✅ Relatório de custos gerado com sucesso!');
                
                // Verificar elementos específicos
                const tabelas = resultados.querySelectorAll('table');
                const graficos = resultados.querySelectorAll('canvas');
                const cards = resultados.querySelectorAll('.card');
                
                console.log(`📊 Tabelas encontradas: ${tabelas.length}`);
                console.log(`📈 Gráficos encontrados: ${graficos.length}`);
                console.log(`📋 Cards de resumo encontrados: ${cards.length}`);
                
            } else {
                console.log('⚠️ Relatório de custos pode não ter sido gerado corretamente');
                console.log('Conteúdo atual:', resultados ? resultados.innerHTML.substring(0, 300) : 'Elemento não encontrado');
            }
        }
        
        console.log('8. Testando funções de exportação...');
        
        // Verificar botões de exportação
        const btnExcel = document.getElementById('exportarExcel');
        const btnPdf = document.getElementById('exportarPdf');
        
        console.log(`📄 Botão Excel: ${btnExcel ? '✅' : '❌'}`);
        console.log(`📄 Botão PDF: ${btnPdf ? '✅' : '❌'}`);
        
        if (btnExcel) {
            console.log('ℹ️ Exportação Excel disponível (clique manual necessário)');
        }
        
        if (btnPdf) {
            console.log('ℹ️ Exportação PDF disponível (clique manual necessário)');
        }
        
        console.log('🎉 TESTE CONCLUÍDO!');
        
        // Resumo final
        console.log('\n📋 RESUMO FINAL:');
        console.log(`✅ Dados carregados: ${window.caminhoes && window.abastecimentos ? 'SIM' : 'NÃO'}`);
        console.log(`✅ Seção de relatórios: ${document.getElementById('relatoriosSection') ? 'SIM' : 'NÃO'}`);
        console.log(`✅ Formulário de consumo: ${document.getElementById('relatorioConsumoForm') ? 'SIM' : 'NÃO'}`);
        console.log(`✅ Formulário de custos: ${document.getElementById('relatorioCustosForm') ? 'SIM' : 'NÃO'}`);
        console.log(`✅ Área de resultados: ${document.getElementById('relatorioResultados') ? 'SIM' : 'NÃO'}`);
        console.log(`✅ Botões de exportação: ${document.getElementById('exportarExcel') && document.getElementById('exportarPdf') ? 'SIM' : 'NÃO'}`);
        
        const resultadosFinais = document.getElementById('relatorioResultados');
        if (resultadosFinais && resultadosFinais.innerHTML.trim()) {
            console.log('✅ RELATÓRIOS FUNCIONANDO CORRETAMENTE! 🎉');
        } else {
            console.log('⚠️ Relatórios podem precisar de ajustes adicionais');
        }
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Executar o teste automaticamente
console.log('Aguarde 2 segundos para iniciar o teste...');
setTimeout(testarRelatoriosInterface, 2000);
