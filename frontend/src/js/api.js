// Configuração da API
const API_CONFIG = {
    // Obter URL base de variável global ou usar fallback
    baseURL: window.API_BASE_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
};

// Imprimir a URL da API para depuração
console.log('[API] URL base da API configurada para:', API_CONFIG.baseURL);

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

            // Log detalhado para depuração
            console.log(`[API REQUEST] ${options.method || 'GET'} ${url}`, 
                        options.body ? JSON.parse(options.body) : '');

            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Erro HTTP: ${response.status}`;
                console.error(`[API ERROR] ${errorMessage}`, errorData);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log(`[API RESPONSE]`, data);
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error.message);
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
        },        async salvar(caminhao) {
            console.log('[apiClient.caminhoes] Salvando caminhão:', caminhao);
            
            if (caminhao.id && caminhao.id !== 'novo') {
                // Atualizar existente
                console.log(`[apiClient.caminhoes] Atualizando caminhão existente ID=${caminhao.id}`);
                return await apiClient.request(`/caminhoes/${caminhao.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(caminhao)
                });
            } else {
                // Criar novo
                console.log('[apiClient.caminhoes] Criando novo caminhão');
                const { id, ...caminhaoSemId } = caminhao;
                console.log('[apiClient.caminhoes] Dados enviados:', caminhaoSemId);
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
    abastecimentos: {        async buscarTodos() {
            console.log('[apiClient.abastecimentos] Buscando todos os abastecimentos');
            const result = await apiClient.request('/abastecimentos');
            
            // Mapear campos do backend (snake_case) para frontend (camelCase)
            const mapearCamposParaFrontend = (abastecimentos) => {
                return abastecimentos.map(abastecimento => {
                    const { caminhao_id, periodo_inicio, periodo_fim, km_inicial, km_final, valor_litro, valor_total, ...resto } = abastecimento;
                    return {
                        ...resto,
                        ...(caminhao_id && { caminhaoId: caminhao_id }),
                        ...(periodo_inicio && { periodoInicio: periodo_inicio }),
                        ...(periodo_fim && { periodoFim: periodo_fim }),
                        ...(km_inicial !== undefined && { kmInicial: km_inicial }),
                        ...(km_final !== undefined && { kmFinal: km_final }),
                        ...(valor_litro !== undefined && { valorLitro: valor_litro }),
                        ...(valor_total !== undefined && { valorTotal: valor_total })
                    };
                });
            };
            
            return mapearCamposParaFrontend(result);
        },        async buscarPorId(id) {
            console.log('[apiClient.abastecimentos] Buscando abastecimento por ID:', id);
            const result = await apiClient.request(`/abastecimentos/${id}`);
            
            // Mapear campos do backend (snake_case) para frontend (camelCase)
            const { caminhao_id, periodo_inicio, periodo_fim, km_inicial, km_final, valor_litro, valor_total, ...resto } = result;
            return {
                ...resto,
                ...(caminhao_id && { caminhaoId: caminhao_id }),
                ...(periodo_inicio && { periodoInicio: periodo_inicio }),
                ...(periodo_fim && { periodoFim: periodo_fim }),
                ...(km_inicial !== undefined && { kmInicial: km_inicial }),
                ...(km_final !== undefined && { kmFinal: km_final }),
                ...(valor_litro !== undefined && { valorLitro: valor_litro }),
                ...(valor_total !== undefined && { valorTotal: valor_total })
            };
        },

        async buscarPorCaminhao(caminhaoId) {
            return await apiClient.request(`/abastecimentos?caminhao_id=${caminhaoId}`);
        },        async salvar(abastecimento) {
            console.log('[apiClient.abastecimentos] Salvando abastecimento:', abastecimento);
            
            // Mapear campos do frontend (camelCase) para backend (snake_case)
            const mapearCampos = (obj) => {
                const { id, caminhaoId, periodoInicio, periodoFim, kmInicial, kmFinal, valorLitro, valorTotal, ...resto } = obj;
                return {
                    ...resto,
                    ...(caminhaoId && { caminhao_id: caminhaoId }),
                    ...(periodoInicio && { periodo_inicio: periodoInicio }),
                    ...(periodoFim && { periodo_fim: periodoFim }),
                    ...(kmInicial !== undefined && { km_inicial: kmInicial }),
                    ...(kmFinal !== undefined && { km_final: kmFinal }),
                    ...(valorLitro !== undefined && { valor_litro: valorLitro }),
                    ...(valorTotal !== undefined && { valor_total: valorTotal })
                };
            };
            
            // Mapear campos do backend (snake_case) para frontend (camelCase)
            const mapearResposta = (obj) => {
                const { caminhao_id, periodo_inicio, periodo_fim, km_inicial, km_final, valor_litro, valor_total, ...resto } = obj;
                return {
                    ...resto,
                    ...(caminhao_id && { caminhaoId: caminhao_id }),
                    ...(periodo_inicio && { periodoInicio: periodo_inicio }),
                    ...(periodo_fim && { periodoFim: periodo_fim }),
                    ...(km_inicial !== undefined && { kmInicial: km_inicial }),
                    ...(km_final !== undefined && { kmFinal: km_final }),
                    ...(valor_litro !== undefined && { valorLitro: valor_litro }),
                    ...(valor_total !== undefined && { valorTotal: valor_total })
                };
            };
            
            let result;
            if (abastecimento.id && abastecimento.id !== 'novo') {
                // Atualizar existente
                console.log(`[apiClient.abastecimentos] Atualizando abastecimento existente ID=${abastecimento.id}`);
                const dadosMapeados = mapearCampos(abastecimento);
                console.log('[apiClient.abastecimentos] Dados mapeados para backend:', dadosMapeados);
                result = await apiClient.request(`/abastecimentos/${abastecimento.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(dadosMapeados)
                });
            } else {
                // Criar novo
                console.log('[apiClient.abastecimentos] Criando novo abastecimento');
                const { id, ...abastecimentoSemId } = abastecimento;
                const dadosMapeados = mapearCampos(abastecimentoSemId);
                console.log('[apiClient.abastecimentos] Dados mapeados para backend:', dadosMapeados);
                result = await apiClient.request('/abastecimentos', {
                    method: 'POST',
                    body: JSON.stringify(dadosMapeados)
                });
            }
            
            // Mapear resposta de volta para formato do frontend
            return mapearResposta(result);
        },

        async excluir(id) {
            return await apiClient.request(`/abastecimentos/${id}`, {
                method: 'DELETE'
            });
        }
    },    // Funções de utilidade
    async health() {
        console.log('[apiClient] Verificando health da API...');
        const resultado = await apiClient.request('/health');
        console.log('[apiClient] Resultado do health check:', resultado);
        return resultado;
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
    },    async salvarCaminhao(caminhao) {
        try {
            console.log('[dbApi] Salvando caminhão:', caminhao);
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
    },    async salvarAbastecimento(abastecimento) {
        try {
            console.log('[dbApi] Salvando abastecimento:', abastecimento);
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
    },    // Função para verificar conexão com a API
    async testarConexao() {
        try {
            console.log('[dbApi] Testando conexão com a API...');
            const resultado = await window.apiClient.health();
            console.log('[dbApi] Resultado do teste de conexão:', resultado);
            return resultado;
        } catch (error) {
            console.error('[dbApi] Erro na conexão com a API:', error);
            return false;
        }
    }
};

console.log('✅ API Client configurado e pronto para uso!');
