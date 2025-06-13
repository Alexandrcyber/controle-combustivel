// Teste direto da API para verificar se está funcionando
async function testDirectAPI() {
    try {
        console.log('🔍 Testando API diretamente...');
        
        // Testar endpoint de abastecimentos
        const response = await fetch('https://controle-combustivel.onrender.com/api/abastecimentos');
        
        if (!response.ok) {
            console.error('❌ Erro HTTP:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Resposta:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('✅ Resposta da API:', data);
        console.log(`📊 Encontrados ${data.length} abastecimentos`);
        
        // Verificar estrutura dos dados
        if (data.length > 0) {
            console.log('📋 Estrutura do primeiro abastecimento:');
            console.log(JSON.stringify(data[0], null, 2));
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar API:', error);
    }
}

testDirectAPI();
