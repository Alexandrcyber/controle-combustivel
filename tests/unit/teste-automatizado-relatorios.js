// Teste automatizado dos relatórios usando Node.js
const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 INICIANDO TESTE AUTOMATIZADO DOS RELATÓRIOS');

// Função para verificar se um serviço está rodando
function verificarServico(porta) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${porta}`, (res) => {
            resolve(true);
        });
        req.on('error', () => {
            resolve(false);
        });
        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

// Função para fazer requisição HTTP
function fazerRequisicao(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    resolve(data);
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function executarTeste() {
    try {
        console.log('📡 1. Verificando serviços...');
        
        const backendAtivo = await verificarServico(3001);
        const frontendAtivo = await verificarServico(8080);
        
        console.log(`   Backend (porta 3001): ${backendAtivo ? '✅ Ativo' : '❌ Inativo'}`);
        console.log(`   Frontend (porta 8080): ${frontendAtivo ? '✅ Ativo' : '❌ Inativo'}`);
        
        if (!backendAtivo || !frontendAtivo) {
            console.log('⚠️  Alguns serviços não estão ativos. Verifique se os servidores estão rodando.');
            return;
        }
        
        console.log('📊 2. Verificando dados na API...');
        
        const caminhoes = await fazerRequisicao('http://localhost:3001/api/caminhoes');
        const abastecimentos = await fazerRequisicao('http://localhost:3001/api/abastecimentos');
        
        console.log(`   Caminhões: ${Array.isArray(caminhoes) ? caminhoes.length : 'Erro ao carregar'}`);
        console.log(`   Abastecimentos: ${Array.isArray(abastecimentos) ? abastecimentos.length : 'Erro ao carregar'}`);
        
        if (!Array.isArray(caminhoes) || !Array.isArray(abastecimentos)) {
            console.log('❌ Erro ao carregar dados da API');
            return;
        }
        
        if (caminhoes.length === 0 || abastecimentos.length === 0) {
            console.log('⚠️  Dados insuficientes para gerar relatórios');
            console.log('   Certifique-se de que há caminhões e abastecimentos cadastrados');
            return;
        }
        
        console.log('🎯 3. Simulando lógica de relatórios...');
        
        // Simular a lógica de relatório de consumo
        const dataInicio = '2025-01-01';
        const dataFim = '2025-12-31';
        
        const abastecimentosFiltrados = abastecimentos.filter(a => {
            const dataAbastecimento = new Date(a.data).toISOString().split('T')[0];
            return dataAbastecimento >= dataInicio && dataAbastecimento <= dataFim;
        });
        
        console.log(`   Abastecimentos no período ${dataInicio} a ${dataFim}: ${abastecimentosFiltrados.length}`);
        
        // Simular agrupamento por caminhão
        const dadosPorCaminhao = {};
        abastecimentosFiltrados.forEach(abastecimento => {
            const caminhaoId = abastecimento.caminhao_id;
            if (!dadosPorCaminhao[caminhaoId]) {
                const caminhao = caminhoes.find(c => c.id === caminhaoId);
                dadosPorCaminhao[caminhaoId] = {
                    placa: caminhao ? caminhao.placa : 'N/A',
                    modelo: caminhao ? caminhao.modelo : 'N/A',
                    totalLitros: 0,
                    totalKm: 0,
                    totalValor: 0,
                    abastecimentos: 0
                };
            }
            
            const dados = dadosPorCaminhao[caminhaoId];
            dados.totalLitros += parseFloat(abastecimento.litros) || 0;
            dados.totalKm += (parseFloat(abastecimento.km_final) || 0) - (parseFloat(abastecimento.km_inicial) || 0);
            dados.totalValor += parseFloat(abastecimento.valor_total) || 0;
            dados.abastecimentos++;
        });
        
        console.log('📋 4. Resultados da simulação:');
        
        let temDados = false;
        Object.keys(dadosPorCaminhao).forEach(caminhaoId => {
            const dados = dadosPorCaminhao[caminhaoId];
            const consumoMedio = dados.totalKm > 0 ? (dados.totalKm / dados.totalLitros).toFixed(2) : 'N/A';
            console.log(`   📦 ${dados.placa} (${dados.modelo}):`);
            console.log(`      - Abastecimentos: ${dados.abastecimentos}`);
            console.log(`      - Total Litros: ${dados.totalLitros.toFixed(2)}`);
            console.log(`      - Total KM: ${dados.totalKm.toFixed(2)}`);
            console.log(`      - Consumo Médio: ${consumoMedio} km/l`);
            console.log(`      - Total Gasto: R$ ${dados.totalValor.toFixed(2)}`);
            temDados = true;
        });
        
        if (!temDados) {
            console.log('⚠️  Nenhum dado processado para relatórios');
        }
        
        console.log('✅ 5. TESTE CONCLUÍDO!');
        console.log('\n📝 PRÓXIMOS PASSOS:');
        console.log('1. Abra http://localhost:8080 no navegador');
        console.log('2. Vá para a aba "Relatórios"');
        console.log('3. Cole o código do arquivo "teste-funcoes-rapido.js" no console (F12)');
        console.log('4. Teste os formulários manualmente');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

// Executar teste
executarTeste();
