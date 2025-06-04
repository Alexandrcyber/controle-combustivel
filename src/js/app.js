// Flag para indicar se estamos usando PostgreSQL
let usingPostgres = false;

// Variáveis globais
let caminhoes = [];
let abastecimentos = [];
let currentSection = 'dashboardSection';

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    // Tentar conectar ao PostgreSQL via API REST
    try {
        if (window.dbApi) {
            const connected = await window.dbApi.verificarStatusConexao();
            if (connected) {
                usingPostgres = true;
                console.log('Usando PostgreSQL para armazenamento de dados');
                
                // Inicializar banco de dados (criar tabelas se não existirem)
                await window.dbApi.inicializarBancoDados();
                
                // Carregar dados do PostgreSQL
                await loadDataFromPostgres();
                
                // Verificar se é a primeira execução com o PostgreSQL
                // Se houver dados no localStorage mas o banco estiver vazio, migrar
                const localCaminhoes = localStorage.getItem('caminhoes');
                const localAbastecimentos = localStorage.getItem('abastecimentos');
                
                if ((localCaminhoes && localCaminhoes !== '[]') || 
                    (localAbastecimentos && localAbastecimentos !== '[]')) {
                    
                    if (caminhoes.length === 0 && abastecimentos.length === 0) {
                        // Carregar dados do localStorage para migração
                        const localCaminhoesArray = JSON.parse(localCaminhoes || '[]');
                        const localAbastecimentosArray = JSON.parse(localAbastecimentos || '[]');
                        
                        // Migrar dados para o PostgreSQL
                        await window.dbApi.migrarDadosLocalStorage(localCaminhoesArray, localAbastecimentosArray);
                        
                        // Recarregar dados do PostgreSQL após migração
                        await loadDataFromPostgres();
                        
                        console.log('Dados migrados com sucesso do localStorage para o PostgreSQL');
                    }
                }
            } else {
                console.log('Não foi possível conectar ao PostgreSQL. Usando localStorage.');
                loadDataFromLocalStorage();
            }
        } else {
            console.log('API de banco de dados não disponível. Usando localStorage.');
            loadDataFromLocalStorage();
        }
    } catch (err) {
        console.error('Erro ao configurar PostgreSQL:', err);
        console.log('Usando localStorage como fallback.');
        loadDataFromLocalStorage();
    }
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar manipuladores de eventos
    setupEventHandlers();
    
    // Renderizar dados iniciais
    renderCaminhoes();
    renderAbastecimentos();
    updateDashboard();
    populateCaminhaoSelects();
});

// Carregar dados do PostgreSQL via API REST
async function loadDataFromPostgres() {
    try {
        caminhoes = await window.dbApi.buscarCaminhoes();
        abastecimentos = await window.dbApi.buscarAbastecimentos();
    } catch (err) {
        console.error('Erro ao carregar dados do PostgreSQL:', err);
        // Fallback para localStorage se houver erro
        loadDataFromLocalStorage();
        usingPostgres = false;
    }
}

// Carregar dados do localStorage
function loadDataFromLocalStorage() {
    const savedCaminhoes = localStorage.getItem('caminhoes');
    const savedAbastecimentos = localStorage.getItem('abastecimentos');
    
    if (savedCaminhoes) {
        caminhoes = JSON.parse(savedCaminhoes);
    }
    
    if (savedAbastecimentos) {
        abastecimentos = JSON.parse(savedAbastecimentos);
    }
}

// Salvar dados (PostgreSQL ou localStorage)
async function saveData() {
    if (usingPostgres) {
        // Os dados já são salvos individualmente no PostgreSQL
        // nas funções saveCaminhao e saveAbastecimento
        return;
    }
    
    // Salvar no localStorage como fallback
    localStorage.setItem('caminhoes', JSON.stringify(caminhoes));
    localStorage.setItem('abastecimentos', JSON.stringify(abastecimentos));
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
    
    // Manipuladores para exportação
    document.getElementById('exportarExcel').addEventListener('click', exportarRelatorioExcel);
    document.getElementById('exportarPdf').addEventListener('click', exportarRelatorioPdf);
    
    // Manipuladores para formulários de relatórios
    document.getElementById('relatorioConsumoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        gerarRelatorioConsumo();
    });
    
    document.getElementById('relatorioCustosForm').addEventListener('submit', (e) => {
        e.preventDefault();
        gerarRelatorioCustos();
    });
}

// Atualizar dados do dashboard
function updateDashboard() {
    // Atualizar contadores
    document.getElementById('totalCaminhoes').textContent = caminhoes.length;
    
    // Calcular abastecimentos do mês atual
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const abastecimentosMes = abastecimentos.filter(a => {
        const dataAbastecimento = new Date(a.data);
        return dataAbastecimento >= primeiroDiaMes;
    });
    
    document.getElementById('totalAbastecimentos').textContent = abastecimentosMes.length;
    
    // Calcular média de consumo
    let totalKm = 0;
    let totalLitros = 0;
    
    abastecimentos.forEach(a => {
        totalKm += (a.kmFinal - a.kmInicial);
        totalLitros += parseFloat(a.litros);
    });
    
    const mediaConsumo = totalLitros > 0 ? (totalKm / totalLitros).toFixed(2) : 0;
    document.getElementById('mediaConsumo').textContent = `${mediaConsumo} km/l`;
    
    // Calcular gasto total do mês
    let gastoTotal = 0;
    abastecimentosMes.forEach(a => {
        gastoTotal += parseFloat(a.valorTotal);
    });
    
    document.getElementById('gastoTotal').textContent = `R$ ${gastoTotal.toFixed(2)}`;
    
    // Atualizar gráficos
    updateCharts();
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
            <td class="action-buttons">
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
        // Formatar data
        const data = new Date(abastecimento.data).toLocaleDateString('pt-BR');
        
        // Formatar período, se existir
        let periodoText = '';
        if (abastecimento.periodoInicio && abastecimento.periodoFim) {
            const inicio = new Date(abastecimento.periodoInicio).toLocaleDateString('pt-BR');
            const fim = new Date(abastecimento.periodoFim).toLocaleDateString('pt-BR');
            periodoText = `${inicio} a ${fim}`;
        }
        
        row.innerHTML = `
            <td>${placaCaminhao}</td>
            <td>${data}</td>
            <td>${periodoText}</td>
            <td>${modeloCaminhao}</td>
            <td>${abastecimento.motorista}</td>
            <td>${abastecimento.kmInicial.toLocaleString('pt-BR')}</td>
            <td>${abastecimento.kmFinal.toLocaleString('pt-BR')}</td>
            <td>${parseFloat(abastecimento.litros).toFixed(2)}</td>
            <td>R$ ${parseFloat(abastecimento.valorLitro).toFixed(2)}</td>
            <td>R$ ${parseFloat(abastecimento.valorTotal).toFixed(2)}</td>
            <td>${consumo} km/l</td>
            <td class="action-buttons">
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
    const caminhaoIdInput = document.getElementById('caminhaoId');
    const placaInput = document.getElementById('placa');
    const modeloInput = document.getElementById('modelo');
    const anoInput = document.getElementById('ano');
    const capacidadeInput = document.getElementById('capacidade');
    const motoristaInput = document.getElementById('motorista');
    
    // Validar campos obrigatórios
    if (!placaInput.value || !modeloInput.value || !anoInput.value || !capacidadeInput.value) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Verificar se é uma edição ou um novo registro
    const isEdit = caminhaoIdInput.value !== '';
    
    // Preparar objeto do caminhão
    const caminhaoObj = {
        id: isEdit ? parseInt(caminhaoIdInput.value) : null,
        placa: placaInput.value,
        modelo: modeloInput.value,
        ano: parseInt(anoInput.value),
        capacidade: parseFloat(capacidadeInput.value),
        motorista: motoristaInput.value
    };
    
    try {
        // Salvar no PostgreSQL se estiver usando
        if (usingPostgres) {
            const savedCaminhao = await window.dbApi.salvarCaminhao(caminhaoObj);
            
            // Atualizar array local
            if (isEdit) {
                const index = caminhoes.findIndex(c => c.id == caminhaoIdInput.value);
                if (index !== -1) {
                    caminhoes[index] = savedCaminhao;
                }
            } else {
                caminhoes.push(savedCaminhao);
            }
        } else {
            // Lógica antiga para localStorage
            if (isEdit) {
                const index = caminhoes.findIndex(c => c.id == caminhaoIdInput.value);
                if (index !== -1) {
                    caminhoes[index] = caminhaoObj;
                }
            } else {
                // Criar novo ID
                const newId = caminhoes.length > 0 ? Math.max(...caminhoes.map(c => c.id)) + 1 : 1;
                caminhaoObj.id = newId;
                
                // Adicionar novo caminhão
                caminhoes.push(caminhaoObj);
            }
            
            // Salvar no localStorage
            saveData();
        }
        
        // Atualizar interface
        renderCaminhoes();
        populateCaminhaoSelects();
        updateDashboard();
        
        // Fechar modal e limpar formulário
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCaminhaoModal'));
        modal.hide();
        resetCaminhaoForm();
    } catch (err) {
        console.error('Erro ao salvar caminhão:', err);
        alert('Ocorreu um erro ao salvar o caminhão. Por favor, tente novamente.');
    }
}

// Editar caminhão existente
function editCaminhao(id) {
    const caminhao = caminhoes.find(c => c.id == id);
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
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Validar se a data final é posterior à data inicial
    const dataInicio = new Date(periodoInicioInput.value);
    const dataFim = new Date(periodoFimInput.value);
    
    if (dataFim < dataInicio) {
        alert('A data final do período deve ser posterior à data inicial.');
        return;
    }
    
    // Validar quilometragem
    const kmInicial = parseFloat(kmInicialInput.value);
    const kmFinal = parseFloat(kmFinalInput.value);
    
    if (kmFinal <= kmInicial) {
        alert('A quilometragem final deve ser maior que a quilometragem inicial.');
        return;
    }
    
    // Calcular valor total
    const litros = parseFloat(litrosInput.value);
    const valorLitro = parseFloat(valorLitroInput.value);
    const valorTotal = litros * valorLitro;
    
    // Verificar se é uma edição ou um novo registro
    const isEdit = abastecimentoIdInput.value !== '';
    
    // Preparar objeto do abastecimento
    const abastecimentoObj = {
        id: isEdit ? parseInt(abastecimentoIdInput.value) : null,
        data: periodoInicioInput.value, // Usamos a data inicial como referência principal
        periodoInicio: periodoInicioInput.value,
        periodoFim: periodoFimInput.value,
        caminhaoId: parseInt(caminhaoSelect.value),
        motorista: motoristaInput.value,
        kmInicial: kmInicial,
        kmFinal: kmFinal,
        litros: litros,
        valorLitro: valorLitro,
        valorTotal: valorTotal,
        posto: postoInput.value,
        observacoes: observacoesInput.value
    };
    
    try {
        // Salvar no PostgreSQL se estiver usando
        if (usingPostgres) {
            const savedAbastecimento = await window.dbApi.salvarAbastecimento(abastecimentoObj);
            
            // Atualizar array local
            if (isEdit) {
                const index = abastecimentos.findIndex(a => a.id == abastecimentoIdInput.value);
                if (index !== -1) {
                    abastecimentos[index] = savedAbastecimento;
                }
            } else {
                abastecimentos.push(savedAbastecimento);
            }
        } else {
            // Lógica antiga para localStorage
            if (isEdit) {
                const index = abastecimentos.findIndex(a => a.id == abastecimentoIdInput.value);
                if (index !== -1) {
                    abastecimentos[index] = abastecimentoObj;
                }
            } else {
                // Criar novo ID
                const newId = abastecimentos.length > 0 ? Math.max(...abastecimentos.map(a => a.id)) + 1 : 1;
                abastecimentoObj.id = newId;
                
                // Adicionar novo abastecimento
                abastecimentos.push(abastecimentoObj);
            }
            
            // Salvar no localStorage
            saveData();
        }
        
        // Atualizar interface
        renderAbastecimentos();
        updateDashboard();
        
        // Fechar modal e limpar formulário
        const modal = bootstrap.Modal.getInstance(document.getElementById('addAbastecimentoModal'));
        modal.hide();
        resetAbastecimentoForm();
    } catch (err) {
        console.error('Erro ao salvar abastecimento:', err);
        alert('Ocorreu um erro ao salvar o abastecimento. Por favor, tente novamente.');
    }
}

// Editar abastecimento existente
function editAbastecimento(id) {
    const abastecimento = abastecimentos.find(a => a.id == id);
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
    });
}

// Mostrar modal de confirmação de exclusão
function showDeleteConfirmation(id, type) {
    document.getElementById('deleteItemId').value = id;
    document.getElementById('deleteItemType').value = type;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

// Confirmar exclusão de item
async function confirmDelete() {
    const id = document.getElementById('deleteItemId').value;
    const type = document.getElementById('deleteItemType').value;
    
    try {
        if (type === 'caminhao') {
            if (usingPostgres) {
                // Verificar se há abastecimentos associados (o banco já cuida disso, mas vamos avisar o usuário)
                const abastecimentosAssociados = abastecimentos.some(a => a.caminhaoId == id);
                
                if (abastecimentosAssociados) {
                    if (!confirm('Este caminhão possui abastecimentos registrados. A exclusão removerá também todos os abastecimentos associados. Deseja continuar?')) {
                        return;
                    }
                }
                
                // Excluir no PostgreSQL
                await window.dbApi.excluirCaminhao(id);
                
                // Atualizar arrays locais
                caminhoes = caminhoes.filter(c => c.id != id);
                abastecimentos = abastecimentos.filter(a => a.caminhaoId != id);
            } else {
                // Verificar se há abastecimentos associados a este caminhão
                const abastecimentosAssociados = abastecimentos.some(a => a.caminhaoId == id);
                
                if (abastecimentosAssociados) {
                    if (!confirm('Este caminhão possui abastecimentos registrados. A exclusão removerá também todos os abastecimentos associados. Deseja continuar?')) {
                        return;
                    }
                    
                    // Remover abastecimentos associados
                    abastecimentos = abastecimentos.filter(a => a.caminhaoId != id);
                }
                
                // Remover caminhão
                caminhoes = caminhoes.filter(c => c.id != id);
                
                // Salvar no localStorage
                saveData();
            }
            
            // Atualizar interface
            renderCaminhoes();
            renderAbastecimentos();
            populateCaminhaoSelects();
        } else if (type === 'abastecimento') {
            if (usingPostgres) {
                // Excluir no PostgreSQL
                await window.dbApi.excluirAbastecimento(id);
                
                // Atualizar array local
                abastecimentos = abastecimentos.filter(a => a.id != id);
            } else {
                // Remover abastecimento
                abastecimentos = abastecimentos.filter(a => a.id != id);
                
                // Salvar no localStorage
                saveData();
            }
            
            // Atualizar interface
            renderAbastecimentos();
        }
        
        // Atualizar dashboard
        updateDashboard();
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
    } catch (err) {
        console.error('Erro ao excluir item:', err);
        alert('Ocorreu um erro ao excluir o item. Por favor, tente novamente.');
    }
}

// Função para limpar os dados (útil para testes ou redefinição)
async function clearAllData() {
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
        try {
            if (usingPostgres) {
                // Limpar dados no PostgreSQL via API
                const sucesso = await window.dbApi.limparTodosDados();
                if (!sucesso) {
                    throw new Error('Não foi possível limpar os dados no banco de dados.');
                }
            }
            
            // Limpar arrays locais
            caminhoes = [];
            abastecimentos = [];
            
            // Limpar localStorage
            localStorage.removeItem('caminhoes');
            localStorage.removeItem('abastecimentos');
            
            // Atualizar interface
            renderCaminhoes();
            renderAbastecimentos();
            updateDashboard();
            populateCaminhaoSelects();
            
            alert('Todos os dados foram removidos com sucesso.');
        } catch (err) {
            console.error('Erro ao limpar dados:', err);
            alert('Ocorreu um erro ao limpar os dados. Por favor, tente novamente.');
        }
    }
}

// Manter as funções restantes do arquivo original (updateCharts, exportarRelatorioExcel, etc.)
// ...
