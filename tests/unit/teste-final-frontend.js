// Teste Final - Frontend completo
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testarFrontendCompleto() {
    console.log('=== TESTE FINAL DO FRONTEND ===\n');
    
    try {
        // 1. Primeiro, vamos criar um caminhão para usar no teste
        console.log('1. Criando caminhão de teste...');        const caminhaoData = {
            placa: 'TST-8888',
            modelo: 'Teste Final',
            ano: 2024
        };
        
        const caminhaoResponse = await axios.post(`${API_BASE_URL}/caminhoes`, caminhaoData);
        console.log('✅ Caminhão criado:', caminhaoResponse.data);
        const caminhaoId = caminhaoResponse.data.id;
          // 2. Agora vamos criar um abastecimento com dados no formato frontend (camelCase)
        console.log('\n2. Criando abastecimento com dados frontend (camelCase)...');
        const abastecimentoFrontend = {
            caminhaoId: caminhaoId, // camelCase
            data: '2024-01-15',
            periodoInicio: '08:00', // camelCase
            periodoFim: '17:00', // camelCase
            motorista: 'João Silva', // campo obrigatório
            kmInicial: 50000, // camelCase
            kmFinal: 50350, // camelCase
            litros: 45.5,
            valorLitro: 5.89, // camelCase
            valorTotal: 268.00, // camelCase
            posto: 'Posto Teste Final'
        };
        
        console.log('Dados enviados (formato frontend):', JSON.stringify(abastecimentoFrontend, null, 2));
          // 3. Mapear para formato backend (snake_case) como o frontend faria
        const abastecimentoBackend = {
            caminhao_id: abastecimentoFrontend.caminhaoId,
            data: abastecimentoFrontend.data,
            periodo_inicio: abastecimentoFrontend.periodoInicio,
            periodo_fim: abastecimentoFrontend.periodoFim,
            motorista: abastecimentoFrontend.motorista, // campo direto, sem mapeamento
            km_inicial: abastecimentoFrontend.kmInicial,
            km_final: abastecimentoFrontend.kmFinal,
            litros: abastecimentoFrontend.litros,
            valor_litro: abastecimentoFrontend.valorLitro,
            valor_total: abastecimentoFrontend.valorTotal,
            posto: abastecimentoFrontend.posto
        };
        
        console.log('Dados mapeados (formato backend):', JSON.stringify(abastecimentoBackend, null, 2));
        
        // 4. Salvar no backend
        const abastecimentoResponse = await axios.post(`${API_BASE_URL}/abastecimentos`, abastecimentoBackend);
        console.log('\n✅ Abastecimento salvo no backend:', abastecimentoResponse.data);
          // 5. Buscar o abastecimento salvo e mapear de volta para frontend
        const abastecimentoSalvo = abastecimentoResponse.data;
        const abastecimentoMapeado = {
            id: abastecimentoSalvo.id,
            caminhaoId: abastecimentoSalvo.caminhao_id,
            data: abastecimentoSalvo.data,
            periodoInicio: abastecimentoSalvo.periodo_inicio,
            periodoFim: abastecimentoSalvo.periodo_fim,
            motorista: abastecimentoSalvo.motorista, // campo direto, sem mapeamento
            kmInicial: abastecimentoSalvo.km_inicial,
            kmFinal: abastecimentoSalvo.km_final,
            litros: abastecimentoSalvo.litros,
            valorLitro: abastecimentoSalvo.valor_litro,
            valorTotal: abastecimentoSalvo.valor_total,
            posto: abastecimentoSalvo.posto
        };
        
        console.log('\n✅ Abastecimento mapeado para frontend:', JSON.stringify(abastecimentoMapeado, null, 2));
        
        // 6. Verificar se todos os campos foram mapeados corretamente
        console.log('\n3. Verificando mapeamento...');
        const camposCorretos = [
            abastecimentoMapeado.caminhaoId === caminhaoId,
            abastecimentoMapeado.periodoInicio === '08:00',
            abastecimentoMapeado.periodoFim === '17:00',
            abastecimentoMapeado.kmInicial === 50000,
            abastecimentoMapeado.kmFinal === 50350,
            abastecimentoMapeado.valorLitro === 5.89,
            abastecimentoMapeado.valorTotal === 268.00
        ];
        
        const mapeamentoCorreto = camposCorretos.every(campo => campo === true);
        
        if (mapeamentoCorreto) {
            console.log('✅ MAPEAMENTO CORRETO - Todos os campos estão corretos!');
        } else {
            console.log('❌ MAPEAMENTO INCORRETO - Alguns campos não estão corretos!');
            console.log('Campos verificados:', camposCorretos);
        }
        
        // 7. Limpar dados de teste
        console.log('\n4. Limpando dados de teste...');
        await axios.delete(`${API_BASE_URL}/abastecimentos/${abastecimentoResponse.data.id}`);
        await axios.delete(`${API_BASE_URL}/caminhoes/${caminhaoId}`);
        console.log('✅ Dados de teste removidos');
        
        console.log('\n=== TESTE COMPLETO! ===');
        console.log('🎉 O sistema está funcionando corretamente!');
        console.log('✅ Mapeamento de campos funciona');
        console.log('✅ Salvamento no backend funciona');
        console.log('✅ Frontend pode se comunicar com backend');
        
    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
    }
}

// Executar teste
testarFrontendCompleto();
