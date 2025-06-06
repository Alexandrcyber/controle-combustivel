// Variáveis para os gráficos
let consumoPorCaminhaoChart;
let gastosMensaisChart;

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

// Criar gráfico personalizado para relatórios
function createCustomChart(containerId, type, labels, datasets, title, xAxisLabel, yAxisLabel) {
    const container = document.getElementById(containerId);
    
    // Limpar container se já existir um gráfico
    container.innerHTML = '';
    
    // Criar canvas para o novo gráfico
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: xAxisLabel
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Documentar que este script foi carregado (para debugging)
console.log('Charts module loaded successfully');
