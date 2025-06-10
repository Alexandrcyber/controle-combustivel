// Configuração da API
const API_CONFIG = {
    // Obter URL base de configuração de ambiente ou usar fallback
    baseURL: (() => {
        // Log para debug
        console.log('[API CONFIG] Detectando ambiente:', {
            hostname: window.location.hostname,
            ENV_CONFIG: window.ENV_CONFIG,
            ENV_API_BASE_URL: window.ENV_API_BASE_URL,
            API_BASE_URL: window.API_BASE_URL
        });
        
        // 1. Primeiro, tentar usar configuração de ambiente
        if (window.ENV_CONFIG && window.ENV_CONFIG.API_BASE_URL) {
            console.log('[API CONFIG] Usando ENV_CONFIG.API_BASE_URL:', window.ENV_CONFIG.API_BASE_URL);
            return window.ENV_CONFIG.API_BASE_URL;
        }
        // 2. Tentar usar variável global atualizada
        if (window.ENV_API_BASE_URL) {
            console.log('[API CONFIG] Usando ENV_API_BASE_URL:', window.ENV_API_BASE_URL);
            return window.ENV_API_BASE_URL;
        }
        // 3. Usar proxy local para desenvolvimento
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('[API CONFIG] Ambiente local detectado, usando /api');
            return '/api';
        }        // 4. Se estiver em domínio Netlify, usar proxy do Netlify
        if (window.location.hostname.includes('netlify.app')) {
            console.log('[API CONFIG] Netlify detectado, usando proxy /api');
            return '/api';
        }
        // 5. Em produção, usar redirecionamento do Netlify
        console.log('[API CONFIG] Fallback para redirecionamento /api');
        return '/api';
    })(),
    headers: {
        'Content-Type': 'application/json'
    }
};

// Imprimir a URL da API para depuração
console.log('[API] URL base da API configurada para:', API_CONFIG.baseURL);

// Função auxiliar para fazer requisições com autenticação
async function authenticatedRequest(url, options = {}) {
    // Verificar se o sistema de autenticação está disponível
    if (window.authManager && window.authManager.isAuthenticated()) {
        return await window.authManager.authenticatedFetch(url, options);
    } else {
        // Fallback: fazer requisição normal se autenticação não estiver disponível
        return await fetch(url, options);
    }
}

// API para comunicação com o backend
window.apiClient = {
    // Função auxiliar para fazer requisições
    async request(endpoint, options = {}) {
        try {
            const url = `${API_CONFIG.baseURL}${endpoint}`;
            
            // Usar requisição autenticada se disponível
            let response;
            if (window.authManager && window.authManager.isAuthenticated()) {
                response = await window.authManager.authenticatedFetch(url, {
                    ...options,
                    headers: {
                        ...API_CONFIG.headers,
                        ...options.headers
                    }
                });
            } else {
                const config = {
                    ...options,
                    headers: {
                        ...API_CONFIG.headers,
                        ...options.headers
                    }
                };
                response = await fetch(url, config);
            }

            // Log detalhado para depuração
            console.log(`[API REQUEST] ${options.method || 'GET'} ${url}`, 
                        options.body ? JSON.parse(options.body) : '');
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Erro HTTP: ${response.status}`;
                console.error(`[API ERROR] ${errorMessage}`, errorData);
                throw new Error(errorMessage);
            }

            // Tratar respostas sem conteúdo (No Content)
            if (response.status === 204) {
                console.log(`[API RESPONSE] No content for ${url}`);
                return null;
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
            const result = await apiClient.request('/caminhoes');
            
            // Mapear campos do backend (snake_case) para frontend (camelCase)
            return result.map(caminhao => {
                const { 
                    created_at, updated_at, ultima_manutencao, proxima_manutencao, 
                    km_ultima_manutencao, intervalo_manutencao_km, numero_chassi, 
                    numero_renavam, vencimento_licenciamento, vencimento_seguro, 
                    numero_apolice_seguro, ...resto 
                } = caminhao;
                
                return {
                    ...resto,
                    createdAt: created_at,
                    updatedAt: updated_at,
                    ultimaManutencao: ultima_manutencao,
                    proximaManutencao: proxima_manutencao,
                    kmUltimaManutencao: km_ultima_manutencao,
                    intervaloManutencaoKm: intervalo_manutencao_km,
                    numeroChassi: numero_chassi,
                    numeroRenavam: numero_renavam,
                    vencimentoLicenciamento: vencimento_licenciamento,
                    vencimentoSeguro: vencimento_seguro,
                    numeroApoliceSeguro: numero_apolice_seguro,
                    capacidade: parseFloat(caminhao.capacidade) || 0
                };
            });
        },

        async buscarPorId(id) {
            const result = await apiClient.request(`/caminhoes/${id}`);
            
            // Mapear campos do backend (snake_case) para frontend (camelCase)
            const { 
                created_at, updated_at, ultima_manutencao, proxima_manutencao, 
                km_ultima_manutencao, intervalo_manutencao_km, numero_chassi, 
                numero_renavam, vencimento_licenciamento, vencimento_seguro, 
                numero_apolice_seguro, ...resto 
            } = result;
            
            return {
                ...resto,
                createdAt: created_at,
                updatedAt: updated_at,
                ultimaManutencao: ultima_manutencao,
                proximaManutencao: proxima_manutencao,
                kmUltimaManutencao: km_ultima_manutencao,
                intervaloManutencaoKm: intervalo_manutencao_km,
                numeroChassi: numero_chassi,
                numeroRenavam: numero_renavam,
                vencimentoLicenciamento: vencimento_licenciamento,
                vencimentoSeguro: vencimento_seguro,
                numeroApoliceSeguro: numero_apolice_seguro,
                capacidade: parseFloat(result.capacidade) || 0
            };
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
                        caminhaoId: caminhao_id,
                        periodoInicio: periodo_inicio,
                        periodoFim: periodo_fim,
                        kmInicial: parseFloat(km_inicial) || 0,
                        kmFinal: parseFloat(km_final) || 0,
                        valorLitro: parseFloat(valor_litro) || 0,
                        valorTotal: parseFloat(valor_total) || 0,
                        litros: parseFloat(abastecimento.litros) || 0
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
                caminhaoId: caminhao_id,
                periodoInicio: periodo_inicio,
                periodoFim: periodo_fim,
                kmInicial: parseFloat(km_inicial) || 0,
                kmFinal: parseFloat(km_final) || 0,
                valorLitro: parseFloat(valor_litro) || 0,
                valorTotal: parseFloat(valor_total) || 0,
                litros: parseFloat(result.litros) || 0
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
                    caminhaoId: caminhao_id,
                    periodoInicio: periodo_inicio,
                    periodoFim: periodo_fim,
                    kmInicial: parseFloat(km_inicial) || 0,
                    kmFinal: parseFloat(km_final) || 0,
                    valorLitro: parseFloat(valor_litro) || 0,
                    valorTotal: parseFloat(valor_total) || 0,
                    litros: parseFloat(obj.litros) || 0
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
    },

    // CRUD para Despesas
    despesas: {
        async buscarTodos() {
            console.log('[apiClient.despesas] Buscando todas as despesas');
            const result = await apiClient.request('/despesas');
            
            // Mapear campos do backend (snake_case) para frontend (camelCase) se necessário
            return result.map(despesa => ({
                ...despesa,
                valor: parseFloat(despesa.valor) || 0
            }));
        },

        async buscarPorId(id) {
            console.log('[apiClient.despesas] Buscando despesa por ID:', id);
            const result = await apiClient.request(`/despesas/${id}`);
            
            return {
                ...result,
                valor: parseFloat(result.valor) || 0
            };
        },

        async salvar(despesa) {
            console.log('[apiClient.despesas] Salvando despesa:', despesa);
            
            let result;
            if (despesa.id && despesa.id !== 'novo') {
                // Atualizar existente
                console.log(`[apiClient.despesas] Atualizando despesa existente ID=${despesa.id}`);
                result = await apiClient.request(`/despesas/${despesa.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(despesa)
                });
            } else {
                // Criar nova
                console.log('[apiClient.despesas] Criando nova despesa');
                const { id, ...despesaSemId } = despesa;
                result = await apiClient.request('/despesas', {
                    method: 'POST',
                    body: JSON.stringify(despesaSemId)
                });
            }
            
            return {
                ...result,
                valor: parseFloat(result.valor) || 0
            };
        },

        async excluir(id) {
            return await apiClient.request(`/despesas/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Funções de utilidade
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
    },    // Despesas
    async buscarDespesas() {
        try {
            console.log('[dbApi] Buscando despesas...');
            const result = await window.apiClient.despesas.buscarTodos();
            console.log('[dbApi] Despesas encontradas:', result.length);
            return result;
        } catch (error) {
            console.error('[dbApi] Erro ao buscar despesas:', error);
            return [];
        }
    },
    async salvarDespesa(despesa) {
        try {
            return await window.apiClient.despesas.salvar(despesa);
        } catch (error) {
            console.error('Erro ao salvar despesa:', error);
            throw error;
        }
    },
    async excluirDespesa(id) {
        try {
            return await window.apiClient.despesas.excluir(id);
        } catch (error) {
            console.error('Erro ao excluir despesa:', error);
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
            throw error;        }
    },

    // Funções de Despesas
    async buscarDespesas() {
        try {
            console.log('[dbApi] Buscando despesas...');
            return await window.apiClient.despesas.buscarTodos();
        } catch (error) {
            console.error('Erro ao buscar despesas:', error);
            return [];
        }
    },

    async salvarDespesa(despesa) {
        try {
            console.log('[dbApi] Salvando despesa:', despesa);
            return await window.apiClient.despesas.salvar(despesa);
        } catch (error) {
            console.error('Erro ao salvar despesa:', error);
            throw error;
        }
    },

    async excluirDespesa(id) {
        try {
            return await window.apiClient.despesas.excluir(id);
        } catch (error) {
            console.error('Erro ao excluir despesa:', error);
            throw error;
        }
    },

    // Funções de limpeza (para compatibilidade)
    async limparTodosDados() {
        try {
            // Buscar todos os abastecimentos, caminhões e despesas para excluir
            const abastecimentos = await this.buscarAbastecimentos();
            const caminhoes = await this.buscarCaminhoes();
            const despesas = await this.buscarDespesas();

            // Excluir todos os abastecimentos
            for (const abastecimento of abastecimentos) {
                await this.excluirAbastecimento(abastecimento.id);
            }

            // Excluir todos os caminhões
            for (const caminhao of caminhoes) {
                await this.excluirCaminhao(caminhao.id);
            }

            // Excluir todas as despesas
            for (const despesa of despesas) {
                await this.excluirDespesa(despesa.id);
            }

            return true;        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            throw error;
        }
    },

    // Função para testar conexão com a API
    async testarConexao() {
        try {
            console.log('[dbApi] Testando conexão com a API...');
            const response = await fetch(`${API_CONFIG.baseURL}/health`, {
                method: 'GET',
                headers: API_CONFIG.headers
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('[dbApi] Conexão com a API bem-sucedida:', data);
                return true;
            } else {
                console.warn('[dbApi] API respondeu com erro:', response.status);
                return false;
            }
        } catch (error) {
            console.error('[dbApi] Erro ao testar conexão:', error);
            return false;
        }
    }
};

console.log('✅ API Client configurado e pronto para uso!');
