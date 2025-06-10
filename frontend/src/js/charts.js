// Variáveis para os gráficos
let consumoPorCaminhaoChart;
let gastosMensaisChart;
let despesasPorCategoriaChart;
let evolucaoDespesasMensaisChart;

// Cores para os gráficos
const chartColors = [
    'rgba(54, 162, 235, 0.7)', // Azul
    'rgba(255, 99, 132, 0.7)',  // Rosa
    'rgba(75, 192, 192, 0.7)',  // Verde-água
    'rgba(255, 159, 64, 0.7)',  // Laranja
    'rgba(153, 102, 255, 0.7)', // Roxo
    'rgba(255, 205, 86, 0.7)',  // Amarelo
    'rgba(201, 203, 207, 0.7)'  // Cinza
];

// Inicializar gráficos
function initCharts() {
    // Gráfico de consumo por caminhão
    const consumoCtx = document.getElementById('consumoPorCaminhao').getContext('2d');
    consumoPorCaminhaoChart = new Chart(consumoCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Média de Consumo (km/l)',
                data: [],
                backgroundColor: chartColors,
                borderColor: chartColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'km/l'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (items) => `Caminhão: ${items[0].label}`,
                        label: (item) => `Média: ${item.parsed.y.toFixed(2)} km/l`
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Gráfico de gastos mensais
    const gastosCtx = document.getElementById('gastosMensais').getContext('2d');
    gastosMensaisChart = new Chart(gastosCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Gastos (R$)',
                data: [],
                fill: true,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                tension: 0.2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `R$ ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Gráfico de despesas por categoria
    const despesasCategoriaCtx = document.getElementById('despesasPorCategoria')?.getContext('2d');
    if (despesasCategoriaCtx) {
        despesasPorCategoriaChart = new Chart(despesasCategoriaCtx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: chartColors,
                    borderColor: chartColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: (item) => {
                                const value = item.parsed;
                                return `R$ ${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de evolução de despesas mensais
    const evolucaoDespesasCtx = document.getElementById('evolucaoDespesasMensais')?.getContext('2d');
    if (evolucaoDespesasCtx) {
        evolucaoDespesasMensaisChart = new Chart(evolucaoDespesasCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Despesas (R$)',
                    data: [],
                    fill: true,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    tension: 0.2
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor (R$)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `R$ ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Atualizar gráficos com dados atuais
function updateCharts() {
    // Se os gráficos não estiverem inicializados, inicializá-los
    if (!consumoPorCaminhaoChart || !gastosMensaisChart) {
        initCharts();
    }
    
    // Atualizar gráfico de consumo por caminhão
    updateConsumoPorCaminhaoChart();
    
    // Atualizar gráfico de gastos mensais
    updateGastosMensaisChart();
    
    // Atualizar gráficos de despesas
    updateDespesasCharts();
}

// Atualizar gráfico de consumo por caminhão
function updateConsumoPorCaminhaoChart() {
    // Ler filtros de data do dashboard
    const dataInicio = document.getElementById('dashboardDataInicio').value;
    const dataFim = document.getElementById('dashboardDataFim').value;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim + 'T23:59:59');

    // Filtrar abastecimentos pelo período
    const abastecimentosFiltrados = abastecimentos.filter(a => {
        const dt = new Date(a.data);
        return dt >= inicio && dt <= fim;
    });

    // Definir caminhões a exibir: todos ou específico
    const selecionado = document.getElementById('dashboardCaminhaoSelect').value;
    const listaCaminhoes = selecionado === 'todos'
        ? caminhoes
        : caminhoes.filter(c => c.id === selecionado);

    const labels = [];
    const consumoData = [];

    // Calcular consumo médio para cada caminhão da lista
    listaCaminhoes.forEach(caminhao => {
        const abastecCaminhao = abastecimentosFiltrados.filter(a => a.caminhaoId === caminhao.id);
        let totalKm = 0;
        let totalLitros = 0;
        abastecCaminhao.forEach(a => {
            totalKm += (a.kmFinal - a.kmInicial);
            totalLitros += parseFloat(a.litros);
        });
        if (totalLitros > 0) {
            labels.push(`${caminhao.placa}`);
            consumoData.push((totalKm / totalLitros).toFixed(2));
        }
    });

    // Atualizar dados do gráfico
    consumoPorCaminhaoChart.data.labels = labels;
    consumoPorCaminhaoChart.data.datasets[0].data = consumoData;
    consumoPorCaminhaoChart.update();
}

// Atualizar gráfico de gastos mensais
function updateGastosMensaisChart() {
    // Ler filtros de data do dashboard
    const dataInicio = document.getElementById('dashboardDataInicio').value;
    const dataFim = document.getElementById('dashboardDataFim').value;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim + 'T23:59:59');

    // Construir lista de meses entre início e fim
    const meses = [];
    const gastosData = [];
    let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    while (cursor <= fim) {
        const mesAnoLabel = `${cursor.toLocaleString('pt-BR', { month: 'short' })}/${cursor.getFullYear().toString().substr(2)}`;
        meses.push(mesAnoLabel);
        // calcular gasto no mês
        const primeiroDiaMes = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const ultimoDiaMes = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
        const gastoMes = abastecimentos
            .filter(a => {
                const dt = new Date(a.data);
                return dt >= primeiroDiaMes && dt <= ultimoDiaMes;
            })
            .reduce((sum, a) => sum + parseFloat(a.valorTotal), 0);
        gastosData.push(gastoMes);
        cursor.setMonth(cursor.getMonth() + 1);
    }

    // Atualizar dados do gráfico
    gastosMensaisChart.data.labels = meses;
    gastosMensaisChart.data.datasets[0].data = gastosData;
    gastosMensaisChart.update();
}

// Atualizar gráficos do dashboard de despesas
function updateDespesasCharts() {
    // Verificar se os gráficos existem
    if (!despesasPorCategoriaChart || !evolucaoDespesasMensaisChart) {
        // Se os elementos do DOM existem mas os gráficos não, tentar inicializar
        if (document.getElementById('despesasPorCategoria') && document.getElementById('evolucaoDespesasMensais')) {
            initCharts();
        } else {
            console.warn('[CHARTS] Elementos para gráficos de despesas não encontrados');
            return;
        }
    }
    
    // Verificar se o array de despesas está disponível
    if (!Array.isArray(window.despesas) || window.despesas.length === 0) {
        console.warn('[CHARTS] Dados de despesas não disponíveis para gráficos');
        return;
    }
    
    // Ler filtros de data do dashboard
    const dataInicio = document.getElementById('dashboardDataInicio').value;
    const dataFim = document.getElementById('dashboardDataFim').value;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim + 'T23:59:59');
    
    // Filtrar despesas pelo período
    const despesasFiltradas = window.despesas.filter(d => {
        try {
            // Tratar diferentes formatos de data
            let dataDespesa;
            if (typeof d.data === 'string') {
                // Adicionar T00:00:00 para evitar problemas de fuso horário se não tiver
                dataDespesa = d.data.includes('T') ? new Date(d.data) : new Date(d.data + 'T00:00:00');
                
                // Se ainda for inválida, tentar outros formatos
                if (isNaN(dataDespesa.getTime())) {
                    // Formato DD/MM/YYYY
                    if (d.data.includes('/')) {
                        const parts = d.data.split('/');
                        if (parts.length === 3) {
                            const dia = parseInt(parts[0], 10);
                            const mes = parseInt(parts[1], 10) - 1;
                            const ano = parseInt(parts[2], 10);
                            dataDespesa = new Date(ano, mes, dia);
                        }
                    }
                    // Formato YYYY-MM-DD
                    else if (d.data.includes('-')) {
                        const parts = d.data.split('-');
                        if (parts.length === 3) {
                            const ano = parseInt(parts[0], 10);
                            const mes = parseInt(parts[1], 10) - 1;
                            const dia = parseInt(parts[2], 10);
                            dataDespesa = new Date(ano, mes, dia);
                        }
                    }
                }
            } else {
                dataDespesa = new Date(d.data);
            }
            
            // Se a data continuar inválida após todas as tentativas, pular este registro
            if (isNaN(dataDespesa.getTime())) {
                console.warn('[CHARTS] Data inválida para despesa:', d.data);
                return false;
            }
            
            return dataDespesa >= inicio && dataDespesa <= fim;
        } catch (error) {
            console.error('[CHARTS] Erro ao processar data da despesa:', d.data, error);
            return false;
        }
    });
    
    console.log('[CHARTS] Despesas filtradas para gráficos:', despesasFiltradas.length);
    
    // Atualizar gráfico de despesas por categoria
    updateDespesasPorCategoriaChart(despesasFiltradas);
    
    // Atualizar gráfico de evolução de despesas mensais
    updateEvolucaoDespesasMensaisChart(despesasFiltradas, inicio, fim);
    
    // Atualizar cards do dashboard de despesas
    updateDespesasCards(despesasFiltradas);
}

// Atualizar gráfico de despesas por categoria
function updateDespesasPorCategoriaChart(despesasFiltradas) {
    // Agrupar despesas por categoria
    const categorias = {};
    despesasFiltradas.forEach(d => {
        const categoria = d.categoria || 'Sem categoria';
        if (!categorias[categoria]) {
            categorias[categoria] = 0;
        }
        categorias[categoria] += parseFloat(d.valor) || 0;
    });
    
    const labels = Object.keys(categorias);
    const data = Object.values(categorias);
    
    // Atualizar dados do gráfico
    despesasPorCategoriaChart.data.labels = labels;
    despesasPorCategoriaChart.data.datasets[0].data = data;
    despesasPorCategoriaChart.update();
}

// Atualizar gráfico de evolução de despesas mensais
function updateEvolucaoDespesasMensaisChart(despesasFiltradas, inicio, fim) {
    // Construir lista de meses entre início e fim
    const meses = [];
    const gastosData = [];
    let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    
    while (cursor <= fim) {
        const mesAnoLabel = `${cursor.toLocaleString('pt-BR', { month: 'short' })}/${cursor.getFullYear().toString().substr(2)}`;
        meses.push(mesAnoLabel);
        
        // Calcular gasto no mês
        const primeiroDiaMes = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const ultimoDiaMes = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
        
        const gastoMes = despesasFiltradas
            .filter(d => {
                try {
                    const dataDespesa = new Date(d.data);
                    return dataDespesa >= primeiroDiaMes && dataDespesa <= ultimoDiaMes;
                } catch (error) {
                    console.warn('[CHARTS] Erro ao filtrar despesa por mês:', error);
                    return false;
                }
            })
            .reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
        
        gastosData.push(gastoMes);
        cursor.setMonth(cursor.getMonth() + 1);
    }
    
    // Atualizar dados do gráfico
    evolucaoDespesasMensaisChart.data.labels = meses;
    evolucaoDespesasMensaisChart.data.datasets[0].data = gastosData;
    evolucaoDespesasMensaisChart.update();
}

// Atualizar cards do dashboard de despesas
function updateDespesasCards(despesasFiltradas) {
    try {
        // Calcular estatísticas
        const totalDespesas = despesasFiltradas.length;
        const totalGasto = despesasFiltradas.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
        const mediaDespesa = totalDespesas > 0 ? (totalGasto / totalDespesas) : 0;
        
        // Calcular despesas do mês atual
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
        
        const despesasMesAtual = despesasFiltradas.filter(d => {
            try {
                const dataDespesa = new Date(d.data);
                return dataDespesa >= primeiroDiaMes && dataDespesa <= ultimoDiaMes;
            } catch (error) {
                return false;
            }
        }).length;
        
        // Atualizar cards
        document.getElementById('totalDespesas').textContent = totalDespesas;
        document.getElementById('despesasPorMes').textContent = despesasMesAtual;
        document.getElementById('mediaDespesa').textContent = `R$ ${mediaDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('gastoTotalDespesas').textContent = `R$ ${totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        console.log('[DASHBOARD] Cards de despesas atualizados:', {
            totalDespesas,
            despesasMesAtual,
            mediaDespesa: mediaDespesa.toFixed(2),
            totalGasto: totalGasto.toFixed(2)
        });
    } catch (error) {
        console.error('[DASHBOARD] Erro ao atualizar cards de despesas:', error);
    }
}

// Documentar que este script foi carregado (para debugging)
console.log('Charts module loaded successfully');
