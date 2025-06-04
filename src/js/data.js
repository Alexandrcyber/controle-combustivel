// Arquivo de integração com API REST para PostgreSQL

// URL base para as chamadas de API
const API_BASE_URL = 'http://localhost:3000/api';

// Função para verificar status da conexão com PostgreSQL
async function verificarStatusConexao() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('Status da conexão:', data.message);
            return data.status === 'connected';
        } else {
            console.error('Erro ao verificar status:', data.message);
            return false;
        }
    } catch (err) {
        console.error('Erro na requisição de status:', err);
        return false;
    }
}

// Função para inicializar banco de dados
async function inicializarBancoDados() {
    try {
        const response = await fetch(`${API_BASE_URL}/initialize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Banco de dados inicializado:', data.message);
            return true;
        } else {
            console.error('Erro ao inicializar banco de dados:', data.message);
            return false;
        }
    } catch (err) {
        console.error('Erro na requisição de inicialização:', err);
        return false;
    }
}

// Função para migrar dados do localStorage para PostgreSQL
async function migrarDadosLocalStorage(caminhoes, abastecimentos) {
    try {
        const response = await fetch(`${API_BASE_URL}/migrate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ caminhoes, abastecimentos })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Dados migrados com sucesso:', data.message);
            return true;
        } else {
            console.error('Erro ao migrar dados:', data.message);
            return false;
        }
    } catch (err) {
        console.error('Erro na requisição de migração:', err);
        return false;
    }
}

// Função para buscar caminhões do PostgreSQL
async function buscarCaminhoes() {
    try {
        const response = await fetch(`${API_BASE_URL}/caminhoes`);
        
        if (response.ok) {
            const caminhoes = await response.json();
            return caminhoes;
        } else {
            console.error('Erro ao buscar caminhões');
            return [];
        }
    } catch (err) {
        console.error('Erro na requisição de caminhões:', err);
        return [];
    }
}

// Função para salvar caminhão no PostgreSQL
async function salvarCaminhao(caminhao) {
    try {
        const response = await fetch(`${API_BASE_URL}/caminhoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(caminhao)
        });
        
        if (response.ok) {
            const caminhaoSalvo = await response.json();
            return caminhaoSalvo;
        } else {
            const erro = await response.json();
            console.error('Erro ao salvar caminhão:', erro.message);
            throw new Error(erro.message);
        }
    } catch (err) {
        console.error('Erro na requisição de salvar caminhão:', err);
        throw err;
    }
}

// Função para excluir caminhão do PostgreSQL
async function excluirCaminhao(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/caminhoes/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            return true;
        } else {
            const erro = await response.json();
            console.error('Erro ao excluir caminhão:', erro.message);
            return false;
        }
    } catch (err) {
        console.error('Erro na requisição de excluir caminhão:', err);
        return false;
    }
}

// Função para buscar abastecimentos do PostgreSQL
async function buscarAbastecimentos() {
    try {
        const response = await fetch(`${API_BASE_URL}/abastecimentos`);
        
        if (response.ok) {
            const abastecimentos = await response.json();
            return abastecimentos;
        } else {
            console.error('Erro ao buscar abastecimentos');
            return [];
        }
    } catch (err) {
        console.error('Erro na requisição de abastecimentos:', err);
        return [];
    }
}

// Função para salvar abastecimento no PostgreSQL
async function salvarAbastecimento(abastecimento) {
    try {
        const response = await fetch(`${API_BASE_URL}/abastecimentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(abastecimento)
        });
        
        if (response.ok) {
            const abastecimentoSalvo = await response.json();
            return abastecimentoSalvo;
        } else {
            const erro = await response.json();
            console.error('Erro ao salvar abastecimento:', erro.message);
            throw new Error(erro.message);
        }
    } catch (err) {
        console.error('Erro na requisição de salvar abastecimento:', err);
        throw err;
    }
}

// Função para excluir abastecimento do PostgreSQL
async function excluirAbastecimento(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/abastecimentos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            return true;
        } else {
            const erro = await response.json();
            console.error('Erro ao excluir abastecimento:', erro.message);
            return false;
        }
    } catch (err) {
        console.error('Erro na requisição de excluir abastecimento:', err);
        return false;
    }
}

// Função para limpar todos os dados
async function limparTodosDados() {
    try {
        // Primeiro excluir todos os abastecimentos
        const responseAbastecimentos = await fetch(`${API_BASE_URL}/limpar-abastecimentos`, {
            method: 'DELETE'
        });
        
        // Depois excluir todos os caminhões
        const responseCaminhoes = await fetch(`${API_BASE_URL}/limpar-caminhoes`, {
            method: 'DELETE'
        });
        
        if (responseAbastecimentos.ok && responseCaminhoes.ok) {
            return true;
        } else {
            console.error('Erro ao limpar todos os dados');
            return false;
        }
    } catch (err) {
        console.error('Erro na requisição de limpar todos os dados:', err);
        return false;
    }
}

// Exportar funções para uso no aplicativo
window.dbApi = {
    verificarStatusConexao,
    inicializarBancoDados,
    migrarDadosLocalStorage,
    buscarCaminhoes,
    salvarCaminhao,
    excluirCaminhao,
    buscarAbastecimentos,
    salvarAbastecimento,
    excluirAbastecimento,
    limparTodosDados
};
