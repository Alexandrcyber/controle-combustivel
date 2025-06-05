// Configuração da API
const API_CONFIG = {
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
};

// API para comunicação com o backend
window.apiClient = {
    // Função auxiliar para fazer requisições
    async request(endpoint, options = {}) {
        try {
            const url = `${API_CONFIG.baseURL}${endpoint}`;
            const config = {
                ...options,
                headers: {
                    ...API_CONFIG.headers,
                    ...options.headers
                }
            };

            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    },

    // CRUD para Caminhões
    caminhoes: {
        async buscarTodos() {
            return await apiClient.request('/caminhoes');
        },

        async buscarPorId(id) {
            return await apiClient.request(`/caminhoes/${id}`);
        },

        async salvar(caminhao) {
            if (caminhao.id && caminhao.id !== 'novo') {
                // Atualizar existente
                return await apiClient.request(`/caminhoes/${caminhao.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(caminhao)
                });
            } else {
                // Criar novo
                const { id, ...caminhaoSemId } = caminhao;
                return await apiClient.request('/caminhoes', {
                    method: 'POST',
                    body: JSON.stringify(caminhaoSemId)
                });
            }
        },

        async excluir(id) {
            return await apiClient.request(`/caminhoes/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // CRUD para Abastecimentos
    abastecimentos: {
        async buscarTodos() {
            return await apiClient.request('/abastecimentos');
        },

        async buscarPorId(id) {
            return await apiClient.request(`/abastecimentos/${id}`);
        },

        async buscarPorCaminhao(caminhaoId) {
            return await apiClient.request(`/abastecimentos?caminhao_id=${caminhaoId}`);
        },

        async salvar(abastecimento) {
            if (abastecimento.id && abastecimento.id !== 'novo') {
                // Atualizar existente
                return await apiClient.request(`/abastecimentos/${abastecimento.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(abastecimento)
                });
            } else {
                // Criar novo
                const { id, ...abastecimentoSemId } = abastecimento;
                return await apiClient.request('/abastecimentos', {
                    method: 'POST',
                    body: JSON.stringify(abastecimentoSemId)
                });
            }
        },

        async excluir(id) {
            return await apiClient.request(`/abastecimentos/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Funções de utilidade
    async health() {
        return await apiClient.request('/health');
    },

    async info() {
        return await apiClient.request('/info');
    }
};

// Função para gerar ID único (mantida para compatibilidade, mas o backend gerará os IDs)
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// API unificada que substitui a antiga localStorageApi
window.dbApi = {
    // Caminhões
    async buscarCaminhoes() {
        try {
            return await window.apiClient.caminhoes.buscarTodos();
        } catch (error) {
            console.error('Erro ao buscar caminhões:', error);
            return [];
        }
    },

    async salvarCaminhao(caminhao) {
        try {
            return await window.apiClient.caminhoes.salvar(caminhao);
        } catch (error) {
            console.error('Erro ao salvar caminhão:', error);
            throw error;
        }
    },

    async excluirCaminhao(id) {
        try {
            return await window.apiClient.caminhoes.excluir(id);
        } catch (error) {
            console.error('Erro ao excluir caminhão:', error);
            throw error;
        }
    },

    // Abastecimentos
    async buscarAbastecimentos() {
        try {
            return await window.apiClient.abastecimentos.buscarTodos();
        } catch (error) {
            console.error('Erro ao buscar abastecimentos:', error);
            return [];
        }
    },

    async salvarAbastecimento(abastecimento) {
        try {
            return await window.apiClient.abastecimentos.salvar(abastecimento);
        } catch (error) {
            console.error('Erro ao salvar abastecimento:', error);
            throw error;
        }
    },

    async excluirAbastecimento(id) {
        try {
            return await window.apiClient.abastecimentos.excluir(id);
        } catch (error) {
            console.error('Erro ao excluir abastecimento:', error);
            throw error;
        }
    },

    // Funções de limpeza (para compatibilidade)
    async limparTodosDados() {
        try {
            // Buscar todos os abastecimentos e caminhões para excluir
            const abastecimentos = await this.buscarAbastecimentos();
            const caminhoes = await this.buscarCaminhoes();

            // Excluir todos os abastecimentos
            for (const abastecimento of abastecimentos) {
                await this.excluirAbastecimento(abastecimento.id);
            }

            // Excluir todos os caminhões
            for (const caminhao of caminhoes) {
                await this.excluirCaminhao(caminhao.id);
            }

            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            throw error;
        }
    },

    // Função para verificar conexão com a API
    async testarConexao() {
        try {
            await window.apiClient.health();
            return true;
        } catch (error) {
            console.error('Erro na conexão com a API:', error);
            return false;
        }
    }
};

console.log('✅ API Client configurado e pronto para uso!');
