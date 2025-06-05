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
                        label: function(context) {
                            return `${context.raw.toFixed(2)} km/l`;
                        }
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
    const labels = [];
    const consumoData = [];
    
    // Calcular consumo médio para cada caminhão
    caminhoes.forEach(caminhao => {
        const abastecimentosCaminhao = abastecimentos.filter(a => a.caminhaoId === caminhao.id);
        let totalKm = 0;
        let totalLitros = 0;
        
        abastecimentosCaminhao.forEach(a => {
            totalKm += (a.kmFinal - a.kmInicial);
            totalLitros += parseFloat(a.litros);
        });
        
        if (totalLitros > 0) {
            const mediaConsumo = totalKm / totalLitros;
            labels.push(`${caminhao.placa}`);
            consumoData.push(mediaConsumo);
        }
    });
    
    // Atualizar dados do gráfico
    consumoPorCaminhaoChart.data.labels = labels;
    consumoPorCaminhaoChart.data.datasets[0].data = consumoData;
    consumoPorCaminhaoChart.update();
}

// Atualizar gráfico de gastos mensais
function updateGastosMensaisChart() {
    // Definir período de 6 meses para análise
    const hoje = new Date();
    const meses = [];
    const gastosData = [];
    
    for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = `${data.toLocaleString('pt-BR', { month: 'short' })}/${data.getFullYear().toString().substr(2)}`;
        meses.push(mesAno);
        
        // Filtrar abastecimentos para o mês
        const primeiroDiaMes = new Date(data.getFullYear(), data.getMonth(), 1);
        const ultimoDiaMes = new Date(data.getFullYear(), data.getMonth() + 1, 0);
        
        const abastecimentosMes = abastecimentos.filter(a => {
            const dataAbastecimento = new Date(a.data);
            return dataAbastecimento >= primeiroDiaMes && dataAbastecimento <= ultimoDiaMes;
        });
        
        // Calcular gastos totais para o mês
        let gastoMes = 0;
        abastecimentosMes.forEach(a => {
            gastoMes += a.valorTotal;
        });
        
        gastosData.push(gastoMes);
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
