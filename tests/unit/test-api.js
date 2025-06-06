// Funções para teste direto da API
async function testarApiCaminhao() {
    console.log('[TEST] Iniciando teste de API para caminhões');
    
    try {
        // Criar um caminhão de teste com dados aleatórios
        const randomNum = Math.floor(Math.random() * 10000);
        const testCaminhao = {
            placa: `TEST${randomNum}`,
            modelo: `Modelo Teste ${randomNum}`,
            ano: 2025,
            capacidade: 500,
            motorista: `Motorista Teste ${randomNum}`
        };
        
        console.log('[TEST] Dados de teste:', testCaminhao);
        
        // Fazer chamada direta à API usando fetch
        const response = await fetch(`${window.API_BASE_URL}/caminhoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testCaminhao)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro desconhecido'}`);
        }
          const data = await response.json();
        console.log('[TEST] Resposta do servidor:', data);
        
        // Atualizar a interface após o sucesso
        AlertSuccess.detailed(
            'Teste Realizado com Sucesso!',
            `Caminhão "${data.modelo}" com placa "${data.placa}" foi criado no banco de dados.`
        );
        
        // Recarregar dados
        await loadDataFromLocalStorage();
        renderCaminhoes();
        
    } catch (error) {
        console.error('[TEST] Erro no teste da API:', error);
        AlertError.api(error);
    }
}
