// Script para migrar dados do localStorage para o banco PostgreSQL

async function migrarDadosLocalStorage() {
    try {
        console.log('🔄 Iniciando migração de dados do localStorage...');
        
        // Verificar se existe dados no localStorage
        const caminhoesSalvos = localStorage.getItem('caminhoes');
        const abastecimentosSalvos = localStorage.getItem('abastecimentos');
        
        if (!caminhoesSalvos && !abastecimentosSalvos) {
            console.log('✅ Não há dados no localStorage para migrar.');
            return;
        }
        
        const API_BASE = 'http://localhost:3001/api';
        
        // Migrar caminhões
        if (caminhoesSalvos) {
            const caminhoes = JSON.parse(caminhoesSalvos);
            console.log(`📦 Encontrados ${caminhoes.length} caminhões no localStorage`);
            
            for (const caminhao of caminhoes) {
                try {
                    // Remover o id antigo para deixar o backend gerar um novo
                    const caminhaoParaMigrar = { ...caminhao };
                    delete caminhaoParaMigrar.id;
                    
                    const response = await fetch(`${API_BASE}/caminhoes`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(caminhaoParaMigrar)
                    });
                    
                    if (response.ok) {
                        console.log(`✅ Caminhão ${caminhao.placa} migrado com sucesso`);
                    } else {
                        const error = await response.json();
                        console.log(`⚠️  Caminhão ${caminhao.placa} já existe: ${error.error}`);
                    }
                } catch (error) {
                    console.error(`❌ Erro ao migrar caminhão ${caminhao.placa}:`, error);
                }
            }
        }
        
        // Migrar abastecimentos
        if (abastecimentosSalvos) {
            const abastecimentos = JSON.parse(abastecimentosSalvos);
            console.log(`⛽ Encontrados ${abastecimentos.length} abastecimentos no localStorage`);
            
            // Primeiro, buscar caminhões do banco para mapear IDs antigos para novos
            const caminhoesResponse = await fetch(`${API_BASE}/caminhoes`);
            const caminhoesNoBanco = await caminhoesResponse.json();
            
            for (const abastecimento of abastecimentos) {
                try {
                    // Encontrar o caminhão correspondente no banco pela placa
                    const caminhaoCorrespondente = caminhoesNoBanco.find(c => 
                        // Tentar encontrar pelo ID antigo primeiro
                        c.id === abastecimento.caminhao_id ||
                        // Se não encontrar, tentar pela placa se existir referência
                        (abastecimento.caminhao_placa && c.placa === abastecimento.caminhao_placa)
                    );
                    
                    if (!caminhaoCorrespondente && abastecimentos.length > 0) {
                        // Se não encontrou correspondência, usar o primeiro caminhão disponível
                        console.log(`⚠️  Caminhão não encontrado para abastecimento, usando o primeiro disponível`);
                        abastecimento.caminhao_id = caminhoesNoBanco[0]?.id;
                    } else if (caminhaoCorrespondente) {
                        abastecimento.caminhao_id = caminhaoCorrespondente.id;
                    }
                    
                    if (!abastecimento.caminhao_id) {
                        console.log(`❌ Não foi possível encontrar caminhão para o abastecimento`);
                        continue;
                    }
                    
                    // Remover o id antigo para deixar o backend gerar um novo
                    const abastecimentoParaMigrar = { ...abastecimento };
                    delete abastecimentoParaMigrar.id;
                    delete abastecimentoParaMigrar.caminhao_placa; // Remove campo auxiliar se existir
                    
                    const response = await fetch(`${API_BASE}/abastecimentos`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(abastecimentoParaMigrar)
                    });
                    
                    if (response.ok) {
                        console.log(`✅ Abastecimento de ${abastecimento.data} migrado com sucesso`);
                    } else {
                        const error = await response.json();
                        console.error(`❌ Erro ao migrar abastecimento:`, error);
                    }
                } catch (error) {
                    console.error(`❌ Erro ao migrar abastecimento:`, error);
                }
            }
        }
        
        console.log('🎉 Migração concluída!');
        console.log('💡 Os dados do localStorage podem ser limpos agora se desejar.');
        console.log('💡 Para limpar: localStorage.clear()');
        
    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
    }
}

// Função para limpar localStorage após confirmar migração
function limparLocalStorage() {
    const confirmacao = confirm('Tem certeza que deseja limpar todos os dados do localStorage? Esta ação não pode ser desfeita.');
    if (confirmacao) {
        localStorage.clear();
        console.log('✅ localStorage limpo com sucesso!');
    }
}

// Executar migração
migrarDadosLocalStorage();
