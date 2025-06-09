// Variáveis globais
let caminhoes = [];
let abastecimentos = [];
let currentSection = 'dashboardSection';

// Variáveis para controle de filtros de abastecimentos
let filtroAbastecimentoAtivo = false;
let abastecimentosFiltrados = [];

// Disponibilizar dados globalmente para os relatórios
window.caminhoes = caminhoes;
window.abastecimentos = abastecimentos;

// Função para aguardar sistema de autenticação estar pronto
async function waitForAuth() {
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos máximo
    
    while (attempts < maxAttempts) {
        if (window.authManager) {
            console.log('✅ Sistema de autenticação carregado');
            return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    console.warn('⚠️ Sistema de autenticação não carregou, continuando sem autenticação');
    return false;
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando aplicação do Controle de Combustível');
    
    // Aguardar um pouco para garantir que todos os scripts sejam carregados
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Aguardar sistema de autenticação estar pronto
    await waitForAuth();
    
    // Verificar se window.dbApi está disponível
    if (!window.dbApi) {
        console.error('❌ window.dbApi não está disponível!');
        console.log('🔍 Verificando scripts carregados:', {
            apiClient: !!window.apiClient,
            dbApi: !!window.dbApi,
            localStorageApi: !!window.localStorageApi
        });
        
        // Tentar aguardar mais um pouco e verificar novamente
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!window.dbApi) {
            console.error('❌ window.dbApi ainda não está disponível após espera adicional');
            // Usar localStorage como fallback
            console.warn('⚠️ Usando localStorage como fallback');
        }
    }
    
    // Verificar conexão com a API (assíncrono)
    verificarStatusAPI();
    
    // Carregar dados do backend ou localStorage
    await loadDataFromLocalStorage();
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar manipuladores de eventos
    setupEventHandlers();
    
    // Renderizar dados iniciais
    renderCaminhoes();
    renderAbastecimentos();
    
    // Inicializar gráficos
    if (typeof initCharts === 'function') {
        initCharts();
    }
    
    updateDashboard();
    populateCaminhaoSelects();

    // Definir filtros padrão do dashboard para mês atual
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth()+1, 0).toISOString().split('T')[0];
    document.getElementById('dashboardDataInicio').value = primeiroDia;
    document.getElementById('dashboardDataFim').value = ultimoDia;
    // Evento para atualizar dashboard
    document.getElementById('atualizarDashboard').addEventListener('click', e => {
        e.preventDefault();
        updateDashboard();
    });
    
    // Após inicialização, exibir dashboard automaticamente
    if (currentSection === 'dashboardSection') {
        updateDashboard();
    }
    
    // Aplicar visibilidade padrão para usuários não autenticados
    // Se o sistema de auth não carregou, aplicar visibilidade de convidado
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        if (window.applyRoleVisibility) {
            window.applyRoleVisibility('guest');
        }
        
        // Garantir que o botão de login esteja visível
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }
        
        // Garantir que o menu do usuário esteja oculto
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }
    
    console.log('Aplicação inicializada com sucesso');
});

// Variáveis globais para controle de status da API
let isFirstConnection = true;

// Verificar status da API
async function verificarStatusAPI() {
    try {
        console.log('[APP] Verificando conexão com a API...');
        
        // Mostrar alerta discreto de conexão se não for a primeira verificação e a API estava desconectada
        if (!isFirstConnection && window.apiWasDisconnected) {
            AlertInfo.connecting(
                'Reconectando ao servidor...',
                'Tentando restabelecer a conexão. Isso pode levar até um minuto. Você pode continuar navegando normalmente.'
            );
        }
        
        const conexao = await window.dbApi.testarConexao();
        
        // Fechar alerta de loading se estiver aberto
        if (!isFirstConnection && AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        
        if (conexao) {
            console.log('[APP] API conectada com sucesso');
            
            // Mostrar alerta de sucesso discreto na primeira conexão ou reconexão
            if (isFirstConnection || window.apiWasDisconnected) {
                if (window.apiWasDisconnected) {
                    // Reconexão bem-sucedida
                    AlertInfo.reconnected('Conexão restabelecida!');
                } else {
                    // Primeira conexão
                    AlertToast.success('Sistema conectado e pronto para uso!');
                }
                window.apiWasDisconnected = false;
            }
            
            window.apiConnected = true;
        } else {
            console.warn('[APP] API parcialmente conectada');
            window.apiConnected = false;
            window.apiWasDisconnected = true;
            
            // Mostrar animação de tentativa de conexão discreta
            showConnectionAttempt();
        }
    } catch (error) {
        console.error('[APP] Erro ao conectar com a API:', error);
        window.apiConnected = false;
        window.apiWasDisconnected = true;
        
        // Mostrar animação de tentativa de conexão discreta
        showConnectionAttempt();
    }
    
    isFirstConnection = false;
    
    // Tentar novamente após 30 segundos
    setTimeout(verificarStatusAPI, 30000);
}

// Função para mostrar animação de tentativa de conexão discreta
function showConnectionAttempt() {
    AlertInfo.connecting(
        'Tentando conectar ao servidor...',
        'Verificando conectividade. Isso pode demorar até um minuto. Você pode continuar usando o sistema normalmente.'
    );
}

// Carregar dados do localStorage
async function loadDataFromLocalStorage() {
    let loadingAlert = null;
    
    try {
        console.log('[LOAD] Iniciando carregamento de dados...');
        
        // Mostrar alerta de carregamento do sistema mais proeminente e persistente
        loadingAlert = AlertInfo.loadingSystem(
            'Carregando Sistema de Gestão Logística',
            'Sincronizando dados de caminhões, abastecimentos e relatórios. Este processo garante que você tenha as informações mais atualizadas disponíveis.'
        );
        
        // Aguardar um momento para o alerta aparecer antes de iniciar o carregamento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar se window.dbApi está disponível
        if (window.dbApi && typeof window.dbApi.buscarCaminhoes === 'function') {
            console.log('[LOAD] Usando window.dbApi para buscar dados...');
            
            // Usar dbApi para buscar dados do backend com aguardo entre operações
            console.log('[LOAD] 🚛 Carregando caminhões...');
            caminhoes = await window.dbApi.buscarCaminhoes();
            
            // Pequena pausa para dar tempo de visualizar o progresso
            await new Promise(resolve => setTimeout(resolve, 300));
            
            console.log('[LOAD] ⛽ Carregando abastecimentos...');
            abastecimentos = await window.dbApi.buscarAbastecimentos();
            
            console.log('[LOAD] Dados carregados via API:', {
                caminhoes: caminhoes.length,
                abastecimentos: abastecimentos.length,
                primeiroAbastecimento: abastecimentos[0] || null
            });
        } else {
            console.warn('[LOAD] window.dbApi não disponível, usando localStorage como fallback');
            
            // Fallback para localStorage
            console.log('[LOAD] 📦 Acessando dados locais...');
            const caminhoesJSON = localStorage.getItem('caminhoes');
            const abastecimentosJSON = localStorage.getItem('abastecimentos');
            
            caminhoes = caminhoesJSON ? JSON.parse(caminhoesJSON) : [];
            abastecimentos = abastecimentosJSON ? JSON.parse(abastecimentosJSON) : [];
            
            console.log('[LOAD] Dados carregados via localStorage:', {
                caminhoes: caminhoes.length,
                abastecimentos: abastecimentos.length
            });
        }
        
        // Aguardar um momento para processar os dados
        console.log('[LOAD] 📊 Processando e organizando dados...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Atualizar referências globais para os relatórios
        updateGlobalReferences();
        
        console.log(`✅ Carregamento concluído: ${caminhoes.length} caminhões e ${abastecimentos.length} abastecimentos`);
        
        // Aguardar um pouco mais para garantir que todo o processo foi visualizado
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fechar alerta de carregamento
        if (AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        
        // Mostrar toast de sucesso discreto após um momento
        setTimeout(() => {
            const fonte = window.dbApi ? 'banco de dados' : 'dados locais';
            AlertToast.success(`✅ Sistema carregado: ${caminhoes.length} caminhões e ${abastecimentos.length} abastecimentos (${fonte})`);
        }, 200);
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        
        // Fechar alerta de carregamento se estiver aberto
        if (AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        
        // Em caso de erro, tentar localStorage como última alternativa
        console.log('[LOAD] Tentando fallback para localStorage após erro...');
        try {
            const caminhoesJSON = localStorage.getItem('caminhoes');
            const abastecimentosJSON = localStorage.getItem('abastecimentos');
            
            caminhoes = caminhoesJSON ? JSON.parse(caminhoesJSON) : [];
            abastecimentos = abastecimentosJSON ? JSON.parse(abastecimentosJSON) : [];
            
            console.log('[LOAD] Fallback localStorage aplicado:', {
                caminhoes: caminhoes.length,
                abastecimentos: abastecimentos.length
            });
            
            // Mostrar toast de aviso sobre fallback
            AlertToast.warning('Conectividade limitada - usando dados locais');
            
            // Atualizar referências globais
            updateGlobalReferences();
        } catch (fallbackError) {
            console.error('❌ Erro no fallback localStorage:', fallbackError);
            
            // Última alternativa: arrays vazios
            caminhoes = [];
            abastecimentos = [];
            updateGlobalReferences();
            
            // Mostrar aviso sobre dados vazios
            AlertToast.error('Não foi possível carregar os dados');
        }
        
        // Atualizar referências globais para os relatórios
        updateGlobalReferences();
        
        console.log(`Usando dados do localStorage como fallback: ${caminhoes.length} caminhões e ${abastecimentos.length} abastecimentos`);
    }
}

// Atualizar referências globais para os relatórios
function updateGlobalReferences() {
    window.caminhoes = caminhoes;
    window.abastecimentos = abastecimentos;
    console.log('[UPDATE] Referências globais atualizadas:', {
        caminhoes: caminhoes.length,
        abastecimentos: abastecimentos.length
    });
}

// Configurar navegação entre seções
function setupNavigation() {
    document.getElementById('dashboardLink').addEventListener('click', () => showSection('dashboardSection'));
    document.getElementById('caminhaoLink').addEventListener('click', () => showSection('caminhaoSection'));
    document.getElementById('abastecimentoLink').addEventListener('click', () => showSection('abastecimentoSection'));
    document.getElementById('relatoriosLink').addEventListener('click', () => showSection('relatoriosSection'));
}

// Mostrar seção específica e ocultar as demais
function showSection(sectionId) {
    // Ocultar todas as seções
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('caminhaoSection').style.display = 'none';
    document.getElementById('abastecimentoSection').style.display = 'none';
    document.getElementById('relatoriosSection').style.display = 'none';
    
    // Remover classe active de todos os links
    document.getElementById('dashboardLink').classList.remove('active');
    document.getElementById('caminhaoLink').classList.remove('active');
    document.getElementById('abastecimentoLink').classList.remove('active');
    document.getElementById('relatoriosLink').classList.remove('active');
    
    // Mostrar a seção selecionada
    document.getElementById(sectionId).style.display = 'block';
    
    // Adicionar classe active ao link correspondente
    if (sectionId === 'dashboardSection') {
        document.getElementById('dashboardLink').classList.add('active');
        updateDashboard(); // Atualizar dashboard quando for exibido
    } else if (sectionId === 'caminhaoSection') {
        document.getElementById('caminhaoLink').classList.add('active');
    } else if (sectionId === 'abastecimentoSection') {
        document.getElementById('abastecimentoLink').classList.add('active');
    } else if (sectionId === 'relatoriosSection') {
        document.getElementById('relatoriosLink').classList.add('active');
    }
    
    currentSection = sectionId;
}

// Configurar manipuladores de eventos para formulários e botões
function setupEventHandlers() {
    // Manipuladores para caminhões
    document.getElementById('saveCaminhao').addEventListener('click', saveCaminhao);
    
    // Botão de teste da API (Caminhões)
    const btnTestApiCaminhao = document.getElementById('testApiButton');
    if (btnTestApiCaminhao) {
        btnTestApiCaminhao.addEventListener('click', testarApiCaminhao);
    }

    // Botão de teste da API (Abastecimentos)
    const btnTestApiAbast = document.getElementById('testApiAbastecimentoButton');
    if (btnTestApiAbast) {
        btnTestApiAbast.addEventListener('click', testarApiAbastecimento);
    }

    // Botão de teste de mapeamento
    const btnTestMapeamento = document.getElementById('testMapeamentoButton');
    if (btnTestMapeamento) {
        btnTestMapeamento.addEventListener('click', testarMapeamentoCampos);
    }
    
    // Manipuladores para abastecimentos
    document.getElementById('saveAbastecimento').addEventListener('click', saveAbastecimento);
    
    // Manipulador para eventos de km que calcula automaticamente a distância
    document.getElementById('kmInicial').addEventListener('input', calcularDistancia);
    document.getElementById('kmFinal').addEventListener('input', calcularDistancia);
    
    // Manipulador para eventos de valor que calcula automaticamente o total
    document.getElementById('litros').addEventListener('input', calcularValorTotal);
    document.getElementById('valorLitro').addEventListener('input', calcularValorTotal);
    
    // Manipulador para confirmação de exclusão
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);

    // Event listeners para limpeza de backdrop dos modais
    setupModalCleanupListeners();

    // Manipuladores para exportação
    document.getElementById('exportarPdfCompleto').addEventListener('click', exportarPdfCompleto);
    document.getElementById('exportarPdf').addEventListener('click', exportarPdfCustos);
    
    // Manipuladores para formulários de relatórios
    document.getElementById('relatorioConsumoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        gerarRelatorioConsumo();
    });
    
    document.getElementById('relatorioCustosForm').addEventListener('submit', (e) => {
        e.preventDefault();
        gerarRelatorioCustos();
    });
    
    // Configurar filtros de data para abastecimentos
    configurarFiltrosAbastecimento();
}

// Configurar event listeners para limpeza de backdrop dos modais
function setupModalCleanupListeners() {
    // Modal de caminhão
    const addCaminhaoModal = document.getElementById('addCaminhaoModal');
    if (addCaminhaoModal) {
        addCaminhaoModal.addEventListener('hidden.bs.modal', () => {
            AuthManager.cleanupModalBackdropStatic();
            resetCaminhaoForm();
        });
    }

    // Modal de abastecimento  
    const addAbastecimentoModal = document.getElementById('addAbastecimentoModal');
    if (addAbastecimentoModal) {
        addAbastecimentoModal.addEventListener('hidden.bs.modal', () => {
            AuthManager.cleanupModalBackdropStatic();
            resetAbastecimentoForm();
        });
    }

    // Modal de confirmação de exclusão
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('hidden.bs.modal', () => {
            AuthManager.cleanupModalBackdropStatic();
        });
    }
}

// ===== FUNÇÕES DE FILTRO DE ABASTECIMENTOS =====

// Configurar filtros de data para abastecimentos
function configurarFiltrosAbastecimento() {
    const filtroForm = document.getElementById('filtroAbastecimentoForm');
    const dataInicioInput = document.getElementById('filtroDataInicio');
    const dataFimInput = document.getElementById('filtroDataFim');
    const mesAtualBtn = document.getElementById('mesAtualBtn');
    const ultimosTrintaDiasBtn = document.getElementById('ultimosTrintaDiasBtn');
    const todosRegistrosBtn = document.getElementById('todosRegistrosBtn');

    // Definir mês atual como padrão
    definirMesAtual();

    // Event listeners para botões de período pré-definido
    mesAtualBtn.addEventListener('click', definirMesAtual);
    ultimosTrintaDiasBtn.addEventListener('click', definirUltimosTrintaDias);
    todosRegistrosBtn.addEventListener('click', removerFiltros);

    // Event listener para formulário de filtro
    filtroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        aplicarFiltroData();
    });

    // Event listeners para mudança automática nos campos de data
    dataInicioInput.addEventListener('change', aplicarFiltroData);
    dataFimInput.addEventListener('change', aplicarFiltroData);
}

// Definir período para mês atual
function definirMesAtual() {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

    document.getElementById('filtroDataInicio').value = inicioMes.toISOString().split('T')[0];
    document.getElementById('filtroDataFim').value = fimMes.toISOString().split('T')[0];
    
    aplicarFiltroData();
}

// Definir período para últimos 30 dias
function definirUltimosTrintaDias() {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    document.getElementById('filtroDataInicio').value = trintaDiasAtras.toISOString().split('T')[0];
    document.getElementById('filtroDataFim').value = hoje.toISOString().split('T')[0];
    
    aplicarFiltroData();
}

// Remover todos os filtros
function removerFiltros() {
    document.getElementById('filtroDataInicio').value = '';
    document.getElementById('filtroDataFim').value = '';
    
    filtroAbastecimentoAtivo = false;
    abastecimentosFiltrados = [];
    
    // Esconder indicador de filtro
    document.getElementById('indicadorFiltro').style.display = 'none';
    
    // Renderizar todos os abastecimentos
    renderAbastecimentos();
}

// Aplicar filtro de data
function aplicarFiltroData() {
    const dataInicio = document.getElementById('filtroDataInicio').value;
    const dataFim = document.getElementById('filtroDataFim').value;

    if (!dataInicio && !dataFim) {
        removerFiltros();
        return;
    }

    // Mostrar loading mais proeminente para operação de filtro
    AlertInfo.loadingSystem('🔍 Aplicando Filtro', 'Analisando registros por período selecionado...');

    // Usar setTimeout para permitir que o loading apareça antes do processamento
    setTimeout(() => {
        try {
            // Filtrar abastecimentos pelo período
            abastecimentosFiltrados = abastecimentos.filter(abastecimento => {
                const dataAbastecimento = new Date(abastecimento.data);
                const dataAbastStr = dataAbastecimento.toISOString().split('T')[0];

                let dentroDoIntervalo = true;

                if (dataInicio) {
                    dentroDoIntervalo = dentroDoIntervalo && dataAbastStr >= dataInicio;
                }

                if (dataFim) {
                    dentroDoIntervalo = dentroDoIntervalo && dataAbastStr <= dataFim;
                }

                return dentroDoIntervalo;
            });

            filtroAbastecimentoAtivo = true;

            // Atualizar indicador de filtro
            atualizarIndicadorFiltro(dataInicio, dataFim);

            // Renderizar abastecimentos filtrados
            renderAbastecimentosFiltrados();

            // Adicionar delay para garantir visibilidade do carregamento
            setTimeout(() => {
                // Fechar loading
                AlertUtils.close();

                // Toast de sucesso apenas se houver dados
                if (abastecimentosFiltrados.length > 0) {
                    AlertToast.success(`✅ Filtro aplicado! ${abastecimentosFiltrados.length} registro(s) encontrado(s).`);
                } else {
                    AlertWarning.noData('🔍 Nenhum registro encontrado para o período selecionado.');
                }
            }, 300);

        } catch (error) {
            console.error('[FILTRO] Erro ao aplicar filtro:', error);
            AlertUtils.close();
            AlertError.show('Erro no Filtro', 'Ocorreu um erro ao aplicar o filtro. Tente novamente.');
        }
    }, 400);
}

// Atualizar indicador visual do filtro ativo
function atualizarIndicadorFiltro(dataInicio, dataFim) {
    const indicador = document.getElementById('indicadorFiltro');
    const textoFiltro = document.getElementById('textoFiltro');
    
    let texto = '';
    if (dataInicio && dataFim) {
        const inicio = new Date(dataInicio).toLocaleDateString('pt-BR');
        const fim = new Date(dataFim).toLocaleDateString('pt-BR');
        texto = `Período: ${inicio} a ${fim} (${abastecimentosFiltrados.length} registros)`;
    } else if (dataInicio) {
        const inicio = new Date(dataInicio).toLocaleDateString('pt-BR');
        texto = `A partir de: ${inicio} (${abastecimentosFiltrados.length} registros)`;
    } else if (dataFim) {
        const fim = new Date(dataFim).toLocaleDateString('pt-BR');
        texto = `Até: ${fim} (${abastecimentosFiltrados.length} registros)`;
    }

    textoFiltro.textContent = texto;
    indicador.style.display = 'block';
}

// Renderizar tabela de caminhões
function renderCaminhoes() {
    const tableBody = document.getElementById('caminhaoTableBody');
    tableBody.innerHTML = '';
    
    caminhoes.forEach(caminhao => {
        const row = document.createElement('tr');
        
        // Calcular média de consumo do caminhão
        const abastecimentosCaminhao = abastecimentos.filter(a => a.caminhaoId === caminhao.id);
        let totalKm = 0;
        let totalLitros = 0;
        
        abastecimentosCaminhao.forEach(a => {
            totalKm += (a.kmFinal - a.kmInicial);
            totalLitros += parseFloat(a.litros);
        });
        const mediaConsumo = totalLitros > 0 ? (totalKm / totalLitros).toFixed(2) : 'N/A';
        
        row.innerHTML = `
            <td>${caminhao.placa}</td>
            <td>${caminhao.modelo}</td>
            <td>${caminhao.ano}</td>
            <td>${caminhao.capacidade}</td>
            <td>${mediaConsumo}</td>
            <td>${caminhao.motorista || 'Não atribuído'}</td>
            <td class="action-buttons admin-only">
                <button class="btn btn-sm btn-primary edit-caminhao" data-id="${caminhao.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-caminhao" data-id="${caminhao.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar manipuladores de eventos para botões de edição e exclusão
    document.querySelectorAll('.edit-caminhao').forEach(button => {
        button.addEventListener('click', () => editCaminhao(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-caminhao').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            showDeleteConfirmation(id, 'caminhao');
        });
    });
}

// Renderizar tabela de abastecimentos
function renderAbastecimentos() {
    const tableBody = document.getElementById('abastecimentoTableBody');
    tableBody.innerHTML = '';
    
    // Ordenar abastecimentos por data (mais recentes primeiro)
    const sortedAbastecimentos = [...abastecimentos].sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
    });
    
    sortedAbastecimentos.forEach(abastecimento => {
        const row = document.createElement('tr');
        // Encontrar o caminhão correspondente
        const caminhao = caminhoes.find(c => c.id === abastecimento.caminhaoId);
        const placaCaminhao = caminhao ? caminhao.placa : 'Desconhecido';
        const modeloCaminhao = caminhao ? caminhao.modelo : 'Desconhecido';
        
        // Calcular consumo
        const distancia = abastecimento.kmFinal - abastecimento.kmInicial;
        const consumo = (distancia / abastecimento.litros).toFixed(2);
        // Formatar período, se existir
        let periodoText = '';
        if (abastecimento.periodoInicio && abastecimento.periodoFim) {
            const inicio = new Date(abastecimento.periodoInicio).toLocaleDateString('pt-BR');
            const fim = new Date(abastecimento.periodoFim).toLocaleDateString('pt-BR');
            periodoText = `${inicio} a ${fim}`;
        }
        
        row.innerHTML = `
            <td>${placaCaminhao}</td>
            <td>${periodoText}</td>
            <td>${modeloCaminhao}</td>
            <td>${abastecimento.motorista}</td>
            <td>${formatarQuilometragem(abastecimento.kmInicial)}</td>
            <td>${formatarQuilometragem(abastecimento.kmFinal)}</td>
            <td>${formatarLitros(abastecimento.litros)}</td>
            <td>R$ ${parseFloat(abastecimento.valorLitro).toFixed(2)}</td>
            <td>R$ ${parseFloat(abastecimento.valorTotal).toFixed(2)}</td>
            <td>${consumo} km/l</td>
            <td class="action-buttons admin-only">
                <button class="btn btn-sm btn-primary edit-abastecimento" data-id="${abastecimento.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-abastecimento" data-id="${abastecimento.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar manipuladores de eventos para botões de edição e exclusão
    document.querySelectorAll('.edit-abastecimento').forEach(button => {
        button.addEventListener('click', () => editAbastecimento(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-abastecimento').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            showDeleteConfirmation(id, 'abastecimento');
        });
    });
}

// Salvar caminhão (novo ou editado)
async function saveCaminhao() {
    console.log('[APP] Iniciando salvamento de caminhão...');
    const caminhaoIdInput = document.getElementById('caminhaoId');
    const placaInput = document.getElementById('placa');
    const modeloInput = document.getElementById('modelo');
    const anoInput = document.getElementById('ano');
    const capacidadeInput = document.getElementById('capacidade');
    const motoristaInput = document.getElementById('motorista');
      // Validar campos obrigatórios
    if (!placaInput.value || !modeloInput.value || !anoInput.value || !capacidadeInput.value) {
        AlertError.validation('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Verificar se é uma edição ou um novo registro
    const isEdit = caminhaoIdInput.value !== '';
    console.log(`[APP] Tipo de operação: ${isEdit ? 'Edição' : 'Novo caminhão'}`);
    
    // Preparar objeto do caminhão
    const caminhaoObj = {
        id: isEdit ? caminhaoIdInput.value : null,
        placa: placaInput.value,
        modelo: modeloInput.value,
        ano: parseInt(anoInput.value),
        capacidade: parseFloat(capacidadeInput.value),
        motorista: motoristaInput.value
    };
    
    console.log('[APP] Objeto caminhão preparado:', caminhaoObj);
      try {
        // Mostrar loading animado
        const loadingInstance = AlertInfo.loadingData();
        
        console.log('[APP] Enviando caminhão para API...');
        // Usar dbApi em vez de localStorageApi para garantir que estamos usando a API do backend
        const savedCaminhao = await window.dbApi.salvarCaminhao(caminhaoObj);
        console.log('[APP] Caminhão salvo com sucesso:', savedCaminhao);
        
        // Fechar loading
        AlertUtils.close();
          // Atualizar array local
        if (isEdit) {
            const index = caminhoes.findIndex(c => c.id === caminhaoIdInput.value);
            if (index !== -1) {
                caminhoes[index] = savedCaminhao;
            }
        } else {
            caminhoes.push(savedCaminhao);
        }
         
        updateGlobalReferences();
        
        // Atualizar interface
        renderCaminhoes();
        populateCaminhaoSelects();
        updateDashboard();
        
        // Exibir toast de sucesso
        AlertToast.success(isEdit ? 'Caminhão atualizado com sucesso!' : 'Caminhão cadastrado com sucesso!');
        
        // Fechar modal e limpar formulário com limpeza completa do backdrop
        AuthManager.closeModalSafely('addCaminhaoModal', resetCaminhaoForm);
    } catch (err) {
        // Fechar loading em caso de erro
        if (AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        
        console.error('[APP] Erro ao salvar caminhão:', err);
        
        // Exibir mensagem de erro mais detalhada
        let mensagemErro = 'Ocorreu um erro ao salvar o caminhão. ';
        
        // Verificar se o erro tem uma mensagem específica
        if (err.message) {        console.error('[APP] Mensagem de erro:', err.message);
            if (err.message.includes('placa')) {
                mensagemErro += 'Já existe um caminhão com esta placa.';
            } else {
                mensagemErro += err.message;
            }
        } else {
            mensagemErro += 'Por favor, tente novamente.';
        }
        
        AlertError.show('Erro ao Salvar', mensagemErro);
    }
}

// Editar caminhão existente
function editCaminhao(id) {
    const caminhao = caminhoes.find(c => c.id === id);
    if (caminhao) {
        // Preencher formulário com dados do caminhão
        document.getElementById('caminhaoId').value = caminhao.id;
        document.getElementById('placa').value = caminhao.placa;
        document.getElementById('modelo').value = caminhao.modelo;
        document.getElementById('ano').value = caminhao.ano;
        document.getElementById('capacidade').value = caminhao.capacidade;
        document.getElementById('motorista').value = caminhao.motorista || '';
        
        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('addCaminhaoModal'));
        modal.show();
    }
}

// Resetar formulário de caminhão
function resetCaminhaoForm() {
    document.getElementById('caminhaoId').value = '';
    document.getElementById('placa').value = '';
    document.getElementById('modelo').value = '';
    document.getElementById('ano').value = '';
    document.getElementById('capacidade').value = '';
    document.getElementById('motorista').value = '';
}

// Salvar abastecimento (novo ou editado)
async function saveAbastecimento() {
    console.log('[APP] Iniciando salvamento de abastecimento...');
    const abastecimentoIdInput = document.getElementById('abastecimentoId');
    const periodoInicioInput = document.getElementById('periodoInicio');
    const periodoFimInput = document.getElementById('periodoFim');
    const caminhaoSelect = document.getElementById('caminhaoAbastecimento');
    const motoristaInput = document.getElementById('motoristaAbastecimento');
    const kmInicialInput = document.getElementById('kmInicial');
    const kmFinalInput = document.getElementById('kmFinal');
    const litrosInput = document.getElementById('litros');
    const valorLitroInput = document.getElementById('valorLitro');
    const postoInput = document.getElementById('posto');
    const observacoesInput = document.getElementById('observacoes');
      // Validar campos obrigatórios
    if (!periodoInicioInput.value || !periodoFimInput.value || !caminhaoSelect.value || !motoristaInput.value || 
        !kmInicialInput.value || !kmFinalInput.value || !litrosInput.value || !valorLitroInput.value) {
        AlertError.validation('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Validar se a data final é posterior à data inicial
    const dataInicio = new Date(periodoInicioInput.value);
    const dataFim = new Date(periodoFimInput.value);
    
    if (dataFim < dataInicio) {
        AlertError.validation('A data final do período deve ser posterior à data inicial.');
        return;
    }
    
    // Validar quilometragem
    const kmInicial = parseFloat(kmInicialInput.value);
    const kmFinal = parseFloat(kmFinalInput.value);
    
    if (kmFinal <= kmInicial) {
        AlertError.validation('A quilometragem final deve ser maior que a quilometragem inicial.');
        return;
    }
    
    // Calcular valor total
    const litros = parseFloat(litrosInput.value);
    const valorLitro = parseFloat(valorLitroInput.value);
    const valorTotal = litros * valorLitro;
      // Verificar se é uma edição ou um novo registro
    const isEdit = abastecimentoIdInput.value !== '';
    console.log(`[APP] Tipo de operação: ${isEdit ? 'Edição' : 'Novo abastecimento'}`);
    
    // Preparar objeto do abastecimento
    const abastecimentoObj = {
        id: isEdit ? abastecimentoIdInput.value : null,
        data: periodoInicioInput.value, // Usamos a data inicial como referência principal
        periodoInicio: periodoInicioInput.value,
        periodoFim: periodoFimInput.value,
        caminhaoId: caminhaoSelect.value,
        motorista: motoristaInput.value,
        kmInicial: kmInicial,
        kmFinal: kmFinal,
        litros: litros,
        valorLitro: valorLitro,
        valorTotal: valorTotal,
        posto: postoInput.value,
        observacoes: observacoesInput.value
    };
    
    console.log('[APP] Objeto abastecimento preparado:', abastecimentoObj);    try {
        // Mostrar loading animado
        const loadingInstance = AlertInfo.loadingData();
        
        console.log('[APP] Enviando abastecimento para API...');
        // Salvar usando dbApi para conectar ao backend
        const savedAbastecimento = await window.dbApi.salvarAbastecimento(abastecimentoObj);
        console.log('[APP] Abastecimento salvo com sucesso:', savedAbastecimento);
        
        // Fechar loading
        AlertUtils.close();
          // Atualizar array local
        if (isEdit) {
            const index = abastecimentos.findIndex(a => a.id === abastecimentoIdInput.value);
            if (index !== -1) {
                abastecimentos[index] = savedAbastecimento;
            }
        } else {
            abastecimentos.push(savedAbastecimento);
        }
          // Atualizar referências globais para os relatórios
        updateGlobalReferences();
        
        // Atualizar interface
        renderAbastecimentos();
        updateDashboard();
        
        // Exibir toast de sucesso
        AlertToast.success(isEdit ? 'Abastecimento atualizado com sucesso!' : 'Abastecimento cadastrado com sucesso!');
        
        // Fechar modal e limpar formulário com limpeza completa do backdrop
        AuthManager.closeModalSafely('addAbastecimentoModal', resetAbastecimentoForm);
    } catch (err) {
        // Fechar loading em caso de erro
        if (AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        
        console.error('[APP] Erro ao salvar abastecimento:', err);
        
        // Exibir mensagem de erro mais detalhada
        let mensagemErro = 'Ocorreu um erro ao salvar o abastecimento. ';
          // Verificar se o erro tem uma mensagem específica
        if (err.message) {
            console.error('[APP] Mensagem de erro:', err.message);
            mensagemErro += err.message;
        } else {
            mensagemErro += 'Por favor, tente novamente.';
        }
        
        AlertError.show('Erro ao Salvar', mensagemErro);
    }
}

// Editar abastecimento existente
function editAbastecimento(id) {
    const abastecimento = abastecimentos.find(a => a.id === id);
    if (abastecimento) {
        // Preencher formulário com dados do abastecimento
        document.getElementById('abastecimentoId').value = abastecimento.id;
        document.getElementById('periodoInicio').value = abastecimento.periodoInicio || '';
        document.getElementById('periodoFim').value = abastecimento.periodoFim || '';
        document.getElementById('caminhaoAbastecimento').value = abastecimento.caminhaoId;
        document.getElementById('motoristaAbastecimento').value = abastecimento.motorista;
        document.getElementById('kmInicial').value = abastecimento.kmInicial;
        document.getElementById('kmFinal').value = abastecimento.kmFinal;
        document.getElementById('litros').value = abastecimento.litros;
        document.getElementById('valorLitro').value = abastecimento.valorLitro;
        document.getElementById('posto').value = abastecimento.posto || '';
        document.getElementById('observacoes').value = abastecimento.observacoes || '';
        
        // Abrir modal
        const modal = new bootstrap.Modal(document.getElementById('addAbastecimentoModal'));
        modal.show();
    }
}

// Resetar formulário de abastecimento
function resetAbastecimentoForm() {
    document.getElementById('abastecimentoId').value = '';
    document.getElementById('periodoInicio').value = new Date().toISOString().split('T')[0]; // Data atual
    document.getElementById('periodoFim').value = new Date().toISOString().split('T')[0]; // Data atual
    document.getElementById('caminhaoAbastecimento').value = '';
    document.getElementById('motoristaAbastecimento').value = '';
    document.getElementById('kmInicial').value = '';
    document.getElementById('kmFinal').value = '';
    document.getElementById('litros').value = '';
    document.getElementById('valorLitro').value = '';
    document.getElementById('posto').value = '';
    document.getElementById('observacoes').value = '';
}

// Calcular distância automaticamente
function calcularDistancia() {
    const kmInicial = parseFloat(document.getElementById('kmInicial').value) || 0;
    const kmFinal = parseFloat(document.getElementById('kmFinal').value) || 0;
    
    if (kmInicial > 0 && kmFinal > 0) {
        const distancia = kmFinal - kmInicial;
        // Você pode adicionar um campo para mostrar a distância se desejar
        // document.getElementById('distancia').value = distancia;
    }
}

// Calcular valor total automaticamente
function calcularValorTotal() {
    const litros = parseFloat(document.getElementById('litros').value) || 0;
    const valorLitro = parseFloat(document.getElementById('valorLitro').value) || 0;
    
    if (litros > 0 && valorLitro > 0) {
        const valorTotal = litros * valorLitro;
        // Você pode adicionar um campo para mostrar o valor total se desejar
        // document.getElementById('valorTotal').value = valorTotal.toFixed(2);
    }
}

// Preencher selects de caminhões em vários formulários
function populateCaminhaoSelects() {
    // Select para abastecimentos
    const caminhaoAbastecimentoSelect = document.getElementById('caminhaoAbastecimento');
    caminhaoAbastecimentoSelect.innerHTML = '<option value="">Selecione um caminhão</option>';
    
    // Select para relatórios
    const caminhaoRelatorioSelect = document.getElementById('caminhaoSelect');
    caminhaoRelatorioSelect.innerHTML = '<option value="todos">Todos os caminhões</option>';
    
    // Select para relatórios de custos
    const caminhaoCustosSelect = document.getElementById('caminhaoCustosSelect');
    caminhaoCustosSelect.innerHTML = '<option value="todos">Todos os caminhões</option>';
    
    // Select para dashboard
    const dashboardCaminhaoSelect = document.getElementById('dashboardCaminhaoSelect');
    dashboardCaminhaoSelect.innerHTML = '<option value="todos">Todos os caminhões</option>';
    caminhoes.forEach(caminhao => {
        const opt = document.createElement('option');
        opt.value = caminhao.id;
        opt.textContent = `${caminhao.placa} - ${caminhao.modelo}`;
        dashboardCaminhaoSelect.appendChild(opt);
    });
    
    // Adicionar opções para cada caminhão
    caminhoes.forEach(caminhao => {
        const option1 = document.createElement('option');
        option1.value = caminhao.id;
        option1.textContent = `${caminhao.placa} - ${caminhao.modelo}`;
        caminhaoAbastecimentoSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = caminhao.id;
        option2.textContent = `${caminhao.placa} - ${caminhao.modelo}`;
        caminhaoRelatorioSelect.appendChild(option2);
        
        const option3 = document.createElement('option');
        option3.value = caminhao.id;
        option3.textContent = `${caminhao.placa} - ${caminhao.modelo}`;
        caminhaoCustosSelect.appendChild(option3);
    });
}

// Mostrar modal de confirmação de exclusão
async function showDeleteConfirmation(id, type) {
    const itemName = type === 'caminhao' ? 'caminhão' : 'abastecimento';
    
    const result = await AlertConfirm.delete(itemName);
    if (result.isConfirmed) {
        await confirmDelete(id, type);
    }
}

// Confirmar exclusão de item (agora chamada diretamente pela confirmação)
async function confirmDelete(id, type) {
    
    try {
        // Mostrar loading para operação de exclusão
        const loadingInstance = AlertInfo.loadingData();
        
        if (type === 'caminhao') {
            // Verificar se há abastecimentos associados a este caminhão
            const abastecimentosAssociados = abastecimentos.some(a => a.caminhaoId === id);
            
            if (abastecimentosAssociados) {
                // Fechar loading temporariamente para mostrar confirmação
                AlertUtils.close();
                
                // Mostrar alerta estilizado de confirmação
                const result = await AlertConfirm.deleteWithAbastecimentos();
                
                if (!result.isConfirmed) {
                    return; // Usuário cancelou
                }
                
                // Mostrar loading novamente após confirmação
                AlertInfo.loadingSystem('🗑️ Excluindo Caminhão', 'Removendo caminhão e abastecimentos associados...');
                
                // Remover abastecimentos associados
                abastecimentos.filter(a => a.caminhaoId === id).forEach(async (a) => {
                    await window.dbApi.excluirAbastecimento(a.id);
                });
                abastecimentos = abastecimentos.filter(a => a.caminhaoId !== id);
            }
              // Excluir caminhão
            await window.dbApi.excluirCaminhao(id);
            caminhoes = caminhoes.filter(c => c.id !== id);
            
            // Atualizar referências globais para os relatórios
            updateGlobalReferences();
            
            // Atualizar interface
            renderCaminhoes();
            renderAbastecimentos();
            populateCaminhaoSelects();
        } else if (type === 'abastecimento') {
            // Excluir abastecimento
            await window.dbApi.excluirAbastecimento(id);
            abastecimentos = abastecimentos.filter(a => a.id !== id);
            
            // Atualizar referências globais para os relatórios
            updateGlobalReferences();
            
            // Atualizar interface
            renderAbastecimentos();
        }
          // Atualizar dashboard
        updateDashboard();
        
        // Fechar loading
        AlertUtils.close();
        
        // Exibir toast de sucesso
        const itemName = type === 'caminhao' ? 'Caminhão' : 'Abastecimento';
        AlertToast.success(`${itemName} excluído com sucesso!`);
    } catch (err) {
        // Fechar loading em caso de erro
        if (AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        console.error('Erro ao excluir item:', err);
        AlertError.show('Erro ao Excluir', 'Ocorreu um erro ao excluir o item. Por favor, tente novamente.');
    }
}

// Função para limpar os dados (útil para testes ou redefinição)
async function clearAllData() {
    const result = await AlertConfirm.clearData();
    if (result.isConfirmed) {
        try {
            // Mostrar loading para operação de limpeza
            const loadingInstance = AlertInfo.loadingSystem(
                'Removendo Todos os Dados',
                'Limpando banco de dados e dados locais. Esta operação pode levar alguns instantes.'
            );
            
            // Limpar dados usando dbApi
            await window.dbApi.limparTodosDados();
              // Limpar arrays locais
            caminhoes = [];
            abastecimentos = [];
            
            // Atualizar referências globais para os relatórios
            updateGlobalReferences();
            
            // Atualizar interface
            renderCaminhoes();
            renderAbastecimentos();
            updateDashboard();
            populateCaminhaoSelects();
            
            // Fechar loading
            AlertUtils.close();
            
            AlertSuccess.show('Dados Removidos', 'Todos os dados foram removidos com sucesso.');
        } catch (err) {
            // Fechar loading em caso de erro
            if (AlertUtils.isOpen()) {
                AlertUtils.close();
            }
            console.error('Erro ao limpar dados:', err);
            AlertError.show('Erro ao Limpar', 'Ocorreu um erro ao limpar os dados. Por favor, tente novamente.');
        }
    }
}

// Funções para teste direto da API
async function testarApiCaminhao() {
    console.log('[TEST] Iniciando teste de API para caminhões');
    
    try {
        // Mostrar loading para teste da API
        const loadingInstance = AlertInfo.loadingData();
        
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
        
        // Fechar loading
        AlertUtils.close();
        
        // Atualizar a interface após o sucesso
        AlertSuccess.detailed(
            'Teste Realizado com Sucesso!',
            `Caminhão "${data.modelo}" com placa "${data.placa}" foi criado no banco de dados.`
        );
        
        // Recarregar dados
        await loadDataFromLocalStorage();
        renderCaminhoes();
        
    } catch (error) {
        // Fechar loading em caso de erro
        if (AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        console.error('[TEST] Erro no teste da API:', error);
        AlertError.api(error);
    }
}

// Função para testar API de abastecimentos
async function testarApiAbastecimento() {
    console.log('[TEST] Iniciando teste de API para abastecimentos');
    
    try {
        // Mostrar loading para teste da API
        const loadingInstance = AlertInfo.loadingData();
        
        // Primeiro, precisamos obter um caminhão existente
        const caminhoes = await window.dbApi.buscarCaminhoes();
        
        if (!caminhoes || caminhoes.length === 0) {
            throw new Error('Não existem caminhões cadastrados. Crie um caminhão primeiro.');
        }
        
        // Escolher um caminhão aleatório
        const caminhao = caminhoes[Math.floor(Math.random() * caminhoes.length)];
        console.log('[TEST] Usando caminhão:', caminhao);
        
        // Criar dados de teste para abastecimento
        const hoje = new Date();
        const randomNum = Math.floor(Math.random() * 10000);
        const testAbastecimento = {
            data: hoje.toISOString().split('T')[0],
            periodoInicio: hoje.toISOString().split('T')[0],
            periodoFim: hoje.toISOString().split('T')[0],
            caminhaoId: caminhao.id,
            motorista: `Motorista Teste ${randomNum}`,
            kmInicial: 1000,
            kmFinal: 1500,
            litros: 100,
            valorLitro: 5.5,
            valorTotal: 550,
            posto: `Posto Teste ${randomNum}`,
            observacoes: `Abastecimento de teste via API ${randomNum}`
        };
        
        console.log('[TEST] Dados de teste:', testAbastecimento);
        
        // Fazer chamada direta à API usando fetch
        const response = await fetch(`${window.API_BASE_URL}/abastecimentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testAbastecimento)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro desconhecido'}`);
        }
        
        const data = await response.json();
        console.log('[TEST] Resposta do servidor:', data);
        
        // Fechar loading
        AlertUtils.close();
        
        // Atualizar a interface após o sucesso
        AlertSuccess.detailed(
            'Teste Realizado com Sucesso!',
            `Abastecimento para o caminhão "${caminhao.placa}" foi criado no banco de dados.`
        );
        
        // Recarregar dados
        await loadDataFromLocalStorage();
        renderAbastecimentos();
        updateDashboard();
        
    } catch (error) {
        // Fechar loading em caso de erro
        if (AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        console.error('[TEST] Erro no teste da API:', error);
        AlertError.api(error);
    }
}

// Função para testar mapeamento de campos entre frontend e backend
async function testarMapeamentoCampos() {
    console.log('🧪 [TESTE MAPEAMENTO] Iniciando teste de mapeamento de campos...');
    
    try {
        // Mostrar loading para teste de mapeamento
        const loadingInstance = AlertInfo.loadingData();
        
        // 1. Verificar se há caminhões disponíveis
        console.log('[TESTE MAPEAMENTO] 1️⃣ Buscando caminhões...');
        const caminhoesDisponiveis = await window.dbApi.buscarCaminhoes();
        console.log('[TESTE MAPEAMENTO] Caminhões encontrados:', caminhoesDisponiveis);
        
        if (caminhoesDisponiveis.length === 0) {
            throw new Error('Nenhum caminhão encontrado. Crie um caminhão primeiro.');
        }
        
        // 2. Usar o primeiro caminhão disponível
        const caminhaoTeste = caminhoesDisponiveis[0];
        console.log('[TESTE MAPEAMENTO] Usando caminhão:', caminhaoTeste);
        
        // 3. Criar dados de teste com campos em camelCase (formato frontend)
        const hoje = new Date();
        const dadosAbastecimento = {
            data: hoje.toISOString().split('T')[0],
            periodoInicio: hoje.toISOString().split('T')[0], // camelCase
            periodoFim: hoje.toISOString().split('T')[0], // camelCase
            caminhaoId: caminhaoTeste.id, // camelCase
            motorista: 'Teste Mapeamento Automático',
            kmInicial: 8000, // camelCase
            kmFinal: 8250, // camelCase
            litros: 45,
            valorLitro: 6.2, // camelCase
            valorTotal: 279, // camelCase
            posto: 'Posto Teste Mapeamento',
            observacoes: 'Teste automático de mapeamento de campos entre frontend e backend'
        };
        
        console.log('[TESTE MAPEAMENTO] 2️⃣ Dados de teste (formato frontend - camelCase):', dadosAbastecimento);
        
        // 4. Salvar abastecimento via API frontend
        console.log('[TESTE MAPEAMENTO] 3️⃣ Salvando abastecimento via frontend API...');
        const abastecimentoSalvo = await window.dbApi.salvarAbastecimento(dadosAbastecimento);
        console.log('[TESTE MAPEAMENTO] Abastecimento salvo (resposta do backend):', abastecimentoSalvo);
        
        // 5. Verificar se os campos foram mapeados corretamente na resposta
        console.log('[TESTE MAPEAMENTO] 4️⃣ Verificando mapeamento na resposta...');
        
        const camposEsperadosResposta = ['caminhaoId', 'periodoInicio', 'periodoFim', 'kmInicial', 'kmFinal', 'valorLitro', 'valorTotal'];
        const camposMissingResposta = camposEsperadosResposta.filter(campo => !(campo in abastecimentoSalvo));
        
        if (camposMissingResposta.length > 0) {
            console.warn('[TESTE MAPEAMENTO] ⚠️ Campos não mapeados na resposta:', camposMissingResposta);
        } else {
            console.log('[TESTE MAPEAMENTO] ✅ Campos mapeados corretamente na resposta!');
        }
        
        // 6. Buscar todos os abastecimentos para verificar o mapeamento na listagem
        console.log('[TESTE MAPEAMENTO] 5️⃣ Verificando mapeamento na listagem...');
        const abastecimentosListagem = await window.dbApi.buscarAbastecimentos();
        console.log('[TESTE MAPEAMENTO] Abastecimentos na listagem:', abastecimentosListagem);
        
        // Encontrar o abastecimento criado na listagem
        const abastecimentoNaListagem = abastecimentosListagem.find(a => a.id === abastecimentoSalvo.id);
        if (!abastecimentoNaListagem) {
            throw new Error('Abastecimento criado não foi encontrado na listagem');
        }
        
        console.log('[TESTE MAPEAMENTO] Abastecimento encontrado na listagem:', abastecimentoNaListagem);
        
        // Verificar se os campos estão em camelCase na listagem
        const camposMissingListagem = camposEsperadosResposta.filter(campo => !(campo in abastecimentoNaListagem));
        if (camposMissingListagem.length > 0) {
            console.warn('[TESTE MAPEAMENTO] ⚠️ Campos não mapeados na listagem:', camposMissingListagem);
        } else {
            console.log('[TESTE MAPEAMENTO] ✅ Campos mapeados corretamente na listagem!');
        }
        
        // 7. Limpar dados de teste
        console.log('[TESTE MAPEAMENTO] 6️⃣ Limpando dados de teste...');
        await window.dbApi.excluirAbastecimento(abastecimentoSalvo.id);
        console.log('[TESTE MAPEAMENTO] ✅ Dados de teste removidos');
        
        // 8. Resultado final
        const resultadoFinal = {
            sucesso: true,
            camposMapeadosResposta: camposMissingResposta.length === 0,
            camposMapeadosListagem: camposMissingListagem.length === 0,
            abastecimentoTeste: abastecimentoSalvo
        };
          console.log('[TESTE MAPEAMENTO] 🎉 TESTE CONCLUÍDO!');
        console.log('[TESTE MAPEAMENTO] Resultado final:', resultadoFinal);
        
        // Fechar loading
        AlertUtils.close();
        
        if (resultadoFinal.camposMapeadosResposta && resultadoFinal.camposMapeadosListagem) {
            AlertSuccess.detailed(
                '✅ Teste de Mapeamento PASSOU!',
                'O mapeamento de campos entre frontend e backend está funcionando corretamente.'
            );
        } else {
            AlertWarning.show(
                '⚠️ Teste de Mapeamento com AVISOS!',
                'Alguns campos podem não estar sendo mapeados corretamente.\n\nConsulte o console para detalhes.'
            );
        }
        
        return resultadoFinal;
        
    } catch (error) {
        // Fechar loading em caso de erro
        if (AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        
        console.error('[TESTE MAPEAMENTO] ❌ ERRO NO TESTE:', error);
        AlertError.detailed(
            '❌ Teste de Mapeamento FALHOU!',
            `Erro: ${error.message}`
        );
        return {
            sucesso: false,
            erro: error.message
        };
    }
}

// Renderizar tabela de abastecimentos filtrados
function renderAbastecimentosFiltrados() {
    const tableBody = document.getElementById('abastecimentoTableBody');
    tableBody.innerHTML = '';
    
    // Usar abastecimentos filtrados ou todos se não houver filtro ativo
    const dadosParaRenderizar = filtroAbastecimentoAtivo ? abastecimentosFiltrados : abastecimentos;
    
    // Ordenar abastecimentos por data (mais recentes primeiro)
    const sortedAbastecimentos = [...dadosParaRenderizar].sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
    });
    
    sortedAbastecimentos.forEach(abastecimento => {
        const row = document.createElement('tr');
        // Encontrar o caminhão correspondente
        const caminhao = caminhoes.find(c => c.id === abastecimento.caminhaoId);
        const placaCaminhao = caminhao ? caminhao.placa : 'Desconhecido';
        const modeloCaminhao = caminhao ? caminhao.modelo : 'Desconhecido';
        
        // Calcular consumo
        const distancia = abastecimento.kmFinal - abastecimento.kmInicial;
        const consumo = (distancia / abastecimento.litros).toFixed(2);
        
        // Formatar período, se existir
        let periodoText = '';
        if (abastecimento.periodoInicio && abastecimento.periodoFim) {
            const inicio = new Date(abastecimento.periodoInicio).toLocaleDateString('pt-BR');
            const fim = new Date(abastecimento.periodoFim).toLocaleDateString('pt-BR');
            periodoText = `${inicio} a ${fim}`;
        }
        
        row.innerHTML = `
            <td>${placaCaminhao}</td>
            <td>${periodoText}</td>
            <td>${modeloCaminhao}</td>
            <td>${abastecimento.motorista}</td>
            <td>${formatarQuilometragem(abastecimento.kmInicial)}</td>
            <td>${formatarQuilometragem(abastecimento.kmFinal)}</td>
            <td>${formatarLitros(abastecimento.litros)}</td>
            <td>R$ ${parseFloat(abastecimento.valorLitro).toFixed(2)}</td>
            <td>R$ ${parseFloat(abastecimento.valorTotal).toFixed(2)}</td>
            <td>${consumo} km/l</td>
            <td class="action-buttons admin-only">
                <button class="btn btn-sm btn-primary edit-abastecimento" data-id="${abastecimento.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-abastecimento" data-id="${abastecimento.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar manipuladores de eventos para botões de edição e exclusão
    document.querySelectorAll('.edit-abastecimento').forEach(button => {
        button.addEventListener('click', () => editAbastecimento(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-abastecimento').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            showDeleteConfirmation(id, 'abastecimento');
        });
    });
}

// ===== FUNÇÃO DO DASHBOARD =====

// Atualizar dados do dashboard
async function updateDashboard() {
    try {
        console.log('[DASHBOARD] Atualizando dashboard...');
        
        // Mostrar loading mais proeminente para atualização do dashboard
        AlertInfo.loadingSystem(
            'Atualizando Dashboard',
            'Processando dados de caminhões e abastecimentos para gerar estatísticas e gráficos atualizados.'
        );

        // Obter datas dos filtros do dashboard
        const dataInicio = document.getElementById('dashboardDataInicio').value;
        const dataFim = document.getElementById('dashboardDataFim').value;
        const caminhaoId = document.getElementById('dashboardCaminhaoSelect').value;
        
        console.log('[DASHBOARD] Filtros aplicados:', { dataInicio, dataFim, caminhaoId });
        
        // Validar se as datas estão definidas
        if (!dataInicio || !dataFim) {
            console.warn('[DASHBOARD] Datas não definidas, usando valores padrão');
            const hoje = new Date();
            const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
            const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth()+1, 0).toISOString().split('T')[0];
            
            document.getElementById('dashboardDataInicio').value = primeiroDia;
            document.getElementById('dashboardDataFim').value = ultimoDia;
            // Fechar loading antes de reexecutar
            AlertUtils.close();
            return updateDashboard(); // Reexecutar com as datas definidas
        }
        
        // Usar setTimeout para permitir que o loading apareça e seja visível
        setTimeout(async () => {
            try {
                // Pequena pausa para mostrar o processamento
                await new Promise(resolve => setTimeout(resolve, 600));
                
                // Filtrar abastecimentos pelo período
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim + 'T23:59:59');
                
                let abastecimentosFiltrados = abastecimentos.filter(a => {
                    const dataAbast = new Date(a.data);
                    return dataAbast >= inicio && dataAbast <= fim;
                });
                
                // Filtrar por caminhão específico se selecionado
                if (caminhaoId && caminhaoId !== 'todos') {
                    abastecimentosFiltrados = abastecimentosFiltrados.filter(a => a.caminhaoId === caminhaoId);
                }
                
                console.log('[DASHBOARD] Abastecimentos filtrados:', abastecimentosFiltrados.length);
                
                // Calcular estatísticas
                const stats = calcularEstatisticas(abastecimentosFiltrados);
                console.log('[DASHBOARD] Estatísticas calculadas:', stats);
                
                // Atualizar cards do dashboard
                atualizarCards(stats);
                
                // Atualizar gráficos
                if (typeof updateCharts === 'function') {
                    updateCharts();
                } else {
                    console.warn('[DASHBOARD] Função updateCharts não disponível');
                }
                
                console.log('[DASHBOARD] Dashboard atualizado com sucesso');
                
                // Pequena pausa adicional para garantir que toda a atualização seja processada
                await new Promise(resolve => setTimeout(resolve, 400));
                
                // Fechar loading
                AlertUtils.close();
                
                // Toast de sucesso discreto após um momento
                setTimeout(() => {
                    AlertToast.success(`Dashboard atualizado! ${abastecimentosFiltrados.length} registro(s) processado(s).`);
                }, 200);
                
            } catch (error) {
                console.error('[DASHBOARD] Erro ao processar dados:', error);
                AlertUtils.close();
                AlertError.show('Erro no Dashboard', 'Ocorreu um erro ao atualizar o dashboard. Tente novamente.');
            }
        }, 100);
        
    } catch (error) {
        console.error('[DASHBOARD] Erro ao atualizar dashboard:', error);
        AlertUtils.close();
        AlertError.show('Erro no Dashboard', 'Ocorreu um erro ao inicializar a atualização do dashboard.');
    }
}

// Calcular estatísticas para o dashboard
function calcularEstatisticas(abastecimentosFiltrados) {
    // Estatísticas básicas
    const totalCaminhoesAtivos = caminhoes.filter(c => c.status === 'ativo' || !c.status).length;
    const totalAbastecimentos = abastecimentosFiltrados.length;
    
    // Calcular totais
    let totalLitros = 0;
    let totalGasto = 0;
    let totalKm = 0;
    
    abastecimentosFiltrados.forEach(a => {
        totalLitros += parseFloat(a.litros) || 0;
        totalGasto += parseFloat(a.valorTotal) || 0;
        const distancia = (parseFloat(a.kmFinal) || 0) - (parseFloat(a.kmInicial) || 0);
        if (distancia > 0) {
            totalKm += distancia;
        }
    });
    
    // Calcular média de consumo (km/l)
    const mediaConsumo = totalLitros > 0 ? (totalKm / totalLitros) : 0;
    
    return {
        totalCaminhoes: totalCaminhoesAtivos,
        totalAbastecimentos,
        totalLitros,
        totalGasto,
        totalKm,
        mediaConsumo
    };
}

// Atualizar cards do dashboard com as estatísticas
function atualizarCards(stats) {
    try {
        // Card: Total Caminhões
        const totalCaminhoesEl = document.getElementById('totalCaminhoes');
        if (totalCaminhoesEl) {
            totalCaminhoesEl.textContent = stats.totalCaminhoes;
        }
        
        // Card: Total Abastecimentos
        const totalAbastecimentosEl = document.getElementById('totalAbastecimentos');
        if (totalAbastecimentosEl) {
            totalAbastecimentosEl.textContent = stats.totalAbastecimentos;
        }
        
        // Card: Média de Consumo
        const mediaConsumoEl = document.getElementById('mediaConsumo');
        if (mediaConsumoEl) {
            const consumoFormatado = stats.mediaConsumo > 0 ? 
                `${stats.mediaConsumo.toFixed(2)} km/l` : '0 km/l';
            mediaConsumoEl.textContent = consumoFormatado;
        }
        
        // Card: Gasto Total
        const gastoTotalEl = document.getElementById('gastoTotal');
        if (gastoTotalEl) {
            const gastoFormatado = stats.totalGasto > 0 ? 
                `R$ ${stats.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                'R$ 0,00';
            gastoTotalEl.textContent = gastoFormatado;
        }
        
        console.log('[DASHBOARD] Cards atualizados:', {
            caminhoes: stats.totalCaminhoes,
            abastecimentos: stats.totalAbastecimentos,
            consumo: stats.mediaConsumo.toFixed(2),
            gasto: stats.totalGasto.toFixed(2)
        });
        
    } catch (error) {
        console.error('[DASHBOARD] Erro ao atualizar cards:', error);
    }
}

// ===== FUNÇÃO GLOBAL PARA INTEGRAÇÃO COM AUTENTICAÇÃO =====

// Função global para carregar o dashboard - será chamada pelo sistema de autenticação
window.loadDashboard = async function() {
    try {
        console.log('[APP] Carregando dashboard...');
        
        // A aplicação principal já está sempre visível
        // Garantir que esteja visível (por compatibilidade)
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.display = 'block';
        }
        
        // Carregar todos os dados iniciais
        await loadDataFromLocalStorage();
        
        // Renderizar dados na interface
        renderCaminhoes();
        renderAbastecimentos();
        updateDashboard();
        populateCaminhaoSelects();
        
        // Mostrar a seção dashboard por padrão
        showSection('dashboardSection');
        
        console.log('[APP] Dashboard carregado com sucesso');
    } catch (error) {
        console.error('[APP] Erro ao carregar dashboard:', error);
        AlertError.show('Erro', 'Erro ao carregar o sistema. Recarregue a página.');
    }
};

// Função para aplicar visibilidade baseada em papel do usuário
window.applyRoleVisibility = function(userRole) {
    console.log('[APP] Aplicando visibilidade para papel:', userRole);
    
    // Remover classes de papel existentes do body
    document.body.classList.remove('role-admin', 'role-user', 'role-guest');
    
    // Adicionar a classe correspondente ao papel do usuário
    if (userRole === 'admin') {
        document.body.classList.add('role-admin');
    } else if (userRole === 'user') {
        document.body.classList.add('role-user');
    } else {
        // Usuário não autenticado (convidado)
        document.body.classList.add('role-guest');
    }
    
    console.log('[APP] Visibilidade aplicada. Classes do body:', document.body.className);
};
