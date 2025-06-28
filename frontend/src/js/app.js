// Variáveis globais
let caminhoes = [];
let abastecimentos = [];
let despesas = [];
let currentSection = 'dashboardSection';

// Variáveis para controle de filtros de abastecimentos
let filtroAbastecimentoAtivo = false;
let abastecimentosFiltrados = [];

// Variáveis para controle de filtros de despesas
let filtrosDespesasAtivos = false;
let despesasFiltradas = [];

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
    
    // PRIMEIRO: Mostrar loading IMEDIATAMENTE
    let loadingAlert = null;
    try {
        // Aguardar SweetAlert2 carregar se necessário
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
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth()+1, 0).toISOString().split('T')[0];
    document.getElementById('dashboardDataInicio').value = primeiroDia;
    document.getElementById('dashboardDataFim').value = ultimoDia;
    
    // FECHAR O LOADING APÓS TUDO ESTAR PRONTO
    try {
        if (loadingAlert && typeof Swal !== 'undefined') {
            // Aguardar um pouco para que o usuário veja que o carregamento terminou
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('🎯 [INIT] Fechando loading - inicialização completa!');
            Swal.close();
        }
    } catch (error) {
        console.warn('⚠️ [INIT] Erro ao fechar loading:', error);
    }
    
    console.log('🎉 [INIT] === APLICAÇÃO TOTALMENTE INICIALIZADA ===');
    
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

// [Restante das funções permanecem as mesmas até a função loadDataFromLocalStorage]

async function loadDataFromLocalStorage() {
    console.log('📊 [LOAD] Iniciando carregamento de dados...');
    
    try {
        // Simular um processo de carregamento mais realista
        console.log('📦 [LOAD] Carregando dados de caminhões...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('⛽ [LOAD] Carregando dados de abastecimentos...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        console.log('💰 [LOAD] Carregando dados de despesas...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        console.log('📈 [LOAD] Processando estatísticas...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Verificar se window.dbApi está disponível
        if (window.dbApi && typeof window.dbApi.buscarCaminhoes === 'function') {
            console.log('[LOAD] Usando window.dbApi para buscar dados...');
            
            console.log('[LOAD] 🚛 Carregando caminhões...');
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
        
        // Fallback para localStorage em caso de erro
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

// [Restante das funções permanecem as mesmas até a função showSection]

function showSection(sectionId) {
    // Ocultar todas as seções
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('caminhaoSection').style.display = 'none';
    document.getElementById('abastecimentoSection').style.display = 'none';
    document.getElementById('despesasSection').style.display = 'none';
    document.getElementById('relatoriosSection').style.display = 'none';
    
    // Remover classe active de todos os links
    document.getElementById('dashboardLink').classList.remove('active');
    document.getElementById('caminhaoLink').classList.remove('active');
    document.getElementById('abastecimentoLink').classList.remove('active');
    document.getElementById('despesasLink').classList.remove('active');
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
    } else if (sectionId === 'despesasSection') {
        document.getElementById('despesasLink').classList.add('active');
        loadDespesas(); // Carregar despesas quando a seção for exibida
    } else if (sectionId === 'relatoriosSection') {
        document.getElementById('relatoriosLink').classList.add('active');
    }
    
    currentSection = sectionId;
}

// [Restante das funções permanecem as mesmas até a função configurarFiltrosDespesas]

function configurarFiltrosDespesas() {
    console.log('[DESPESAS] Configurando filtros...');
    
    const filtroForm = document.getElementById('filtroDespesaForm');
    const dataInicioInput = document.getElementById('filtroDespesaDataInicio');
    const dataFimInput = document.getElementById('filtroDespesaDataFim');
    const mesAtualBtn = document.getElementById('despesaMesAtualBtn');
    const ultimosTrintaDiasBtn = document.getElementById('despesaUltimosTrintaDiasBtn');
    const todosRegistrosBtn = document.getElementById('despesaTodosRegistrosBtn');

    // Verificar se todos os elementos existem
    if (!filtroForm || !dataInicioInput || !dataFimInput || !mesAtualBtn || !ultimosTrintaDiasBtn || !todosRegistrosBtn) {
        console.error('[DESPESAS] Alguns elementos de filtro não foram encontrados:', {
            filtroForm: !!filtroForm,
            dataInicioInput: !!dataInicioInput,
            dataFimInput: !!dataFimInput,
            mesAtualBtn: !!mesAtualBtn,
            ultimosTrintaDiasBtn: !!ultimosTrintaDiasBtn,
            todosRegistrosBtn: !!todosRegistrosBtn
        });
        
        // Tentar novamente após um tempo
        console.log('[DESPESAS] Tentando reconfigurar filtros em 2 segundos...');
        setTimeout(() => {
            configurarFiltrosDespesas();
        }, 2000);
        return;
    }

    console.log('[DESPESAS] Todos os elementos encontrados, configurando eventos...');

    // Limpar listeners existentes primeiro (prevenção contra duplicação)
    mesAtualBtn.replaceWith(mesAtualBtn.cloneNode(true));
    ultimosTrintaDiasBtn.replaceWith(ultimosTrintaDiasBtn.cloneNode(true));
    todosRegistrosBtn.replaceWith(todosRegistrosBtn.cloneNode(true));

    // Event listeners para botões de período pré-definido
    document.getElementById('despesaMesAtualBtn').addEventListener('click', definirDespesaMesAtual);
    document.getElementById('despesaUltimosTrintaDiasBtn').addEventListener('click', definirDespesaUltimosTrintaDias);
    document.getElementById('despesaTodosRegistrosBtn').addEventListener('click', removerFiltrosDespesas);

    // Event listener para formulário de filtro
    filtroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        aplicarFiltroDespesaData();
    });

    // Event listeners para mudança automática nos campos de data
    dataInicioInput.addEventListener('change', aplicarFiltroDespesaData);
    dataFimInput.addEventListener('change', aplicarFiltroDespesaData);
    
    // Definir mês atual como padrão (após configurar os listeners)
    setTimeout(() => {
        if (document.getElementById('filtroDespesaDataInicio') && document.getElementById('filtroDespesaDataFim')) {
            definirDespesaMesAtual();
        }
    }, 500);
    
    console.log('[DESPESAS] Filtros configurados com sucesso!');
}

// [Restante das funções permanecem as mesmas até a função renderDespesas]

function renderDespesas() {
    const tableBody = document.getElementById('despesaTableBody');
    if (!tableBody) {
        console.error('Elemento despesaTableBody não encontrado');
        return;
    }
    
    tableBody.innerHTML = '';

    // Usar dados filtrados se houver filtros ativos, senão usar todos
    const despesasParaExibir = filtrosDespesasAtivos ? despesasFiltradas : despesas;

    if (despesasParaExibir.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center text-muted py-4">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                ${filtrosDespesasAtivos ? 'Nenhuma despesa encontrada para os filtros aplicados.' : 'Nenhuma despesa cadastrada.'}
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }

    despesasParaExibir.forEach(despesa => {
        const row = document.createElement('tr');
        
        // Formatar data com mais robustez
        let dataFormatada = '';
        try {
            // Verificar se a data já tem 'T' (formato ISO)
            const formattedDate = despesa.data.includes('T') 
                ? new Date(despesa.data) 
                : new Date(despesa.data + 'T00:00:00');
            
            if (!isNaN(formattedDate.getTime())) {
                dataFormatada = formattedDate.toLocaleDateString('pt-BR');
            } else {
                // Tentar outros formatos de data se falhar
                if (despesa.data.includes('/')) {
                    const parts = despesa.data.split('/');
                    if (parts.length === 3) {
                        const dia = parseInt(parts[0], 10);
                        const mes = parseInt(parts[1], 10) - 1;
                        const ano = parseInt(parts[2], 10);
                        const dateObj = new Date(ano, mes, dia);
                        if (!isNaN(dateObj.getTime())) {
                            dataFormatada = dateObj.toLocaleDateString('pt-BR');
                        }
                    }
                } else if (despesa.data.includes('-')) {
                    const parts = despesa.data.split('-');
                    if (parts.length === 3) {
                        const ano = parseInt(parts[0], 10);
                        const mes = parseInt(parts[1], 10) - 1;
                        const dia = parseInt(parts[2], 10);
                        const dateObj = new Date(ano, mes, dia);
                        if (!isNaN(dateObj.getTime())) {
                            dataFormatada = dateObj.toLocaleDateString('pt-BR');
                        }
                    }
                }
                
                if (!dataFormatada) {
                    console.warn('Data inválida ao renderizar tabela:', despesa.data);
                    dataFormatada = 'Data inválida';
                }
            }
        } catch (error) {
            console.error('Erro ao formatar data na tabela:', despesa.data, error);
            dataFormatada = 'Data inválida';
        }
        
        // Formatar valor
        const valorFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(despesa.valor);

        row.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${despesa.fornecedor}</td>
            <td>${despesa.descricao}</td>
            <td><span class="badge bg-secondary">${despesa.categoria}</span></td>
            <td class="fw-bold text-primary">${valorFormatado}</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary btn-sm edit-despesa admin-only" data-id="${despesa.id}" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm delete-despesa admin-only" data-id="${despesa.id}" title="Excluir">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });

    // Adicionar event listeners para botões de ação
    document.querySelectorAll('.edit-despesa').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            editDespesa(id);
        });
    });
    
    document.querySelectorAll('.delete-despesa').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            showDeleteConfirmation(id, 'despesa');
        });
    });

    // Aplicar visibilidade baseada no papel do usuário
    if (window.authManager && window.authManager.getUser()) {
        const userRole = window.authManager.getUser().role;
        window.applyRoleVisibility(userRole);
    } else {
        window.applyRoleVisibility('guest');
    }
}

// [Restante das funções permanecem as mesmas até a função updateDashboard]

async function updateDashboard() {
    try {
        console.log('[DASHBOARD] Atualizando dashboard...');
        
        // Mostrar loading mais proeminente para atualização do dashboard
        AlertInfo.loadingSystem(
            'Atualizando Dashboard',
            'Processando dados de caminhões, abastecimentos e despesas para gerar estatísticas e gráficos atualizados.'
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
                
                // Filtrar despesas pelo mesmo período
                let despesasFiltradas = despesas.filter(d => {
                    try {
                        const dataDespesa = new Date(d.data.includes('T') ? d.data : d.data + 'T00:00:00');
                        return dataDespesa >= inicio && dataDespesa <= fim;
                    } catch (e) {
                        console.error('Erro ao filtrar despesa:', d.data, e);
                        return false;
                    }
                });
                
                // Filtrar por caminhão específico se selecionado
                if (caminhaoId && caminhaoId !== 'todos') {
                    abastecimentosFiltrados = abastecimentosFiltrados.filter(a => a.caminhaoId === caminhaoId);
                    // Despesas não são filtradas por caminhão pois são gerais
                }
                
                console.log('[DASHBOARD] Dados filtrados:', {
                    abastecimentos: abastecimentosFiltrados.length,
                    despesas: despesasFiltradas.length
                });
                
                // Calcular estatísticas
                const stats = calcularEstatisticas(abastecimentosFiltrados, despesasFiltradas);
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
                    AlertToast.success(`Dashboard atualizado! ${abastecimentosFiltrados.length} abastecimento(s) e ${despesasFiltradas.length} despesa(s) processados.`);
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

function calcularEstatisticas(abastecimentosFiltrados, despesasFiltradas) {
    // Estatísticas básicas
    const totalCaminhoesAtivos = caminhoes.filter(c => c.status === 'ativo' || !c.status).length;
    const totalAbastecimentos = abastecimentosFiltrados.length;
    const totalDespesas = despesasFiltradas.length;
    
    // Calcular totais de abastecimentos
    let totalLitros = 0;
    let totalGastoAbastecimentos = 0;
    let totalKm = 0;
    
    abastecimentosFiltrados.forEach(a => {
        totalLitros += parseFloat(a.litros) || 0;
        totalGastoAbastecimentos += parseFloat(a.valorTotal) || 0;
        const distancia = (parseFloat(a.kmFinal) || 0) - (parseFloat(a.kmInicial) || 0);
        if (distancia > 0) {
            totalKm += distancia;
        }
    });
    
    // Calcular totais de despesas
    let totalGastoDespesas = 0;
    despesasFiltradas.forEach(d => {
        totalGastoDespesas += parseFloat(d.valor) || 0;
    });
    
    // Calcular gasto total (abastecimentos + despesas)
    const totalGasto = totalGastoAbastecimentos + totalGastoDespesas;
    
    // Calcular média de consumo (km/l)
    const mediaConsumo = totalLitros > 0 ? (totalKm / totalLitros) : 0;
    
    return {
        totalCaminhoes: totalCaminhoesAtivos,
        totalAbastecimentos,
        totalDespesas,
        totalLitros,
        totalGastoAbastecimentos,
        totalGastoDespesas,
        totalGasto,
        totalKm,
        mediaConsumo
    };
}

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
        
        // Card: Total Despesas
        const totalDespesasEl = document.getElementById('totalDespesas');
        if (totalDespesasEl) {
            totalDespesasEl.textContent = stats.totalDespesas;
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
            despesas: stats.totalDespesas,
            consumo: stats.mediaConsumo.toFixed(2),
            gasto: stats.totalGasto.toFixed(2)
        });
        
    } catch (error) {
        console.error('[DASHBOARD] Erro ao atualizar cards:', error);
    }
}

// [Restante das funções permanecem as mesmas]