// Script para testar o mapeamento de campos entre frontend e backend
// Execute este script no console do navegador

async function testarMapeamentoCampos() {
    console.log('🧪 Iniciando teste de mapeamento de campos...');
    
    try {
        // 1. Buscar caminhões existentes
        console.log('1️⃣ Buscando caminhões...');
        const caminhoes = await window.dbApi.buscarCaminhoes();
        console.log('Caminhões encontrados:', caminhoes);
        
        if (caminhoes.length === 0) {
            throw new Error('Nenhum caminhão encontrado. Crie um caminhão primeiro.');
        }
        
        // 2. Criar dados de teste para abastecimento
        const caminhaoTeste = caminhoes[0];
        console.log('Usando caminhão:', caminhaoTeste);
        
        const hoje = new Date();
        const dadosAbastecimento = {
            data: hoje.toISOString().split('T')[0],
            periodoInicio: hoje.toISOString().split('T')[0],
            periodoFim: hoje.toISOString().split('T')[0],
            caminhaoId: caminhaoTeste.id, // camelCase (frontend)
            motorista: 'Motorista Teste Mapeamento',
            kmInicial: 5000, // camelCase (frontend)
            kmFinal: 5200, // camelCase (frontend)
            litros: 50,
            valorLitro: 6.0, // camelCase (frontend)
            valorTotal: 300, // camelCase (frontend)
            posto: 'Posto Teste Mapeamento',
            observacoes: 'Teste de mapeamento entre frontend e backend'
        };
        
        console.log('2️⃣ Dados de teste (formato frontend):', dadosAbastecimento);
        
        // 3. Salvar abastecimento via frontend API
        console.log('3️⃣ Salvando abastecimento via frontend...');
        const abastecimentoSalvo = await window.dbApi.salvarAbastecimento(dadosAbastecimento);
        console.log('Abastecimento salvo (resposta mapeada):', abastecimentoSalvo);
        
        // 4. Verificar se os campos foram mapeados corretamente
        console.log('4️⃣ Verificando mapeamento...');
        
        // Verificar se o abastecimento salvo tem os campos em camelCase (formato frontend)
        const camposEsperados = ['caminhaoId', 'periodoInicio', 'periodoFim', 'kmInicial', 'kmFinal', 'valorLitro', 'valorTotal'];
        const camposMissing = camposEsperados.filter(campo => !(campo in abastecimentoSalvo));
        
        if (camposMissing.length > 0) {
            throw new Error(`Campos não mapeados corretamente: ${camposMissing.join(', ')}`);
        }
        
        console.log('✅ Mapeamento de campos funcionando corretamente!');
        
        // 5. Buscar todos os abastecimentos para verificar se o novo aparece
        console.log('5️⃣ Buscando todos os abastecimentos...');
        const abastecimentos = await window.dbApi.buscarAbastecimentos();
        console.log('Abastecimentos encontrados:', abastecimentos);
        
        // Verificar se o abastecimento criado está na lista
        const abastecimentoEncontrado = abastecimentos.find(a => a.id === abastecimentoSalvo.id);
        if (!abastecimentoEncontrado) {
            throw new Error('Abastecimento criado não foi encontrado na lista');
        }
        
        console.log('✅ Abastecimento encontrado na lista:', abastecimentoEncontrado);
        
        // 6. Limpar dados de teste
        console.log('6️⃣ Limpando dados de teste...');
        await window.dbApi.excluirAbastecimento(abastecimentoSalvo.id);
        console.log('✅ Dados de teste removidos');
        
        console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
        console.log('O mapeamento de campos entre frontend e backend está funcionando corretamente.');
        
        return {
            sucesso: true,
            mensagem: 'Mapeamento de campos funcionando corretamente',
            abastecimentoTeste: abastecimentoSalvo
        };
        
    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
        return {
            sucesso: false,
            mensagem: error.message,
            erro: error
        };
    }
}

// Executar teste automaticamente
console.log('Para executar o teste, execute: testarMapeamentoCampos()');

// Se window.dbApi estiver disponível, executar automaticamente
if (typeof window !== 'undefined' && window.dbApi) {
    testarMapeamentoCampos().then(resultado => {
        if (resultado.sucesso) {
            console.log('🎯 RESULTADO:', resultado.mensagem);
        } else {
            console.error('❌ FALHA:', resultado.mensagem);
        }
    });
}
