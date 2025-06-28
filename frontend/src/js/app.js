// Variáveis globais
let caminhoes = [];
let abastecimentos = [];
let despesas = [];
let currentSection = 'dashboardSection';

// Variáveis para controle de filtros de abastecimentos
let filtroAbastecimentoAtivo = false;
let abastecimentosFiltrados = [];

// Disponibilizar dados globalmente para os relatórios
window.caminhoes = caminhoes;
window.abastecimentos = abastecimentos;
window.despesas = despesas;

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

    // Mostrar loading IMEDIATAMENTE
    let loadingAlert = null;
    try {
        let attempts = 0;
        while (typeof Swal === 'undefined' && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (typeof Swal !== 'undefined') {
            console.log('🚛 [INIT] Mostrando loading inicial...');
            loadingAlert = Swal.fire({
                html: `
                    <div class="system-loading-container">
                        <div class="fleet-animation">
                            <div class="truck-convoy">
                                <div class="truck-unit">🚛</div>
                                <div class="truck-unit delay-1">🚚</div>
                                <div class="truck-unit delay-2">🚐</div>
                            </div>
                            <div class="loading-highway">
                                <div class="highway-line"></div>
                                <div class="highway-line delay"></div>
                            </div>
                        </div>
                        <div class="system-loading-text">
                            <h3 class="loading-title">🚚 Inicializando Sistema Logístico</h3>
                            <p class="loading-description">Carregando componentes, verificando conectividade e sincronizando dados...</p>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill"></div>
                                </div>
                                <div class="progress-text">Inicializando...</div>
                                <div class="loading-status">
                                    <div class="status-item">🔧 Carregando scripts</div>
                                    <div class="status-item" style="animation-delay: 1s;">📡 Verificando API</div>
                                    <div class="status-item" style="animation-delay: 2s;">💾 Sincronizando dados</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                width: '520px',
                backdrop: 'rgba(0,0,0,0.8)',
                customClass: {
                    popup: 'system-loading-modal'
                }
            });
        }
    } catch (error) {
        console.warn('⚠️ [INIT] Erro ao mostrar loading inicial:', error);
    }

    // Aguardar scripts carregarem
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
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!window.dbApi) {
            console.error('❌ window.dbApi ainda não está disponível após espera adicional');
            console.warn('⚠️ Usando localStorage como fallback');
        }
    }

    // Verificar conexão com a API (assíncrono)
    verificarStatusAPI();

    // Carregar dados do backend ou localStorage
    console.log('🔄 [INIT] Iniciando carregamento de dados...');
    await loadDataFromLocalStorage();
    console.log('✅ [INIT] Carregamento de dados concluído');

    // Configurar navegação
    setupNavigation();

    // Configurar manipuladores de eventos
    setupEventHandlers();

    // Renderizar dados iniciais
    renderCaminhoes();
    renderAbastecimentos();
    renderDespesas();

    // Configurar filtros após renderizar dados
    configurarFiltrosAbastecimento();
    configurarFiltrosDespesas();

    // Inicializar gráficos
    if (typeof initCharts === 'function') {
        initCharts();
    }

    updateDashboard();
    populateCaminhaoSelects();

    // Definir filtros padrão do dashboard para mês atual
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
    if (document.getElementById('dashboardDataInicio')) {
        document.getElementById('dashboardDataInicio').value = primeiroDia;
    }
    if (document.getElementById('dashboardDataFim')) {
        document.getElementById('dashboardDataFim').value = ultimoDia;
    }

    // FECHAR O LOADING APÓS TUDO ESTAR PRONTO
    try {
        if (loadingAlert && typeof Swal !== 'undefined') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('🎯 [INIT] Fechando loading - inicialização completa!');
            Swal.close();
        }
    } catch (error) {
        console.warn('⚠️ [INIT] Erro ao fechar loading:', error);
    }

    console.log('🎉 [INIT] === APLICAÇÃO TOTALMENTE INICIALIZADA ===');

    // Evento para atualizar dashboard
    if (document.getElementById('atualizarDashboard')) {
        document.getElementById('atualizarDashboard').addEventListener('click', e => {
            e.preventDefault();
            updateDashboard();
        });
    }

    // Após inicialização, exibir dashboard automaticamente
    if (currentSection === 'dashboardSection') {
        updateDashboard();
    }

    // Aplicar visibilidade padrão para usuários não autenticados
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        if (window.applyRoleVisibility) {
            window.applyRoleVisibility('guest');
        }
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }
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
        if (!isFirstConnection && window.apiWasDisconnected) {
            AlertInfo.connecting(
                'Reconectando ao servidor...',
                'Tentando restabelecer a conexão. Isso pode levar até um minuto. Você pode continuar navegando normalmente.'
            );
        }
        const conexao = await window.dbApi?.testarConexao?.();
        if (!isFirstConnection && AlertUtils.isOpen()) {
            AlertUtils.close();
        }
        if (conexao) {
            console.log('[APP] API conectada com sucesso');
            if (isFirstConnection || window.apiWasDisconnected) {
                if (window.apiWasDisconnected) {
                    AlertInfo.reconnected('Conexão restabelecida!');
                } else {
                    AlertToast.success('Sistema conectado e pronto para uso!');
                }
                window.apiWasDisconnected = false;
            }
            window.apiConnected = true;
        } else {
            console.warn('[APP] API parcialmente conectada');
            window.apiConnected = false;
            window.apiWasDisconnected = true;
            showConnectionAttempt();
        }
    } catch (error) {
        console.error('[APP] Erro ao conectar com a API:', error);
        window.apiConnected = false;
        window.apiWasDisconnected = true;
        showConnectionAttempt();
    }
    isFirstConnection = false;
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
    console.log('📊 [LOAD] Iniciando carregamento de dados...');
    try {
        console.log('📦 [LOAD] Carregando dados de caminhões...');
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('⛽ [LOAD] Carregando dados de abastecimentos...');
        await new Promise(resolve => setTimeout(resolve, 600));
        console.log('📈 [LOAD] Processando estatísticas...');
        await new Promise(resolve => setTimeout(resolve, 400));
        if (window.dbApi && typeof window.dbApi.buscarCaminhoes === 'function') {
            console.log('[LOAD] Usando window.dbApi para buscar dados...');
            caminhoes = await window.dbApi.buscarCaminhoes();
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('[LOAD] ⛽ Carregando abastecimentos...');
            abastecimentos = await window.dbApi.buscarAbastecimentos();
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('[LOAD] 💰 Carregando despesas...');
            try {
                despesas = await window.dbApi.buscarDespesas();
                console.log('[LOAD] ✅ Despesas carregadas:', despesas.length);
            } catch (error) {
                console.error('[LOAD] ❌ Erro ao carregar despesas:', error);
                despesas = [];
            }
            console.log('[LOAD] Dados carregados via API:', {
                caminhoes: caminhoes.length,
                abastecimentos: abastecimentos.length,
                despesas: despesas.length
            });
        } else {
            console.warn('[LOAD] window.dbApi não disponível, usando localStorage');
            const caminhoesJSON = localStorage.getItem('caminhoes');
            const abastecimentosJSON = localStorage.getItem('abastecimentos');
            const despesasJSON = localStorage.getItem('despesas');
            caminhoes = caminhoesJSON ? JSON.parse(caminhoesJSON) : [];
            abastecimentos = abastecimentosJSON ? JSON.parse(abastecimentosJSON) : [];
            despesas = despesasJSON ? JSON.parse(despesasJSON) : [];
            console.log('[LOAD] Dados carregados via localStorage:', {
                caminhoes: caminhoes.length,
                abastecimentos: abastecimentos.length,
                despesas: despesas.length
            });
        }
        console.log('[LOAD] 📊 Processando e organizando dados...');
        await new Promise(resolve => setTimeout(resolve, 400));
        updateGlobalReferences();
        console.log('✅ [LOAD] Carregamento concluído com sucesso!');
    } catch (error) {
        console.error('❌ [LOAD] Erro ao carregar dados:', error);
        try {
            const caminhoesJSON = localStorage.getItem('caminhoes');
            const abastecimentosJSON = localStorage.getItem('abastecimentos');
            const despesasJSON = localStorage.getItem('despesas');
            caminhoes = caminhoesJSON ? JSON.parse(caminhoesJSON) : [];
            abastecimentos = abastecimentosJSON ? JSON.parse(abastecimentosJSON) : [];
            despesas = despesasJSON ? JSON.parse(despesasJSON) : [];
            updateGlobalReferences();
            console.log('✅ [LOAD] Dados carregados via fallback');
        } catch (fallbackError) {
            console.error('❌ [LOAD] Erro no fallback:', fallbackError);
            caminhoes = [];
            abastecimentos = [];
            despesas = [];
            updateGlobalReferences();
        }
    }
}

// Atualizar referências globais para os relatórios
function updateGlobalReferences() {
    window.caminhoes = caminhoes;
    window.abastecimentos = abastecimentos;
    window.despesas = despesas;
    console.log('[UPDATE] Referências globais atualizadas:', {
        caminhoes: caminhoes.length,
        abastecimentos: abastecimentos.length,
        despesas: despesas.length
    });
}

// Configurar navegação entre seções
function setupNavigation() {
    console.log('[NAV] Registrando listeners do navbar...');
    if (document.getElementById('dashboardLink')) {
        document.getElementById('dashboardLink').addEventListener('click', () => { 
            console.log('[NAV] Dashboard clicado'); 
            showSection('dashboardSection'); 
        });
    }
    if (document.getElementById('caminhaoLink')) {
        document.getElementById('caminhaoLink').addEventListener('click', () => { 
            console.log('[NAV] Caminhões clicado'); 
            showSection('caminhaoSection'); 
        });
    }
    if (document.getElementById('abastecimentoLink')) {
        document.getElementById('abastecimentoLink').addEventListener('click', () => { 
            console.log('[NAV] Abastecimentos clicado'); 
            showSection('abastecimentoSection'); 
        });
    }
    if (document.getElementById('despesasLink')) {
        document.getElementById('despesasLink').addEventListener('click', () => { 
            console.log('[NAV] Despesas clicado'); 
            showSection('despesasSection'); 
        });
    }
    if (document.getElementById('relatoriosLink')) {
        document.getElementById('relatoriosLink').addEventListener('click', () => { 
            console.log('[NAV] Relatórios clicado'); 
            showSection('relatoriosSection'); 
        });
    }
}

// Mostrar seção específica e ocultar as demais
function showSection(sectionId) {
    const sections = [
        'dashboardSection',
        'caminhaoSection',
        'abastecimentoSection',
        'despesasSection',
        'relatoriosSection'
    ];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = (id === sectionId) ? 'block' : 'none';
        }
    });
    currentSection = sectionId;
}

// Função placeholder para handlers e filtros
function setupEventHandlers() { /* implementar conforme necessário */ }
function renderCaminhoes() { /* implementar conforme necessário */ }
function renderAbastecimentos() { /* implementar conforme necessário */ }
function renderDespesas() { /* implementar conforme necessário */ }
function configurarFiltrosAbastecimento() { /* implementar conforme necessário */ }
function configurarFiltrosDespesas() { /* implementar conforme necessário */ }
function updateDashboard() { /* implementar conforme necessário */ }
function populateCaminhaoSelects() { /* implementar conforme necessário */ }
