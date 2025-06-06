// Funções auxiliares para formatação segura de números
function garantirNumero(valor, padrao = 0) {
    if (valor === null || valor === undefined || valor === '' || isNaN(valor)) {
        return padrao;
    }
    const numero = parseFloat(valor);
    return isNaN(numero) ? padrao : numero;
}

function formatarNumero(valor, decimais = 2) {
    const numero = garantirNumero(valor, 0);
    return numero.toFixed(decimais);
}

function formatarMoeda(valor) {
    const numero = garantirNumero(valor, 0);
    return numero.toFixed(2);
}

function calcularSeguro(valor1, valor2, operacao = 'soma') {
    const num1 = garantirNumero(valor1, 0);
    const num2 = garantirNumero(valor2, 0);
    
    switch(operacao) {
        case 'soma':
            return num1 + num2;
        case 'subtracao':
            return num1 - num2;
        case 'multiplicacao':
            return num1 * num2;
        case 'divisao':
            return num2 !== 0 ? num1 / num2 : 0;
        default:
            return 0;
    }
}

// Função para acessar campos independente do formato (snake_case ou camelCase)
function getField(obj, snakeCase, camelCase) {
    return obj[snakeCase] !== undefined ? obj[snakeCase] : obj[camelCase];
}

// Função para acessar campos numéricos independente do formato (snake_case ou camelCase)
function getNumField(obj, snakeCase, camelCase, defaultValue = 0) {
    const value = obj[snakeCase] !== undefined ? obj[snakeCase] : obj[camelCase];
    return parseFloat(value || defaultValue);
}

// Gerar relatório de consumo - VERSÃO CORRIGIDA
async function gerarRelatorioConsumo() {
    console.log('🔄 Iniciando geração de relatório de consumo...');
    
    // Mostrar alerta de loading
    AlertInfo.loading('Gerando Relatório de Consumo', 'Processando dados, aguarde...');
    
    // Mostrar loading enquanto processa
    const resultadosElement = document.getElementById('relatorioResultados');
    if (!resultadosElement) {
        console.error('❌ Elemento relatorioResultados não encontrado!');
        AlertUtils.close(); // Fechar loading
        AlertError.show('Erro do Sistema', 'Elemento de exibição do relatório não encontrado.');
        return;
    }
    
    resultadosElement.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Gerando relatório...</p></div>';
    
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    const caminhaoId = document.getElementById('caminhaoSelect').value;
    
    // Validar datas
    if (!dataInicio || !dataFim) {
        AlertUtils.close(); // Fechar loading
        AlertError.validation('Por favor, selecione o período para o relatório.');
        return;
    }

    console.log('📅 Período selecionado:', dataInicio, 'até', dataFim);
    console.log('🚛 Caminhão selecionado:', caminhaoId);
    
    // Inicializar variáveis de totais gerais
    let totalDistancia = 0;
    let totalConsumo = 0;
    let totalGasto = 0;

    // Garantir que os dados estão carregados - forçar recarregamento se necessário
    let dadosCaminhoes = window.caminhoes || caminhoes || [];
    let dadosAbastecimentos = window.abastecimentos || abastecimentos || [];
    
    // Normalizar campos de abastecimentos (snake_case -> camelCase) e converter valores numéricos
    dadosAbastecimentos = dadosAbastecimentos.map(a => ({
        ...a,
        caminhaoId: a.caminhao_id !== undefined ? a.caminhao_id : a.caminhaoId,
        kmInicial: parseFloat(a.km_inicial ?? a.kmInicial ?? 0),
        kmFinal: parseFloat(a.km_final ?? a.kmFinal ?? 0),
        litros: parseFloat(a.litros ?? 0),
        valorTotal: parseFloat(a.valor_total ?? a.valorTotal ?? 0)
    }));

    // Filtrar abastecimentos pelo período usando campo data (sem horário)
    let abastecimentosFiltrados = dadosAbastecimentos.filter(a => {
        const dataAbast = a.data.split('T')[0];
        return dataAbast >= dataInicio && dataAbast <= dataFim;
    });

    // Filtrar por caminhão específico
    if (caminhaoId !== 'todos') {
        const antesFiltro = abastecimentosFiltrados.length;
        abastecimentosFiltrados = abastecimentosFiltrados.filter(a => a.caminhaoId === caminhaoId);
        console.log(`🚛 Filtro por caminhão ${caminhaoId}: ${antesFiltro} → ${abastecimentosFiltrados.length}`);
    }

    // Agrupar dados usando campos normalizados
    const dadosPorCaminhao = {};
    abastecimentosFiltrados.forEach(a => {
        if (!dadosPorCaminhao[a.caminhaoId]) {
            const c = dadosCaminhoes.find(cami => cami.id === a.caminhaoId) || {};
            dadosPorCaminhao[a.caminhaoId] = {
                id: a.caminhaoId,
                placa: c.placa || 'Desconhecido',
                modelo: c.modelo || 'Desconhecido',
                totalKm: 0,
                totalLitros: 0,
                totalGasto: 0,
                abastecimentos: []
            };
        }
        const entry = dadosPorCaminhao[a.caminhaoId];
        const dist = a.kmFinal - a.kmInicial;
        // Atualizar totais gerais
        totalDistancia += dist;
        totalConsumo += a.litros;
        totalGasto += a.valorTotal;
        // Atualizar totais do caminhão
        entry.totalKm += dist;
        entry.totalLitros += a.litros;
        entry.totalGasto += a.valorTotal;
        entry.abastecimentos.push(a);
    });
    
    console.log('📊 Dados agrupados por caminhão:', Object.keys(dadosPorCaminhao).length, 'caminhões');
    // Remover duplicação de declaração de totais gerais (fornecida antes do agrupamento)
    // let totalDistancia = 0;
    // let totalConsumo = 0;
    // let totalGasto = 0;    // Calcular consumo médio e outros indicadores
    Object.values(dadosPorCaminhao).forEach(dadosCaminhao => {
        dadosCaminhao.mediaConsumo = dadosCaminhao.totalLitros > 0 ? 
            formatarNumero(dadosCaminhao.totalKm / dadosCaminhao.totalLitros, 2) : 'N/A';
        dadosCaminhao.custoMedio = dadosCaminhao.totalKm > 0 ? 
            formatarMoeda(dadosCaminhao.totalGasto / dadosCaminhao.totalKm) : 'N/A';
            
        console.log(`📈 ${dadosCaminhao.placa}: KM=${dadosCaminhao.totalKm}, L=${dadosCaminhao.totalLitros}, R$=${dadosCaminhao.totalGasto}, Consumo=${dadosCaminhao.mediaConsumo}, Custo/km=R$${dadosCaminhao.custoMedio}`);
        // Totais gerais já acumulados durante o agrupamento inicial, remover duplicação aqui
        // totalDistancia += dadosCaminhao.totalKm;
        // totalConsumo += dadosCaminhao.totalLitros;
        // totalGasto += dadosCaminhao.totalGasto;
    });
    
    // Gerar HTML para exibir os resultados
    let html = `
        <h4 class="mb-3">Relatório de Consumo - ${formatDate(dataInicio)} a ${formatDate(dataFim)}</h4>
        
        <div class="table-responsive mb-4">
            <table class="table table-striped table-bordered">
                <thead class="table-primary">
                    <tr>
                        <th>Caminhão</th>
                        <th>Distância (km)</th>
                        <th>Combustível (L)</th>
                        <th>Consumo Médio (km/l)</th>
                        <th>Gasto Total (R$)</th>
                        <th>Custo por km (R$)</th>
                    </tr>
                </thead>
                <tbody>
    `;
      // Adicionar linha para cada caminhão
    Object.values(dadosPorCaminhao).forEach(dados => {
        html += `
            <tr>
                <td>${dados.placa} - ${dados.modelo}</td>
                <td>${dados.totalKm.toLocaleString('pt-BR')}</td>
                <td>${formatarNumero(dados.totalLitros, 2)}</td>
                <td>${dados.mediaConsumo}</td>
                <td>R$ ${formatarMoeda(dados.totalGasto)}</td>
                <td>R$ ${dados.custoMedio}</td>
            </tr>
        `;
    });
      // Adicionar linha de totais
    const consumoMedioGeral = totalConsumo > 0 ? formatarNumero(totalDistancia / totalConsumo, 2) : 'N/A';
    const custoPorKmGeral = totalDistancia > 0 ? formatarMoeda(totalGasto / totalDistancia) : 'N/A';
    
    html += `        <tr class="table-success fw-bold">
            <td>TOTAL GERAL</td>
            <td>${totalDistancia.toLocaleString('pt-BR')}</td>
            <td>${formatarNumero(totalConsumo, 2)}</td>
            <td>${consumoMedioGeral}</td>
            <td>R$ ${formatarMoeda(totalGasto)}</td>
            <td>R$ ${custoPorKmGeral}</td>
        </tr>
    `;
    
    // Fechar tabela principal
    html += `
                </tbody>
            </table>
        </div>
    `;
      // Adicionar detalhamento por caminhão se houver mais de um
    if (Object.keys(dadosPorCaminhao).length > 1) {
        // Criar tabela de detalhamento para cada caminhão
        html += `<div class="accordion mb-4" id="detalhamentoCaminhoes">`;
        
        Object.values(dadosPorCaminhao).forEach((dados, index) => {
            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${dados.id}">
                            ${dados.placa} - ${dados.modelo} (${dados.abastecimentos.length} abastecimentos)
                        </button>
                    </h2>
                    <div id="collapse${dados.id}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#detalhamentoCaminhoes">
                        <div class="accordion-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-hover">
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Motorista</th>
                                            <th>Km Inicial</th>
                                            <th>Km Final</th>
                                            <th>Distância</th>
                                            <th>Litros</th>
                                            <th>Consumo</th>
                                            <th>Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
            `;
            
            // Ordenar abastecimentos por data (mais recentes primeiro)
            const abastecimentosOrdenados = [...dados.abastecimentos].sort((a, b) => {
                return new Date(b.data) - new Date(a.data);
            });
            
            abastecimentosOrdenados.forEach(a => {
                const kmInicial = getNumField(a, 'km_inicial', 'kmInicial');
                const kmFinal = getNumField(a, 'km_final', 'kmFinal');
                const litros = getNumField(a, 'litros', 'litros');
                const valorTotal = getNumField(a, 'valor_total', 'valorTotal');
                
                const distancia = kmFinal - kmInicial;
                const consumo = formatarNumero(distancia / litros, 2);
                
                html += `
                    <tr>
                        <td>${formatDate(a.data)}</td>
                        <td>${a.motorista}</td>
                        <td>${kmInicial.toLocaleString('pt-BR')}</td>
                        <td>${kmFinal.toLocaleString('pt-BR')}</td>
                        <td>${distancia.toLocaleString('pt-BR')}</td>
                        <td>${formatarMoeda(litros)}</td>
                        <td>${consumo} km/l</td>
                        <td>R$ ${formatarMoeda(valorTotal)}</td>
                    </tr>
                `;
            });
            
            html += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    } else if (Object.keys(dadosPorCaminhao).length === 1) {
        // Se for apenas um caminhão, mostrar gráfico de evolução do consumo
        const dadosCaminhao = Object.values(dadosPorCaminhao)[0];
        
        html += `
            <div class="mb-4">
                <h5>Evolução do Consumo - ${dadosCaminhao.placa}</h5>
                <div style="height: 300px;">
                    <canvas id="graficoEvolucaoConsumo"></canvas>
                </div>
            </div>
            
            <div class="table-responsive mb-4">
                <h5>Detalhamento dos Abastecimentos</h5>
                <table class="table table-striped table-bordered table-sm">
                    <thead class="table-primary">
                        <tr>
                            <th>Data</th>
                            <th>Motorista</th>
                            <th>Km Inicial</th>
                            <th>Km Final</th>
                            <th>Distância</th>
                            <th>Litros</th>
                            <th>Consumo</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Ordenar abastecimentos por data (mais recentes primeiro)
        const abastecimentosOrdenados = [...dadosCaminhao.abastecimentos].sort((a, b) => {
            return new Date(b.data) - new Date(a.data);
        });
        
        abastecimentosOrdenados.forEach(a => {
            const kmInicial = getNumField(a, 'km_inicial', 'kmInicial');
            const kmFinal = getNumField(a, 'km_final', 'kmFinal');
            const litros = getNumField(a, 'litros', 'litros');
            const valorTotal = getNumField(a, 'valor_total', 'valorTotal');
            
            const distancia = kmFinal - kmInicial;
            const consumo = formatarMoeda(distancia / litros);
            
            html += `
                <tr>
                    <td>${formatDate(a.data)}</td>
                    <td>${a.motorista}</td>
                    <td>${kmInicial.toLocaleString('pt-BR')}</td>
                    <td>${kmFinal.toLocaleString('pt-BR')}</td>
                    <td>${distancia.toLocaleString('pt-BR')}</td>
                    <td>${formatarMoeda(litros)}</td>
                    <td>${consumo} km/l</td>
                    <td>R$ ${formatarMoeda(valorTotal)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>        `;
    }
    
    console.log('📋 HTML gerado:', html.substring(0, 500) + '...');
    console.log('📊 Dados finais para exibição:', Object.values(dadosPorCaminhao).map(d => ({
        placa: d.placa,
        modelo: d.modelo, 
        totalKm: d.totalKm,
        totalLitros: d.totalLitros,
        totalGasto: d.totalGasto,
        mediaConsumo: d.mediaConsumo,
        custoMedio: d.custoMedio
    })));      // Exibir resultados
    if (!resultadosElement) {
        console.error('❌ Elemento relatorioResultados não encontrado!');
        AlertError.show('Erro do Sistema', 'Elemento de exibição do relatório não encontrado.');
        return;
    }
    
    resultadosElement.innerHTML = html;
    console.log('✅ Relatório exibido com sucesso!');
      // Criar gráficos após renderizar o HTML
    if (Object.keys(dadosPorCaminhao).length === 1) {
        // Gráfico de evolução para um caminhão
        const dadosCaminhao = Object.values(dadosPorCaminhao)[0];
        const abastecimentosOrdenados = [...dadosCaminhao.abastecimentos].sort((a, b) => {
            return new Date(a.data) - new Date(b.data);
        });
        
        const labels = abastecimentosOrdenados.map(a => formatDate(a.data));
        const consumoData = abastecimentosOrdenados.map(a => {
            const kmInicial = getNumField(a, 'km_inicial', 'kmInicial');
            const kmFinal = getNumField(a, 'km_final', 'kmFinal');
            const litros = getNumField(a, 'litros', 'litros');
            
            const distancia = kmFinal - kmInicial;
            return distancia / litros;
        });
        
        createCustomChart(
            'graficoEvolucaoConsumo',
            'line',
            labels,
            [{
                label: 'Consumo (km/l)',
                data: consumoData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.1
            }],            'Evolução do Consumo',
            'Data',
            'Consumo (km/l)'
        );
    }
    
    // Fechar loading e mostrar sucesso
    AlertUtils.close();
    
    const totalRegistros = Object.keys(dadosPorCaminhao).length;
    if (totalRegistros > 0) {
        AlertToast.success(`Relatório de consumo gerado com sucesso! (${totalRegistros} ${totalRegistros === 1 ? 'caminhão' : 'caminhões'})`);
    } else {
        AlertWarning.noData('Nenhum dado encontrado para o período selecionado.');
    }
}

// Gerar relatório de custos
async function gerarRelatorioCustos() {
    console.log('🔄 Iniciando geração de relatório de custos diário...');
    
    // Mostrar alerta de loading
    AlertInfo.loading('Gerando Relatório de Custos', 'Processando dados diários, aguarde...');
    
    // Spinner de carregamento
    const resultadosElement = document.getElementById('relatorioResultados');
    if (!resultadosElement) {
        console.error('❌ Elemento relatorioResultados não encontrado!');
        AlertUtils.close(); // Fechar loading
        AlertError.show('Erro do Sistema', 'Elemento de exibição do relatório não encontrado.');
        return;
    }
    resultadosElement.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Gerando relatório de custos...</p></div>';

    // Capturar intervalos diários e caminhão
    const dataInicio = document.getElementById('custosDataInicio').value;
    const dataFim = document.getElementById('custosDataFim').value;
    const caminhaoId = document.getElementById('caminhaoCustosSelect').value;

    // Validar datas
    if (!dataInicio || !dataFim) {
        AlertUtils.close(); // Fechar loading
        AlertError.validation('Por favor, selecione o período para o relatório.');
        return;
    }

    // Acessar dados carregados
    const dadosCaminhoes = window.caminhoes || [];
    let dadosAbastecimentos = window.abastecimentos || [];
    // Normalizar campos camelCase e numéricos
    dadosAbastecimentos = dadosAbastecimentos.map(a => ({
        ...a,
        caminhaoId: getField(a, 'caminhao_id', 'caminhaoId'),
        kmInicial: getNumField(a, 'km_inicial', 'kmInicial'),
        kmFinal: getNumField(a, 'km_final', 'kmFinal'),
        litros: getNumField(a, 'litros', 'litros'),
        valorTotal: getNumField(a, 'valor_total', 'valorTotal')
    }));

    // Filtrar por data
    let filtrados = dadosAbastecimentos.filter(a => {
        const dia = a.data.split('T')[0];
        return dia >= dataInicio && dia <= dataFim;
    });    // Filtrar por caminhão
    if (caminhaoId !== 'todos') {
        filtrados = filtrados.filter(a => a.caminhaoId === caminhaoId);
    }
    if (filtrados.length === 0) {
        AlertWarning.noData();
        return;
    }

    // Agrupar por caminhão
    const dadosPorCaminhao = {};
    filtrados.forEach(a => {
        if (!dadosPorCaminhao[a.caminhaoId]) {
            const c = dadosCaminhoes.find(c => c.id === a.caminhaoId) || {};
            dadosPorCaminhao[a.caminhaoId] = {
                placa: c.placa || 'Desconhecido',
                modelo: c.modelo || 'Desconhecido',
                totalLitros: 0,
                totalGasto: 0,
                totalKm: 0
            };
        }
        const entry = dadosPorCaminhao[a.caminhaoId];
        const dist = a.kmFinal - a.kmInicial;
        entry.totalLitros += a.litros;
        entry.totalGasto += a.valorTotal;
        entry.totalKm += dist;
    });    // Calcular totais e indicadores
    let totalLitrosGeral = 0, totalGastoGeral = 0, totalKmGeral = 0;
    Object.values(dadosPorCaminhao).forEach(d => {
        d.mediaConsumo = d.totalLitros > 0 ? formatarNumero(d.totalKm / d.totalLitros, 2) : 'N/A';
        d.custoMedio = d.totalKm > 0 ? formatarMoeda(d.totalGasto / d.totalKm) : 'N/A';
        d.valorMedioLitro = d.totalLitros > 0 ? formatarMoeda(d.totalGasto / d.totalLitros) : 'N/A';
        totalLitrosGeral += d.totalLitros;
        totalGastoGeral += d.totalGasto;
        totalKmGeral += d.totalKm;
    });
    const consumoMedioGeral = totalLitrosGeral > 0 ? formatarNumero(totalKmGeral / totalLitrosGeral, 2) : 'N/A';
    const custoPorKmGeral = totalKmGeral > 0 ? formatarMoeda(totalGastoGeral / totalKmGeral) : 'N/A';

    // Montar HTML de resultado
    let html = `
        <h4 class="mb-3">Relatório de Custos - ${formatDate(dataInicio)} a ${formatDate(dataFim)}</h4>
        <div class="table-responsive mb-4">
            <table class="table table-striped table-bordered">
                <thead class="table-primary">
                    <tr>
                        <th>Caminhão</th>
                        <th>Combustível (L)</th>
                        <th>Gasto Total (R$)</th>
                        <th>Distância (km)</th>
                        <th>Valor Médio/L (R$)</th>
                        <th>Consumo (km/l)</th>
                        <th>Custo/km (R$)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    Object.values(dadosPorCaminhao).forEach(d => {
        html += `            <tr>
                <td>${d.placa} - ${d.modelo}</td>
                <td>${formatarNumero(d.totalLitros, 2)}</td>
                <td>R$ ${formatarMoeda(d.totalGasto)}</td>
                <td>${d.totalKm.toLocaleString('pt-BR')}</td>
                <td>R$ ${d.valorMedioLitro}</td>
                <td>${d.mediaConsumo} km/l</td>
                <td>R$ ${d.custoMedio}</td>
            </tr>
        `;
    });
    html += `            <tr class="table-success fw-bold">
                <td>TOTAL GERAL</td>
                <td>${formatarNumero(totalLitrosGeral, 2)}</td>
                <td>R$ ${formatarMoeda(totalGastoGeral)}</td>
                <td>${totalKmGeral.toLocaleString('pt-BR')}</td>
                <td>-</td>
                <td>${consumoMedioGeral}</td>
                <td>R$ ${custoPorKmGeral}</td>
            </tr>
        </tbody>
    </table>
</div>    `;
    resultadosElement.innerHTML = html;
    
    // Fechar loading e mostrar sucesso
    AlertUtils.close();
    
    const totalRegistros = Object.keys(dadosPorCaminhao).length;
    if (totalRegistros > 0) {
        AlertToast.success(`Relatório de custos gerado com sucesso! (${totalRegistros} ${totalRegistros === 1 ? 'caminhão' : 'caminhões'})`);
    } else {
        AlertWarning.noData('Nenhum dado encontrado para o período selecionado.');
    }
}

// Exportar relatório para Excel com Dashboard Profissional
function exportarRelatorioExcel() {
    // Mostrar loading para exportação
    AlertInfo.loading('Exportando para Excel', 'Gerando planilha profissional com dashboards, aguarde...');
    
    const relatorioDiv = document.getElementById('relatorioResultados');
    
    // Verificar se há um relatório gerado
    if (relatorioDiv.querySelector('.alert')) {
        AlertUtils.close();
        AlertWarning.show('Ação Inválida', 'Gere um relatório válido antes de exportar.');
        return;
    }
    
    try {
        // Obter dados do relatório atual
        const dadosRelatorio = obterDadosDoRelatorio();
        if (!dadosRelatorio || dadosRelatorio.length === 0) {
            AlertUtils.close();
            AlertWarning.show('Sem Dados', 'Nenhum dado encontrado para exportar.');
            return;
        }
        
        // Criar um novo livro Excel
        const wb = XLSX.utils.book_new();
        
        // 1. Criar planilha de Dashboard
        criarPlanilhaDashboard(wb, dadosRelatorio);
        
        // 2. Criar planilha de Resumo Executivo
        criarPlanilhaResumoExecutivo(wb, dadosRelatorio);
        
        // 3. Criar planilha de Dados Detalhados
        criarPlanilhaDadosDetalhados(wb, dadosRelatorio);
        
        // 4. Criar planilha de Análise de Custos
        criarPlanilhaAnaliseCustos(wb, dadosRelatorio);
        
        // 5. Criar planilha de Indicadores
        criarPlanilhaIndicadores(wb, dadosRelatorio);
        
        // Gerar nome do arquivo com data atual
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0];
        const nomeArquivo = `Relatorio_Combustivel_Profissional_${dataFormatada}.xlsx`;
        
        // Exportar o arquivo
        XLSX.writeFile(wb, nomeArquivo);
        
        // Fechar loading e mostrar sucesso
        AlertUtils.close();
        AlertToast.success(`Relatório Excel profissional baixado com sucesso! (${nomeArquivo})`);
        
    } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        AlertUtils.close();
        AlertError.show('Erro na Exportação', 'Ocorreu um erro ao gerar o arquivo Excel. Tente novamente.');
    }
}

// Função para obter dados do relatório atual
function obterDadosDoRelatorio() {
    try {        // Obter dados do período selecionado
        let dataInicio = document.getElementById('dataInicio')?.value || document.getElementById('custosDataInicio')?.value;
        let dataFim = document.getElementById('dataFim')?.value || document.getElementById('custosDataFim')?.value;
        const caminhaoId = document.getElementById('caminhaoSelect')?.value || document.getElementById('caminhaoCustosSelect')?.value;
        
        // Se não há datas selecionadas, usar período padrão (últimos 30 dias)
        if (!dataInicio || !dataFim) {
            const hoje = new Date();
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(hoje.getDate() - 30);
            
            dataInicio = trintaDiasAtras.toISOString().split('T')[0];
            dataFim = hoje.toISOString().split('T')[0];
            
            console.log('📅 Usando período padrão:', dataInicio, 'até', dataFim);
        }
          // Acessar dados globais
        const dadosCaminhoes = window.caminhoes || [];
        let dadosAbastecimentos = window.abastecimentos || [];
        
        console.log('📊 Dados disponíveis:', {
            caminhoes: dadosCaminhoes.length,
            abastecimentos: dadosAbastecimentos.length,
            periodo: { inicio: dataInicio, fim: dataFim }
        });
        
        // Verificar se há dados básicos
        if (dadosCaminhoes.length === 0) {
            return {
                valid: false,
                message: 'Não há caminhões cadastrados no sistema. Por favor, cadastre pelo menos um caminhão.'
            };
        }
        
        if (dadosAbastecimentos.length === 0) {
            return {
                valid: false,
                message: 'Não há abastecimentos cadastrados no sistema. Por favor, registre pelo menos um abastecimento.'
            };
        }
          // Normalizar campos
        dadosAbastecimentos = dadosAbastecimentos.map(a => ({
            ...a,
            caminhaoId: getField(a, 'caminhao_id', 'caminhaoId'),
            kmInicial: getNumField(a, 'km_inicial', 'kmInicial'),
            kmFinal: getNumField(a, 'km_final', 'kmFinal'),
            litros: getNumField(a, 'litros', 'litros'),
            valorTotal: getNumField(a, 'valor_total', 'valorTotal')
        }));
        
        // Filtrar por período
        let abastecimentosFiltrados = dadosAbastecimentos.filter(a => {
            const dataAbast = a.data.split('T')[0];
            return dataAbast >= dataInicio && dataAbast <= dataFim;
        });
        
        // Filtrar por caminhão se especificado
        if (caminhaoId && caminhaoId !== 'todos') {
            abastecimentosFiltrados = abastecimentosFiltrados.filter(a => a.caminhaoId === caminhaoId);
        }
        
        // Agrupar dados por caminhão
        const dadosPorCaminhao = {};
        abastecimentosFiltrados.forEach(a => {
            if (!dadosPorCaminhao[a.caminhaoId]) {
                const c = dadosCaminhoes.find(cami => cami.id === a.caminhaoId) || {};
                dadosPorCaminhao[a.caminhaoId] = {
                    id: a.caminhaoId,
                    placa: c.placa || 'Desconhecido',
                    modelo: c.modelo || 'Desconhecido',
                    totalKm: 0,
                    totalLitros: 0,
                    totalGasto: 0,
                    abastecimentos: []
                };
            }
            const entry = dadosPorCaminhao[a.caminhaoId];
            const dist = a.kmFinal - a.kmInicial;
            entry.totalKm += dist;
            entry.totalLitros += a.litros;
            entry.totalGasto += a.valorTotal;
            entry.abastecimentos.push(a);
        });
          // Calcular métricas
        Object.values(dadosPorCaminhao).forEach(dados => {
            dados.mediaConsumo = dados.totalLitros > 0 ? dados.totalKm / dados.totalLitros : 0;
            dados.custoMedio = dados.totalKm > 0 ? dados.totalGasto / dados.totalKm : 0;
            dados.valorMedioLitro = dados.totalLitros > 0 ? dados.totalGasto / dados.totalLitros : 0;
        });
        
        // Verificar se há dados suficientes para gerar o relatório
        if (abastecimentosFiltrados.length === 0) {
            return {
                valid: false,
                message: 'Não foram encontrados abastecimentos no período selecionado. Por favor, verifique as datas ou adicione dados de abastecimento.'
            };
        }
        
        if (Object.keys(dadosPorCaminhao).length === 0) {
            return {
                valid: false,
                message: 'Não foram encontrados dados de caminhões para o período selecionado.'
            };
        }
          // Calcular totais gerais
        let totalGasto = 0;
        let totalConsumo = 0;
        let totalDistancia = 0;
        let totalAbastecimentos = 0;
        
        Object.values(dadosPorCaminhao).forEach(dados => {
            totalGasto += dados.totalGasto;
            totalConsumo += dados.totalLitros;
            totalDistancia += dados.totalKm;
            totalAbastecimentos += dados.abastecimentos.length;
        });
        
        // Calcular médias
        const totalCaminhoes = Object.keys(dadosPorCaminhao).length;
        const medias = {
            consumo: totalConsumo > 0 ? (totalDistancia / totalConsumo) : 0,
            custoPorKm: totalDistancia > 0 ? (totalGasto / totalDistancia) : 0,
            gastoMedio: totalCaminhoes > 0 ? (totalGasto / totalCaminhoes) : 0,
            litrosMedio: totalCaminhoes > 0 ? (totalConsumo / totalCaminhoes) : 0
        };
        
        return {
            valid: true,
            periodo: { inicio: dataInicio, fim: dataFim },
            caminhaoSelecionado: caminhaoId,
            dadosPorCaminhao: dadosPorCaminhao,
            abastecimentos: abastecimentosFiltrados,
            abastecimentosFiltrados: abastecimentosFiltrados,
            caminhoes: dadosCaminhoes,
            totalCaminhoes: totalCaminhoes,
            totalAbastecimentos: totalAbastecimentos,
            totais: {
                gasto: totalGasto,
                consumo: totalConsumo,
                distancia: totalDistancia
            },
            medias: medias
        };
        
    } catch (error) {
        console.error('Erro ao obter dados do relatório:', error);
        return {
            valid: false,
            message: `Erro ao processar dados: ${error.message}`
        };
    }
}

// Criar planilha de Dashboard
function criarPlanilhaDashboard(wb, dados) {
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // Cabeçalho do Dashboard
    const hoje = new Date().toLocaleDateString('pt-BR');
    const periodoTexto = `${formatDate(dados.periodo.inicio)} a ${formatDate(dados.periodo.fim)}`;
    
    // Calcular totais gerais
    const totais = calcularTotaisGerais(dados.dadosPorCaminhao);
    
    // Linha 1-3: Título e informações gerais
    XLSX.utils.sheet_add_aoa(ws, [
        ['DASHBOARD EXECUTIVO - CONTROLE DE COMBUSTÍVEL'],
        [''],
        [`Período: ${periodoTexto}`, '', '', '', `Gerado em: ${hoje}`],
        [''],
        ['INDICADORES PRINCIPAIS'],
        [''],
        ['Métrica', 'Valor', 'Unidade'],
        ['Total de Caminhões', Object.keys(dados.dadosPorCaminhao).length, 'veículos'],
        ['Distância Total', totais.totalKm.toLocaleString('pt-BR'), 'km'],
        ['Combustível Total', totais.formatarMoeda(totalLitros), 'litros'],
        ['Gasto Total', `R$ ${totais.formatarMoeda(totalGasto)}`, 'reais'],
        ['Consumo Médio Geral', totais.formatarMoeda(consumoMedio), 'km/l'],
        ['Custo por Quilômetro', `R$ ${totais.formatarMoeda(custoPorKm)}`, 'reais/km'],
        ['Valor Médio do Litro', `R$ ${totais.formatarMoeda(valorMedioLitro)}`, 'reais/litro'],
        [''],
        ['RANKING DE EFICIÊNCIA'],
        [''],
        ['Posição', 'Caminhão', 'Consumo (km/l)', 'Custo/km (R$)', 'Status']
    ], { origin: 'A1' });
    
    // Ranking de eficiência
    const ranking = Object.values(dados.dadosPorCaminhao)
        .sort((a, b) => b.mediaConsumo - a.mediaConsumo)
        .slice(0, 10);
    
    let linha = 20;
    ranking.forEach((caminhao, index) => {
        const status = caminhao.mediaConsumo >= totais.consumoMedio ? 'Eficiente' : 'Atenção';
        XLSX.utils.sheet_add_aoa(ws, [
            [index + 1, `${caminhao.placa} - ${caminhao.modelo}`, 
             caminhao.formatarMoeda(mediaConsumo), `R$ ${caminhao.formatarMoeda(custoMedio)}`, status]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    // Aplicar estilização básica
    aplicarEstilizacaoDashboard(ws);
    
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
}

// Criar planilha de Resumo Executivo
function criarPlanilhaResumoExecutivo(wb, dados) {
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    const totais = calcularTotaisGerais(dados.dadosPorCaminhao);
    
    // Cabeçalho
    XLSX.utils.sheet_add_aoa(ws, [
        ['RESUMO EXECUTIVO'],
        [''],
        ['Caminhão', 'Placa', 'Modelo', 'Distância (km)', 'Combustível (L)', 
         'Gasto Total (R$)', 'Consumo (km/l)', 'Custo/km (R$)', 'Valor/L (R$)', 'Abastecimentos']
    ], { origin: 'A1' });
    
    // Dados dos caminhões
    let linha = 4;
    Object.values(dados.dadosPorCaminhao).forEach(caminhao => {
        XLSX.utils.sheet_add_aoa(ws, [
            [caminhao.placa, caminhao.placa, caminhao.modelo, 
             caminhao.totalKm, caminhao.formatarMoeda(totalLitros),
             caminhao.formatarMoeda(totalGasto), caminhao.formatarMoeda(mediaConsumo),
             caminhao.formatarMoeda(custoMedio), caminhao.formatarMoeda(valorMedioLitro),
             caminhao.abastecimentos.length]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    // Linha de totais com fórmulas
    const ultimaLinha = linha;
    XLSX.utils.sheet_add_aoa(ws, [
        ['TOTAL GERAL', '', '', 
         `=SUM(D4:D${ultimaLinha-1})`, `=SUM(E4:E${ultimaLinha-1})`,
         `=SUM(F4:F${ultimaLinha-1})`, `=D${ultimaLinha}/E${ultimaLinha}`,
         `=F${ultimaLinha}/D${ultimaLinha}`, `=F${ultimaLinha}/E${ultimaLinha}`,
         `=SUM(J4:J${ultimaLinha-1})`]
    ], { origin: `A${linha}` });
    
    XLSX.utils.book_append_sheet(wb, ws, 'Resumo Executivo');
}

// Criar planilha de Dados Detalhados
function criarPlanilhaDadosDetalhados(wb, dados) {
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // Cabeçalho
    XLSX.utils.sheet_add_aoa(ws, [
        ['DADOS DETALHADOS DOS ABASTECIMENTOS'],
        [''],
        ['Data', 'Caminhão', 'Placa', 'Motorista', 'Km Inicial', 'Km Final', 
         'Distância', 'Litros', 'Valor Total', 'Valor/L', 'Consumo (km/l)']
    ], { origin: 'A1' });
    
    // Dados detalhados
    let linha = 4;
    const abastecimentosOrdenados = dados.abastecimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    abastecimentosOrdenados.forEach(abast => {
        const caminhao = dados.caminhoes.find(c => c.id === abast.caminhaoId) || {};
        const distancia = abast.kmFinal - abast.kmInicial;
        const valorPorLitro = abast.litros > 0 ? abast.valorTotal / abast.litros : 0;
        const consumo = abast.litros > 0 ? distancia / abast.litros : 0;
        
        XLSX.utils.sheet_add_aoa(ws, [
            [formatDate(abast.data), `${caminhao.placa} - ${caminhao.modelo}`, caminhao.placa,
             abast.motorista, abast.kmInicial, abast.kmFinal, distancia,
             abast.formatarMoeda(litros), abast.formatarMoeda(valorTotal), 
             formatarMoeda(valorPorLitro), formatarMoeda(consumo)]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    XLSX.utils.book_append_sheet(wb, ws, 'Dados Detalhados');
}

// Criar planilha de Análise de Custos
function criarPlanilhaAnaliseCustos(wb, dados) {
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // Análise por período (agrupamento por mês)
    const analiseTemporalData = criarAnaliseTemporalData(dados.abastecimentos);
    
    XLSX.utils.sheet_add_aoa(ws, [
        ['ANÁLISE DE CUSTOS POR PERÍODO'],
        [''],
        ['Mês/Ano', 'Abastecimentos', 'Distância (km)', 'Combustível (L)', 
         'Gasto Total (R$)', 'Consumo Médio (km/l)', 'Custo/km (R$)']
    ], { origin: 'A1' });
    
    let linha = 4;
    analiseTemporalData.forEach(periodo => {
        XLSX.utils.sheet_add_aoa(ws, [
            [periodo.periodo, periodo.abastecimentos, periodo.distancia,
             periodo.formatarMoeda(combustivel), periodo.formatarMoeda(gasto),
             periodo.formatarMoeda(consumoMedio), periodo.formatarMoeda(custoPorKm)]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    // Análise de variação de preços
    linha += 2;
    XLSX.utils.sheet_add_aoa(ws, [
        ['VARIAÇÃO DE PREÇOS DO COMBUSTÍVEL'],
        [''],
        ['Data', 'Valor/Litro (R$)', 'Variação %', 'Tendência']
    ], { origin: `A${linha}` });
    
    linha += 3;
    const analisePrecos = criarAnalisePrecos(dados.abastecimentos);
    analisePrecos.forEach(preco => {
        XLSX.utils.sheet_add_aoa(ws, [
            [formatDate(preco.data), preco.formatarMoeda(valorLitro), 
             preco.formatarMoeda(variacao), preco.tendencia]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    XLSX.utils.book_append_sheet(wb, ws, 'Análise de Custos');
}

// Criar planilha de Indicadores
function criarPlanilhaIndicadores(wb, dados) {
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    const totais = calcularTotaisGerais(dados.dadosPorCaminhao);
    
    XLSX.utils.sheet_add_aoa(ws, [
        ['INDICADORES DE PERFORMANCE (KPIs)'],
        [''],
        ['Indicador', 'Valor Atual', 'Meta Sugerida', 'Status', 'Observação'],
        [''],
        ['Consumo Médio Geral (km/l)', totais.formatarMoeda(consumoMedio), '12.0', 
         totais.consumoMedio >= 12 ? 'OK' : 'Atenção', 
         totais.consumoMedio >= 12 ? 'Dentro da meta' : 'Abaixo da meta recomendada'],
        ['Custo por Quilômetro (R$/km)', totais.formatarMoeda(custoPorKm), '0.60',
         totais.custoPorKm <= 0.6 ? 'OK' : 'Atenção',
         totais.custoPorKm <= 0.6 ? 'Custo controlado' : 'Custo elevado'],
        ['Variação Consumo Entre Veículos (%)', 
         calcularVariacaoConsumoformatarMoeda(dados.dadosPorCaminhao), '15.0',
         calcularVariacaoConsumo(dados.dadosPorCaminhao) <= 15 ? 'OK' : 'Atenção',
         'Quanto menor, mais homogênea a frota'],
        [''],
        ['ANÁLISE DETALHADA POR VEÍCULO'],
        [''],
        ['Veículo', 'Consumo (km/l)', 'Vs. Média Geral', 'Custo/km (R$)', 'Classificação']
    ], { origin: 'A1' });
    
    let linha = 12;
    Object.values(dados.dadosPorCaminhao).forEach(caminhao => {
        const variacaoConsumo = ((caminhao.mediaConsumo - totais.consumoMedio) / totais.consumoMedio * 100);
        const classificacao = caminhao.mediaConsumo >= totais.consumoMedio ? 'Eficiente' : 'Ineficiente';
        
        XLSX.utils.sheet_add_aoa(ws, [
            [`${caminhao.placa} - ${caminhao.modelo}`, 
             caminhao.formatarMoeda(mediaConsumo),
             `${variacaoConsumo > 0 ? '+' : ''}${formatarNumero(variacaoConsumo, 1)}%`,
             `R$ ${caminhao.formatarMoeda(custoMedio)}`,
             classificacao]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    XLSX.utils.book_append_sheet(wb, ws, 'Indicadores KPI');
}

// ================== NOVA FUNÇÃO PDF COMPLETO ==================

// Nova função para exportar PDF completo com todos os dados e análises
function exportarPdfCompleto() {
    AlertInfo.loading('Gerando PDF Completo', 'Criando relatório abrangente com dashboards e análises...');
    
    try {
        // Obter dados do relatório
        const dados = obterDadosDoRelatorio();
        if (!dados.valid) {
            AlertUtils.close();
            AlertWarning.show('Dados Insuficientes', dados.message);
            return;
        }
        
        // Criar novo documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('portrait', 'mm', 'a4');
        
        // Cores para estilização
        const cores = {
            primaria: [41, 128, 185],
            secundaria: [52, 152, 219],
            sucesso: [39, 174, 96],
            alerta: [241, 196, 15],
            perigo: [231, 76, 60],
            info: [155, 89, 182],
            texto: [44, 62, 80],
            cinza: [149, 165, 166]
        };
        
        let yPos = 20;
        
        // ================== PÁGINA 1: CAPA E RESUMO EXECUTIVO ==================
        criarCapaPdf(doc, dados, cores, yPos);
        
        // ================== PÁGINA 2: DASHBOARD EXECUTIVO ==================
        doc.addPage();
        yPos = criarDashboardExecutivoPdf(doc, dados, cores);
        
        // ================== PÁGINA 3: ANÁLISE DETALHADA ==================
        doc.addPage();
        yPos = criarAnaliseDetalhadaPdf(doc, dados, cores);
        
        // ================== PÁGINA 4: ANÁLISE DE CUSTOS E TENDÊNCIAS ==================
        doc.addPage();
        yPos = criarAnaliseCustosPdf(doc, dados, cores);
        
        // ================== PÁGINA 5: INDICADORES DE PERFORMANCE ==================
        doc.addPage();
        yPos = criarIndicadoresPdf(doc, dados, cores);
        
        // ================== PÁGINA 6: ANÁLISE PREDITIVA ==================
        doc.addPage();
        yPos = criarAnalisePreditivaPdf(doc, dados, cores);
        
        // ================== PÁGINA 7: DADOS DETALHADOS ==================
        doc.addPage();
        yPos = criarDadosDetalhadosPdf(doc, dados, cores);
        
        // ================== PÁGINA 8: SIMULADOR DE CENÁRIOS ==================
        doc.addPage();
        yPos = criarSimuladorCenariosPdf(doc, dados, cores);
        
        // ================== PÁGINA 9: MANUTENÇÃO PREVENTIVA ==================
        doc.addPage();
        yPos = criarManutencaoPreventivaPdf(doc, dados, cores);
        
        // Gerar nome do arquivo
        const agora = new Date();
        const timestamp = agora.toISOString().replace(/[:.]/g, '-').split('T');
        const nomeArquivo = `relatorio-completo-combustivel-${timestamp[0]}-${timestamp[1].substring(0,6)}.pdf`;
        
        // Salvar o arquivo
        doc.save(nomeArquivo);
        
        AlertUtils.close();
        AlertToast.success(`PDF Completo gerado com sucesso! (${nomeArquivo})`);
        
    } catch (error) {
        console.error('Erro ao gerar PDF completo:', error);
        AlertUtils.close();
        AlertError.show('Erro na Exportação', `Erro ao gerar PDF: ${error.message}`);
    }
}

// ================== FUNÇÕES AUXILIARES FALTANTES PARA PDF COMPLETO ==================

// Página 1: Capa e Resumo Executivo
function criarCapaPdf(doc, dados, cores) {
    // Configurar fonte para a capa
    doc.setTextColor(...cores.texto);
    
    // Logo/Título Principal
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(20) && !isNaN(190) && !isNaN(30)) {
        doc.rect(10, 20, 190, 30, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('RELATÓRIO DE COMBUSTÍVEL', 105, 40, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(14);
    doc.text('Análise Completa de Consumo e Performance', 105, 48, { align: 'center' });
    
    // Informações do relatório
    doc.setTextColor(...cores.texto);
    doc.setFontSize(12);
    
    let yPos = 70;
    
    // Data do relatório
    const agora = new Date();
    const dataAtual = agora.toLocaleDateString('pt-BR');
    doc.text(`Data de Geração: ${dataAtual}`, 20, yPos);
    yPos += 10;
    
    // Período analisado
    if (dados.periodo) {
        doc.text(`Período Analisado: ${dados.periodo.inicio} até ${dados.periodo.fim}`, 20, yPos);
        yPos += 10;
    }
    
    // Total de veículos
    doc.text(`Total de Veículos: ${dados.totalCaminhoes}`, 20, yPos);
    yPos += 10;
    
    // Total de abastecimentos
    doc.text(`Total de Abastecimentos: ${dados.totalAbastecimentos}`, 20, yPos);
    yPos += 20;
    
    // Resumo Executivo
    doc.setFillColor(...cores.secundaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(10, yPos, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('RESUMO EXECUTIVO', 105, yPos + 10, { align: 'center' });
    
    yPos += 25;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(12);
    
    // Principais indicadores
    const items = [
        `Total Gasto: R$ ${dados.totais.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `Total Consumido: ${dados.totais.consumo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} L`,
        `Distância Total: ${dados.totais.distancia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} km`,
        `Média de Consumo: ${dados.medias.formatarMoeda(consumo)} km/L`,
        `Custo por km: R$ ${dados.medias.formatarMoeda(custoPorKm)}`
    ];
    
    items.forEach(item => {
        doc.text(`• ${item}`, 20, yPos);
        yPos += 8;
    });
      // Observações importantes
    yPos += 20;
    doc.setFillColor(...cores.alerta);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(10, yPos, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('PRINCIPAIS INSIGHTS', 105, yPos + 10, { align: 'center' });
    
    yPos += 25;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(11);
    
    // Análise automática baseada nos dados
    const insights = [];
    
    if (dados.medias.consumo < 3) {
        insights.push('• Consumo médio abaixo do esperado - investigar possíveis problemas');
    } else if (dados.medias.consumo > 6) {
        insights.push('• Excelente eficiência no consumo da frota');
    }
    
    if (dados.medias.custoPorKm > 2) {
        insights.push('• Custo por quilômetro elevado - revisar estratégias de abastecimento');
    }
    
    if (insights.length === 0) {
        insights.push('• Performance da frota dentro dos padrões esperados');
        insights.push('• Continue monitorando para manter a eficiência');
    }
    
    insights.forEach(insight => {
        doc.text(insight, 20, yPos);
        yPos += 7;
    });
    
    // Rodapé da capa
    doc.setFontSize(10);
    doc.setTextColor(...cores.cinza);
    doc.text('Sistema de Controle de Combustível - Relatório Automatizado', 105, 280, { align: 'center' });
    
    return yPos;
}

// Página 2: Dashboard Executivo
function criarDashboardExecutivoPdf(doc, dados, cores) {    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('DASHBOARD EXECUTIVO', 105, 21, { align: 'center' });
    
    let yPos = 35;
    doc.setTextColor(...cores.texto);
    
    // KPIs principais em cards
    const kpis = [
        { label: 'Gasto Total', valor: `R$ ${dados.totais.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, cor: cores.sucesso },
        { label: 'Consumo Total', valor: `${dados.totais.consumo.toLocaleString('pt-BR')} L`, cor: cores.info },
        { label: 'Distância Total', valor: `${dados.totais.distancia.toLocaleString('pt-BR')} km`, cor: cores.alerta },
        { label: 'Eficiência Média', valor: `${dados.medias.formatarMoeda(consumo)} km/L`, cor: cores.secundaria }
    ];
      // Desenhar cards dos KPIs
    let cardX = 15;
    kpis.forEach(kpi => {
        // Card background - validar argumentos antes de chamar rect()
        if (!isNaN(cardX) && !isNaN(yPos) && cardX >= 0 && yPos >= 0) {
            doc.setFillColor(...kpi.cor);
            doc.rect(cardX, yPos, 40, 25, 'F');
        }
        
        // Texto do card
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(kpi.label, cardX + 20, yPos + 8, { align: 'center' });
        doc.setFontSize(12);
        doc.text(kpi.valor, cardX + 20, yPos + 18, { align: 'center' });
        
        cardX += 45;
    });
    
    yPos += 40;
      // Gráfico de barras simples - Top 5 veículos por consumo
    doc.setTextColor(...cores.texto);
    doc.setFontSize(14);
    doc.text('TOP 5 VEÍCULOS POR CONSUMO', 20, yPos);
    yPos += 15;
    
    const caminhoesPorConsumo = Object.values(dados.dadosPorCaminhao)
        .filter(c => c.totalLitros && !isNaN(c.totalLitros) && c.totalLitros > 0)
        .sort((a, b) => b.totalLitros - a.totalLitros)
        .slice(0, 5);
    
    if (caminhoesPorConsumo.length > 0) {
        const maxConsumo = Math.max(...caminhoesPorConsumo.map(c => c.totalLitros));
        
        if (maxConsumo > 0 && !isNaN(maxConsumo)) {
    doc.setFontSize(11);
    
    // Calcular algumas métricas de tendência com validação
    const gastoPorVeiculo = (dados.totais.gasto && dados.totalCaminhoes > 0) ? 
        dados.totais.gasto / dados.totalCaminhoes : 0;
    const consumoPorVeiculo = (dados.totais.consumo && dados.totalCaminhoes > 0) ? 
        dados.totais.consumo / dados.totalCaminhoes : 0;    
    const tendencias = [
        `Gasto médio por veículo: R$ ${formatarMoeda(gastoPorVeiculo)}`,
        `Consumo médio por veículo: ${formatarMoeda(consumoPorVeiculo)} L`,
        `Custo médio por litro: R$ ${((dados.totais.gasto && dados.totais.consumo > 0) ? 
            (dados.totais.gasto / dados.totais.consumo) : 0).toFixed(2)}`,
        `Quilometragem média por veículo: R$ ${((dados.totais.distancia && dados.totalCaminhoes > 0) ? 
            (dados.totais.distancia / dados.totalCaminhoes) : 0).toFixed(2)} km`
    ];
      tendencias.forEach(tendencia => {
        doc.text(`• ${tendencia}`, 20, yPos);
        yPos += 8;
    });
    
        } // Fechar if (caminhoesPorConsumo.length > 0)
    } // Fechar if (maxConsumo > 0 && !isNaN(maxConsumo))
    
    return yPos;
}

// Página 5: Indicadores de Performance
function criarIndicadoresPdf(doc, dados, cores) {
    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('INDICADORES DE PERFORMANCE', 105, 21, { align: 'center' });
    
    let yPos = 35;
    doc.setTextColor(...cores.texto);
    
    // Matriz de performance
    doc.setFontSize(14);
    doc.text('MATRIZ DE PERFORMANCE POR VEÍCULO', 20, yPos);
    yPos += 15;
    
    // Cabeçalho da tabela
    doc.setFillColor(...cores.secundaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(10, yPos, 190, 10, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('PLACA', 15, yPos + 7);
    doc.text('CONSUMO (L)', 50, yPos + 7);
    doc.text('DISTÂNCIA (km)', 90, yPos + 7);
    doc.text('EFICIÊNCIA (km/L)', 135, yPos + 7);
    doc.text('STATUS', 175, yPos + 7);
    
    yPos += 12;
    
    // Dados dos veículos
    Object.values(dados.dadosPorCaminhao).forEach((caminhao, index) => {
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
          const eficiencia = caminhao.totalLitros > 0 ? (caminhao.totalKm / caminhao.totalLitros) : 0;
        let status = 'Normal';
        let corStatus = cores.sucesso;
        
        if (eficiencia < 3) {
            status = 'Baixa';
            corStatus = cores.alerta;
        } else if (eficiencia > 6) {
            status = 'Excelente';
            corStatus = cores.info;
        }
          // Linha da tabela
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            // Validar argumentos antes de chamar rect()
            if (!isNaN(yPos) && yPos >= 0) {
                doc.rect(10, yPos - 2, 190, 8, 'F');
            }
        }
        
        doc.setTextColor(...cores.texto);
        doc.setFontSize(9);
        doc.text(caminhao.placa, 15, yPos + 3);
        doc.text(caminhao.formatarNumero(totalLitros, 1), 55, yPos + 3);
        doc.text(caminhao.formatarNumero(totalKm, 1), 95, yPos + 3);
        doc.text(formatarMoeda(eficiencia), 145, yPos + 3);
        
        // Status colorido
        doc.setTextColor(...corStatus);
        doc.text(status, 175, yPos + 3);
        
        yPos += 8;
    });
    
    yPos += 15;
      // Alertas e recomendações
    doc.setFillColor(...cores.alerta);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(10, yPos, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('ALERTAS E RECOMENDAÇÕES', 105, yPos + 10, { align: 'center' });
    
    yPos += 25;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(11);
    
    // Gerar alertas baseados nos dados
    const alertas = [];
      // Verificar veículos com baixa eficiência
    const veiculosBaixaEficiencia = Object.values(dados.dadosPorCaminhao)
        .filter(c => c.totalLitros > 0 && (c.totalKm / c.totalLitros) < 3);
    
    if (veiculosBaixaEficiencia.length > 0) {
        alertas.push(`⚠️ ${veiculosBaixaEficiencia.length} veículo(s) com baixa eficiência precisam de atenção`);
    }
    
    // Verificar gastos elevados
    const gastoMedio = dados.totais.gasto / dados.totalCaminhoes;
    const veiculosGastoAlto = Object.values(dados.dadosPorCaminhao)
        .filter(c => c.totalGasto > gastoMedio * 1.5);
    
    if (veiculosGastoAlto.length > 0) {
        alertas.push(`💰 ${veiculosGastoAlto.length} veículo(s) com gastos acima da média`);
    }
    
    // Recomendações gerais
    alertas.push('✓ Realizar manutenção preventiva regularmente');
    alertas.push('✓ Monitorar padrões de condução dos motoristas');
    alertas.push('✓ Avaliar rotas para otimização de combustível');
    
    alertas.forEach(alerta => {
        doc.text(alerta, 20, yPos);
        yPos += 8;
    });
    
    return yPos;
}

// Página 3: Análise Detalhada por Veículo
function criarAnaliseDetalhadaPdf(doc, dados, cores) {
    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('ANÁLISE DETALHADA POR VEÍCULO', 105, 21, { align: 'center' });
    
    let yPos = 35;
    doc.setTextColor(...cores.texto);
    
    Object.values(dados.dadosPorCaminhao).forEach((caminhao, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        // Card do caminhão
        doc.setFillColor(...cores.secundaria);
        // Validar argumentos antes de chamar rect()
        if (!isNaN(yPos) && yPos >= 0) {
            doc.rect(15, yPos, 180, 8, 'F');
        }
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(`${caminhao.placa} - ${caminhao.modelo}`, 20, yPos + 6);
        
        yPos += 15;
        doc.setTextColor(...cores.texto);
        doc.setFontSize(10);
        
        // Dados do caminhão
        const consumo = caminhao.totalKm > 0 ? formatarMoeda(caminhao.totalLitros / caminhao.totalKm * 100) : 0;
        const custoPorKm = caminhao.totalKm > 0 ? formatarMoeda(caminhao.totalGasto / caminhao.totalKm) : 0;
        
        doc.text(`📊 Quilometragem Total: ${caminhao.formatarNumero(totalKm, 0)} km`, 20, yPos);
        doc.text(`⛽ Combustível Total: ${caminhao.formatarNumero(totalLitros, 0)} litros`, 110, yPos);
        yPos += 7;
        doc.text(`💰 Gasto Total: R$ ${caminhao.formatarMoeda(totalGasto)}`, 20, yPos);
        doc.text(`📈 Consumo: ${consumo} L/100km`, 110, yPos);
        yPos += 7;
        doc.text(`💵 Custo/km: R$ ${custoPorKm}`, 20, yPos);
        doc.text(`🔢 Abastecimentos: ${caminhao.abastecimentos.length}`, 110, yPos);
        
        yPos += 15;
    });
    
    return yPos;
}

// Página 4: Análise de Custos e Tendências
function criarAnaliseCustosPdf(doc, dados, cores) {
    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('ANÁLISE DE CUSTOS E TENDÊNCIAS', 105, 21, { align: 'center' });
    
    let yPos = 35;
    doc.setTextColor(...cores.texto);
    
    const totais = calcularTotaisGerais(dados.dadosPorCaminhao);
    
    // Análise Financeira
    doc.setFillColor(...cores.info);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('ANÁLISE FINANCEIRA', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    // Métricas financeiras
    doc.text(`💰 Gasto Total no Período: R$ ${totais.formatarMoeda(totalGasto)}`, 20, yPos);
    yPos += 8;
    doc.text(`💵 Custo Médio por km: R$ ${totais.formatarMoeda(custoPorKm)}`, 20, yPos);
    yPos += 8;
    doc.text(`⛽ Preço Médio do Litro: R$ ${totais.formatarMoeda(valorMedioLitro)}`, 20, yPos);
    yPos += 8;
    doc.text(`📊 Consumo Médio da Frota: ${totais.formatarMoeda(consumoMedio)} km/l`, 20, yPos);
    
    yPos += 20;
      // Projeções
    doc.setFillColor(...cores.alerta);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('PROJEÇÕES MENSAIS E ANUAIS', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    const gastoMensal = totais.totalGasto;
    const gastoAnual = gastoMensal * 12;
    const litrosMensais = totais.totalLitros;
    const litrosAnuais = litrosMensais * 12;
    
    doc.text(`📅 Projeção Mensal: R$ ${formatarMoeda(gastoMensal)} / ${formatarNumero(litrosMensais, 0)} litros`, 20, yPos);
    yPos += 8;
    doc.text(`📅 Projeção Anual: R$ ${formatarMoeda(gastoAnual)} / ${formatarNumero(litrosAnuais, 0)} litros`, 20, yPos);
    yPos += 8;
    doc.textformatarMoeda(`💡 Economia potencial com 10% de melhoria: R$ ${(gastoAnual * 0.1)}/ano`, 20, yPos);
    
    yPos += 20;
      // Ranking de Eficiência
    doc.setFillColor(...cores.sucesso);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('RANKING DE EFICIÊNCIA DOS VEÍCULOS', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(9);
    
    // Ordenar caminhões por eficiência
    const caminhoesPorEficiencia = Object.values(dados.dadosPorCaminhao)
        .filter(c => c.totalKm > 0)
        .map(c => ({
            ...c,
            consumo: c.totalLitros / c.totalKm * 100,
            custoPorKm: c.totalGasto / c.totalKm
        }))
        .sort((a, b) => a.consumo - b.consumo);
    
    caminhoesPorEficiencia.forEach((caminhao, index) => {
        const posicao = index + 1;
        const emoji = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : '📊';
        doc.text(`${emoji} ${posicao}º ${caminhao.placa} - ${caminhao.formatarNumero(consumo, 1)} L/100km - R$ ${caminhao.formatarMoeda(custoPorKm)}/km`, 20, yPos);
        yPos += 6;
    });
    
    return yPos;
}

// Página 6: Análise Preditiva
function criarAnalisePreditivaPdf(doc, dados, cores) {
    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('ANÁLISE PREDITIVA E PROJEÇÕES', 105, 21, { align: 'center' });
    
    let yPos = 35;
    doc.setTextColor(...cores.texto);
    
    const totais = calcularTotaisGerais(dados.dadosPorCaminhao);
    
    // Projeções Financeiras
    doc.setFillColor(...cores.info);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('PROJEÇÕES FINANCEIRAS FUTURAS', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    const gastoMensal = totais.totalGasto;
    const projecao3Meses = gastoMensal * 3;
    const projecao6Meses = gastoMensal * 6;
    const projecaoAnual = gastoMensal * 12;
    
    doc.text(`📈 Projeção 3 meses: R$ ${formatarMoeda(projecao3Meses)}`, 20, yPos);
    yPos += 8;
    doc.text(`📈 Projeção 6 meses: R$ ${formatarMoeda(projecao6Meses)}`, 20, yPos);
    yPos += 8;
    doc.text(`📈 Projeção 12 meses: R$ ${formatarMoeda(projecaoAnual)}`, 20, yPos);
    
    yPos += 20;
      // Cenários de Otimização
    doc.setFillColor(...cores.sucesso);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('CENÁRIOS DE OTIMIZAÇÃO', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    const economia5 = projecaoAnual * 0.05;
    const economia10 = projecaoAnual * 0.10;
    const economia15 = projecaoAnual * 0.15;
    
    doc.text(`🎯 Melhoria 5% (treinamento): Economia de R$ ${formatarMoeda(economia5)}/ano`, 20, yPos);
    yPos += 8;
    doc.text(`🎯 Melhoria 10% (manutenção): Economia de R$ ${formatarMoeda(economia10)}/ano`, 20, yPos);
    yPos += 8;
    doc.text(`🎯 Melhoria 15% (renovação): Economia de R$ ${formatarMoeda(economia15)}/ano`, 20, yPos);
    
    yPos += 20;
      // Cálculos de ROI
    doc.setFillColor(...cores.alerta);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('CÁLCULOS DE ROI PARA MELHORIAS', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    const investimentoTreinamento = 5000;
    const investimentoManutencao = 15000;
    const investimentoRenovacao = 100000;
    
    const roiTreinamento = formatarNumero(economia5 / investimentoTreinamento * 100, 1);
    const roiManutencao = formatarNumero(economia10 / investimentoManutencao * 100, 1);
    const roiRenovacao = formatarNumero(economia15 / investimentoRenovacao * 100, 1);
    
    doc.text(`💡 Treinamento (R$ ${investimentoTreinamento}): ROI ${roiTreinamento}% ao ano`, 20, yPos);
    yPos += 8;
    doc.text(`🔧 Manutenção (R$ ${investimentoManutencao}): ROI ${roiManutencao}% ao ano`, 20, yPos);
    yPos += 8;
    doc.text(`🚛 Renovação (R$ ${investimentoRenovacao}): ROI ${roiRenovacao}% ao ano`, 20, yPos);
    
    return yPos + 20;
}

// Página 7: Dados Detalhados
function criarDadosDetalhadosPdf(doc, dados, cores) {
    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('DADOS DETALHADOS DE ABASTECIMENTOS', 105, 21, { align: 'center' });
    
    let yPos = 35;
    
    // Preparar dados para tabela
    const abastecimentos = dados.abastecimentosFiltrados.slice(0, 20); // Limitar a 20 registros mais recentes
    
    const cabecalhos = ['Data', 'Veículo', 'Litros', 'Valor', 'Posto'];
    const dadosTabela = abastecimentos.map(a => {
        const caminhao = dados.caminhoes.find(c => c.id === a.caminhaoId);
        return [
            new Date(a.data).toLocaleDateString('pt-BR'),
            caminhao ? caminhao.placa : 'N/A',
            `${a.formatarNumero(litros, 1)}L`,
            `R$ ${a.formatarMoeda(valorTotal)}`,
            a.posto || 'N/A'
        ];
    });
    
    // Criar tabela
    doc.autoTable({
        head: [cabecalhos],
        body: dadosTabela,
        startY: yPos,
        styles: { 
            fontSize: 9, 
            cellPadding: 3,
            textColor: cores.texto 
        },
        headStyles: { 
            fillColor: cores.primaria, 
            textColor: [255, 255, 255],
            fontSize: 10 
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { left: 15, right: 15 }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    
    // Resumo da tabela
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    doc.text(`📊 Exibindo ${abastecimentos.length} de ${dados.abastecimentosFiltrados.length} registros`, 20, yPos);
    if (dados.abastecimentosFiltrados.length > 20) {
        yPos += 8;
        doc.text(`ℹ️ Para ver todos os registros, acesse o sistema online`, 20, yPos);
    }
    
    return yPos + 10;
}

// Página 8: Simulador de Cenários
function criarSimuladorCenariosPdf(doc, dados, cores) {
    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('SIMULADOR DE CENÁRIOS DE MELHORIA', 105, 21, { align: 'center' });
    
    let yPos = 35;
    doc.setTextColor(...cores.texto);
    
    const totais = calcularTotaisGerais(dados.dadosPorCaminhao);
    
    // Cenário Atual
    doc.setFillColor(...cores.cinza);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('CENÁRIO ATUAL', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    doc.text(`💰 Gasto Mensal: R$ ${totais.formatarMoeda(totalGasto)}`, 20, yPos);
    doc.text(`⛽ Consumo Médio: ${totais.formatarMoeda(consumoMedio)} km/l`, 110, yPos);
    yPos += 8;
    doc.text(`🛣️ Distância: ${totais.formatarNumero(totalDistancia, 0)} km`, 20, yPos);
    doc.text(`💵 Custo/km: R$ ${totais.formatarMoeda(custoPorKm)}`, 110, yPos);
    
    yPos += 20;
      // Cenário com Treinamento
    doc.setFillColor(...cores.info);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('CENÁRIO: TREINAMENTO DE CONDUTORES (+5% eficiência)', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    const consumoTreinamento = totais.consumoMedio * 1.05;
    const gastoTreinamento = totais.totalGasto * 0.95;
    const economiaLitros = totais.totalLitros * 0.05;
    const economiaReais = totais.totalGasto * 0.05;
    
    doc.text(`💰 Novo Gasto: R$ ${formatarMoeda(gastoTreinamento)} (${formatarMoeda(economiaReais)} economia)`, 20, yPos);
    yPos += 8;
    doc.text(`⛽ Novo Consumo: ${formatarMoeda(consumoTreinamento)} km/l`, 20, yPos);
    yPos += 8;
    doc.text(`📉 Economia: ${formatarNumero(economiaLitros, 0)} litros/mês`, 20, yPos);
    
    yPos += 20;
      // Cenário com Manutenção
    doc.setFillColor(...cores.sucesso);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('CENÁRIO: MANUTENÇÃO PREVENTIVA (+10% eficiência)', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    const consumoManutencao = totais.consumoMedio * 1.10;
    const gastoManutencao = totais.totalGasto * 0.90;
    const economiaLitrosManutencao = totais.totalLitros * 0.10;
    const economiaReaisManutencao = totais.totalGasto * 0.10;
    
    doc.text(`💰 Novo Gasto: R$ ${formatarMoeda(gastoManutencao)} (${formatarMoeda(economiaReaisManutencao)} economia)`, 20, yPos);
    yPos += 8;
    doc.text(`⛽ Novo Consumo: ${formatarMoeda(consumoManutencao)} km/l`, 20, yPos);
    yPos += 8;
    doc.text(`📉 Economia: ${formatarNumero(economiaLitrosManutencao, 0)} litros/mês`, 20, yPos);
    
    yPos += 20;
      // Cenário com Renovação
    doc.setFillColor(...cores.alerta);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('CENÁRIO: RENOVAÇÃO DA FROTA (+15% eficiência)', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    const consumoRenovacao = totais.consumoMedio * 1.15;
    const gastoRenovacao = totais.totalGasto * 0.85;
    const economiaLitrosRenovacao = totais.totalLitros * 0.15;
    const economiaReaisRenovacao = totais.totalGasto * 0.15;
    
    doc.text(`💰 Novo Gasto: R$ ${formatarMoeda(gastoRenovacao)} (${formatarMoeda(economiaReaisRenovacao)} economia)`, 20, yPos);
    yPos += 8;
    doc.text(`⛽ Novo Consumo: ${formatarMoeda(consumoRenovacao)} km/l`, 20, yPos);
    yPos += 8;
    doc.text(`📉 Economia: ${formatarNumero(economiaLitrosRenovacao, 0)} litros/mês`, 20, yPos);
    
    return yPos + 20;
}

// Página 9: Manutenção Preventiva
function criarManutencaoPreventivaPdf(doc, dados, cores) {
    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('MANUTENÇÃO PREVENTIVA E ALERTAS', 105, 21, { align: 'center' });
    
    let yPos = 35;
    doc.setTextColor(...cores.texto);
    
    // Alertas por Veículo
    doc.setFillColor(...cores.perigo);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('ALERTAS POR VEÍCULO', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    Object.values(dados.dadosPorCaminhao).forEach(caminhao => {
        const consumo = caminhao.totalKm > 0 ? (caminhao.totalLitros / caminhao.totalKm * 100) : 0;
        let status = '🟢 Bom';
        let cor = cores.sucesso;
        
        if (consumo > 15) {
            status = '🔴 Crítico - Revisar urgente';
            cor = cores.perigo;
        } else if (consumo > 12) {
            status = '🟡 Médio - Monitorar';
            cor = cores.alerta;
        }
          doc.setFillColor(...cor);
        // Validar argumentos antes de chamar rect()
        if (!isNaN(yPos) && yPos >= 0) {
            doc.rect(20, yPos, 160, 6, 'F');
        }
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(`${caminhao.placa}: ${status} (${formatarNumero(consumo, 1)} L/100km)`, 25, yPos + 4);
        yPos += 10;
    });
    
    yPos += 10;
      // Cronograma Sugerido
    doc.setFillColor(...cores.info);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('CRONOGRAMA SUGERIDO DE MANUTENÇÕES', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    const proximaManutencao = new Date();
    proximaManutencao.setDate(proximaManutencao.getDate() + 30);
    
    doc.text(`🔧 Próxima Revisão Geral: ${proximaManutencao.toLocaleDateString('pt-BR')}`, 20, yPos);
    yPos += 8;
    doc.text(`🛢️ Troca de Óleo: A cada 10.000 km ou 6 meses`, 20, yPos);
    yPos += 8;
    doc.text(`🔍 Inspeção de Filtros: A cada 5.000 km ou 3 meses`, 20, yPos);
    yPos += 8;
    doc.text(`⚙️ Verificação de Pneus: Semanal`, 20, yPos);
    yPos += 8;
    doc.text(`📊 Análise de Consumo: Mensal`, 20, yPos);
    
    yPos += 20;
      // Recomendações Gerais
    doc.setFillColor(...cores.sucesso);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('RECOMENDAÇÕES GERAIS', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    doc.text(`✅ Implementar sistema de telemetria para monitoramento em tempo real`, 20, yPos);
    yPos += 8;
    doc.text(`✅ Treinar condutores em direção econômica`, 20, yPos);
    yPos += 8;
    doc.text(`✅ Estabelecer metas de consumo por veículo`, 20, yPos);
    yPos += 8;
    doc.text(`✅ Revisar rotas para otimização de combustível`, 20, yPos);
    yPos += 8;
    doc.text(`✅ Manter registros detalhados de manutenção`, 20, yPos);
    
    return yPos + 20;
}

// Funções auxiliares adicionais
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        return dateString;
    }
}

function calcularTotaisGerais(dadosPorCaminhao) {
    const valores = Object.values(dadosPorCaminhao);
    
    const totais = {
        totalKm: valores.reduce((sum, d) => sum + (d.totalKm || 0), 0),
        totalLitros: valores.reduce((sum, d) => sum + (d.totalLitros || 0), 0),
        totalGasto: valores.reduce((sum, d) => sum + (d.totalGasto || 0), 0),
        totalAbastecimentos: valores.reduce((sum, d) => sum + (d.abastecimentos?.length || 0), 0),
        quantidadeCaminhoes: valores.length
    };

    // Calcular métricas derivadas
    totais.consumoMedio = totais.totalKm > 0 ? (totais.totalLitros / totais.totalKm) : 0;
    totais.custoPorKm = totais.totalKm > 0 ? (totais.totalGasto / totais.totalKm) : 0;
    totais.valorMedioLitro = totais.totalLitros > 0 ? (totais.totalGasto / totais.totalLitros) : 0;
    
    // Manter compatibilidade com nomes antigos
    totais.mediaConsumoGeral = totais.consumoMedio;
    totais.custoMedioGeral = totais.custoPorKm;
    totais.valorMedioLitroGeral = totais.valorMedioLitro;
    
    return totais;
}

function calcularDiasPeriodo(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim - inicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function calcularVariacaoConsumo(dadosPorCaminhao) {
    const consumos = Object.values(dadosPorCaminhao)
        .filter(c => c.totalKm > 0)
        .map(c => c.totalLitros / c.totalKm * 100);
    
    if (consumos.length < 2) return 0;
    
    const min = Math.min(...consumos);
    const max = Math.max(...consumos);
    return ((max - min) / min * 100);
}
