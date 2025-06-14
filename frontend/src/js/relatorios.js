// Funcoes auxiliares para formatacao segura de numeros
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

// Função para formatar quilometragem (sem decimais desnecessários)
function formatarQuilometragem(valor) {
    const numero = garantirNumero(valor, 0);
    return Math.round(numero).toLocaleString('pt-BR');
}

// Função para formatar litros (apenas 1 casa decimal quando necessário, sem .00)
function formatarLitros(valor) {
    const numero = garantirNumero(valor, 0);
    // Se for número inteiro, retorna sem decimais
    if (numero % 1 === 0) {
        return Math.round(numero).toString();
    }
    // Caso contrário, retorna com 1 casa decimal
    return numero.toFixed(1);
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

// Funcao para acessar campos independente do formato (snake_case ou camelCase)
function getField(obj, snakeCase, camelCase) {
    return obj[snakeCase] !== undefined ? obj[snakeCase] : obj[camelCase];
}

// Funcao para acessar campos numericos independente do formato (snake_case ou camelCase)
function getNumField(obj, snakeCase, camelCase, defaultValue = 0) {
    const value = obj[snakeCase] !== undefined ? obj[snakeCase] : obj[camelCase];
    return parseFloat(value || defaultValue);
}

// Gerar relatorio de consumo - VERSAO CORRIGIDA
async function gerarRelatorioConsumo() {
    console.log('Iniciando geracao de relatorio de consumo...');
    
    // Mostrar alerta de loading do sistema para relatórios importantes
    AlertInfo.loadingSystem('Gerando Relatório de Consumo', 'Processando dados de caminhões e abastecimentos para gerar análises detalhadas de consumo e eficiência.');
    
    // Mostrar loading enquanto processa
    const resultadosElement = document.getElementById('relatorioResultados');
    if (!resultadosElement) {
        console.error('Elemento relatorioResultados nao encontrado!');
        AlertUtils.close(); // Fechar loading
        AlertError.show('Erro do Sistema', 'Elemento de exibicao do relatorio nao encontrado.');
        return;
    }
    
    resultadosElement.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Gerando relatório de consumo...</p></div>';
    
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
            formatarNumero(dadosCaminhao.totalKm / dadosCaminhao.totalLitros, 1) : 'N/A';
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
                <td>${formatarNumero(dados.totalLitros, 1)}</td>
                <td>${dados.mediaConsumo}</td>
                <td>R$ ${formatarMoeda(dados.totalGasto)}</td>
                <td>R$ ${dados.custoMedio}</td>
            </tr>
        `;
    });
      // Adicionar linha de totais
    const consumoMedioGeral = totalConsumo > 0 ? formatarNumero(totalDistancia / totalConsumo, 1) : 'N/A';
    const custoPorKmGeral = totalDistancia > 0 ? formatarMoeda(totalGasto / totalDistancia) : 'N/A';
    
    html += `        <tr class="table-success fw-bold">
            <td>TOTAL GERAL</td>
            <td>${totalDistancia.toLocaleString('pt-BR')}</td>
            <td>${formatarNumero(totalConsumo, 1)}</td>
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
    
    if (Object.keys(dadosPorCaminhao).length === 1) {
        // Se for apenas um caminhão, mostrar gráfico de evolução do consumo
        const dadosCaminhao = Object.values(dadosPorCaminhao)[0];
        
        html += `
            <div class="mb-4">
                <h5>Evolução do Consumo - ${dadosCaminhao.placa}</h5>
                <div style="height: 300px;">
                    <canvas id="graficoEvolucaoConsumo"></canvas>
                </div>
            </div>
        `;
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
    
    // Mostrar alerta de loading do sistema para relatórios de custos
    AlertInfo.loadingSystem('Gerando Relatório de Custos', 'Processando dados financeiros e calculando custos operacionais detalhados por período.');
    
    // Spinner de carregamento
    const resultadosElement = document.getElementById('relatorioResultados');
    if (!resultadosElement) {
        console.error('❌ Elemento relatorioResultados não encontrado!');
        AlertUtils.close(); // Fechar loading
        AlertError.show('Erro do Sistema', 'Elemento de exibição do relatorio não encontrado.');
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
        d.mediaConsumo = d.totalLitros > 0 ? formatarNumero(d.totalKm / d.totalLitros, 1) : 'N/A';
        d.custoMedio = d.totalKm > 0 ? formatarMoeda(d.totalGasto / d.totalKm) : 'N/A';
        d.valorMedioLitro = d.totalLitros > 0 ? formatarMoeda(d.totalGasto / d.totalLitros) : 'N/A';
        totalLitrosGeral += d.totalLitros;
        totalGastoGeral += d.totalGasto;
        totalKmGeral += d.totalKm;
    });
    const consumoMedioGeral = totalLitrosGeral > 0 ? formatarNumero(totalKmGeral / totalLitrosGeral, 1) : 'N/A';
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
                <td>${formatarNumero(d.totalLitros, 1)}</td>
                <td>R$ ${formatarMoeda(d.totalGasto)}</td>
                <td>${formatarQuilometragem(d.totalKm)}</td>
                <td>R$ ${d.valorMedioLitro}</td>
                <td>${d.mediaConsumo} km/l</td>
                <td>R$ ${d.custoMedio}</td>
            </tr>
        `;
    });
    html += `            <tr class="table-success fw-bold">
                <td>TOTAL GERAL</td>
                <td>${formatarLitros(totalLitrosGeral)}</td>
                <td>R$ ${formatarMoeda(totalGastoGeral)}</td>
                <td>${formatarQuilometragem(totalKmGeral)}</td>
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

// Gerar relatório de despesas
async function gerarRelatorioDespesas() {
    console.log('📝 Iniciando geração de relatório de despesas...');
    // Mostrar loading
    AlertInfo.loadingSystem('Gerando Relatório de Despesas', 'Processando dados de despesas para gerar análises detalhadas de despesas.');
    const resultadosElement = document.getElementById('relatorioResultados');
    if (!resultadosElement) {
        console.error('❌ Elemento relatorioResultados não encontrado!');
        AlertUtils.close();
        AlertError.show('Erro do Sistema', 'Elemento de exibição do relatório não encontrado.');
        return;
    }
    resultadosElement.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Gerando relatório de despesas...</p></div>';
    // Capturar período
    const dataInicio = document.getElementById('despesasDataInicio').value;
    const dataFim = document.getElementById('despesasDataFim').value;
    if (!dataInicio || !dataFim) {
        AlertUtils.close();
        AlertError.validation('Por favor, selecione o período para o relatório.');
        return;
    }
    // Acessar dados
    const despesasDados = window.despesas || [];
    // Filtrar por período
    const despesasFiltradas = despesasDados.filter(d => {
        const dData = d.data.split('T')[0];
        return dData >= dataInicio && dData <= dataFim;
    }).sort((a, b) => new Date(a.data) - new Date(b.data));
    // Montar HTML
    let html = `
        <h4 class="mb-3">Relatório de Despesas - ${formatDate(dataInicio)} a ${formatDate(dataFim)}</h4>
        <div class="table-responsive mb-4">
            <table class="table table-striped table-bordered">
                <thead class="table-primary">
                    <tr>
                        <th>Data</th>
                        <th>Fornecedor</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Valor (R$)</th>
                    </tr>
                </thead>
                <tbody>`;
    let totalValor = 0;
    despesasFiltradas.forEach(d => {
        const valor = garantirNumero(d.valor, 0);
        totalValor += valor;
        html += `
                    <tr>
                        <td>${formatDate(d.data)}</td>
                        <td>${d.fornecedor}</td>
                        <td>${d.descricao}</td>
                        <td><span class="badge bg-secondary">${d.categoria}</span></td>
                        <td class="fw-bold text-primary">R$ ${formatarMoeda(valor)}</td>
                    </tr>`;
    });
    html += `
                    <tr class="table-success fw-bold">
                        <td colspan="4">TOTAL GERAL</td>
                        <td>R$ ${formatarMoeda(totalValor)}</td>
                    </tr>
                </tbody>
            </table>
        </div>`;
    resultadosElement.innerHTML = html;
    // Fechar loading
    AlertUtils.close();
    // Toast de resultado
    const totalRegistros = despesasFiltradas.length;
    if (totalRegistros > 0) {
        AlertToast.success(`Relatório de despesas gerado com sucesso! (${totalRegistros} ${totalRegistros === 1 ? 'despesa' : 'despesas'})`);
    } else {
        AlertWarning.noData('Nenhuma despesa encontrada para o período selecionado.');
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
        
        // 4. Criar planilha de Analise de Custos
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
                distancia: totalDistancia,
                totalGasto: totalGasto,
                totalLitros: totalConsumo,
                totalKm: totalDistancia,
                totalAbastecimentos: totalAbastecimentos,
                quantidadeCaminhoes: totalCaminhoes
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
        ['Total de Caminhoes', Object.keys(dados.dadosPorCaminhao).length, 'veiculos'],
        ['Distancia Total', totais.totalKm.toLocaleString('pt-BR'), 'km'],
        ['Combustível Total', formatarLitros(totais.totalLitros), 'litros'],
        ['Gasto Total', `R$ ${formatarMoeda(totais.totalGasto)}`, 'reais'],
        ['Consumo Médio Geral', formatarNumero(totais.consumoMedio, 2), 'km/l'],
        ['Custo por Quilômetro', `R$ ${formatarMoeda(totais.custoPorKm)}`, 'reais/km'],
        ['Valor Médio do Litro', `R$ ${formatarMoeda(totais.valorMedioLitro)}`, 'reais/litro'],
        [''],
        ['RANKING DE EFICIENCIA'],
        [''],
        ['Posição', 'Caminhão', 'Consumo (km/l)', 'Custo/km (R$)', 'Status']
    ], { origin: 'A1' });
    
    // Ranking de eficiencia
    const ranking = Object.values(dados.dadosPorCaminhao)
        .sort((a, b) => b.mediaConsumo - a.mediaConsumo)
        .slice(0, 10);
    
    let linha = 20;
    ranking.forEach((caminhao, index) => {
        const status = caminhao.mediaConsumo >= totais.consumoMedio ? 'Eficiente' : 'Atenção';
        XLSX.utils.sheet_add_aoa(ws, [
            [index + 1, `${caminhao.placa} - ${caminhao.modelo}`, 
             formatarNumero(caminhao.mediaConsumo, 2), `R$ ${formatarMoeda(caminhao.custoMedio)}`, status]
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
        ['Caminhao', 'Placa', 'Modelo', 'Distancia (km)', 'Combustivel (L)', 
         'Gasto Total (R$)', 'Consumo (km/l)', 'Custo/km (R$)', 'Valor/L (R$)', 'Abastecimentos']
    ], { origin: 'A1' });
    
    // Dados dos caminhões
    let linha = 4;
    Object.values(dados.dadosPorCaminhao).forEach(caminhao => {
        XLSX.utils.sheet_add_aoa(ws, [
            [caminhao.placa, caminhao.placa, caminhao.modelo, 
             formatarQuilometragem(caminhao.totalKm), formatarLitros(caminhao.totalLitros),
             formatarMoeda(caminhao.totalGasto), formatarNumero(caminhao.mediaConsumo, 2),
             formatarMoeda(caminhao.custoMedio), formatarMoeda(caminhao.valorMedioLitro),
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
         'Distancia', 'Litros', 'Valor Total', 'Valor/L', 'Consumo (km/l)']
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
             abast.motorista, formatarQuilometragem(abast.kmInicial), formatarQuilometragem(abast.kmFinal), formatarQuilometragem(distancia),
             formatarLitros(abast.litros), formatarMoeda(abast.valorTotal), 
             formatarMoeda(valorPorLitro), formatarNumero(consumo, 2)]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    XLSX.utils.book_append_sheet(wb, ws, 'Dados Detalhados');
}

// Criar planilha de Analise de Custos
function criarPlanilhaAnaliseCustos(wb, dados) {
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // Analise por periodo (agrupamento por mes)
    const analiseTemporalData = criarAnaliseTemporalData(dados.abastecimentos);
    
    XLSX.utils.sheet_add_aoa(ws, [
        ['ANALISE DE CUSTOS POR PERIODO'],
        [''],
        ['Mes/Ano', 'Abastecimentos', 'Distancia (km)', 'Combustivel (L)', 
         'Gasto Total (R$)', 'Consumo Médio (km/l)', 'Custo/km (R$)']
    ], { origin: 'A1' });
    
    let linha = 4;
    analiseTemporalData.forEach(periodo => {
        XLSX.utils.sheet_add_aoa(ws, [
            [periodo.periodo, periodo.abastecimentos, formatarQuilometragem(periodo.distancia),
             formatarLitros(periodo.combustivel), formatarMoeda(periodo.gasto),
             formatarNumero(periodo.consumoMedio, 2), formatarMoeda(periodo.custoPorKm)]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    // Analise de variacao de precos
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
            [formatDate(preco.data), formatarMoeda(preco.valorLitro), 
             formatarMoeda(preco.variacao), preco.tendencia]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    XLSX.utils.book_append_sheet(wb, ws, 'Analise de Custos');
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
        ['Consumo Médio Geral (km/l)', formatarNumero(totais.consumoMedio, 2), '12.0', 
         totais.consumoMedio >= 12 ? 'OK' : 'Atenção', 
         totais.consumoMedio >= 12 ? 'Dentro da meta' : 'Abaixo da meta recomendada'],
        ['Custo por Quilômetro (R$/km)', formatarMoeda(totais.custoPorKm), '0.60',
         totais.custoPorKm <= 0.6 ? 'OK' : 'Atenção',
         totais.custoPorKm <= 0.6 ? 'Custo controlado' : 'Custo elevado'],
        ['Variacao Consumo Entre Veiculos (%)', 
         formatarNumero(calcularVariacaoConsumo(dados.dadosPorCaminhao), 1), '15.0',
         calcularVariacaoConsumo(dados.dadosPorCaminhao) <= 15 ? 'OK' : 'Atenção',
         'Quanto menor, mais homogênea a frota'],
        [''],
        ['ANALISE DETALHADA POR VEICULO'],
        [''],
        ['Veiculo', 'Consumo (km/l)', 'Vs. Media Geral', 'Custo/km (R$)', 'Classificacao']
    ], { origin: 'A1' });
    
    let linha = 12;
    Object.values(dados.dadosPorCaminhao).forEach(caminhao => {
        const variacaoConsumo = ((caminhao.mediaConsumo - totais.consumoMedio) / totais.consumoMedio * 100);
        const classificacao = caminhao.mediaConsumo >= totais.consumoMedio ? 'Eficiente' : 'Ineficiente';
        
        XLSX.utils.sheet_add_aoa(ws, [
            [`${caminhao.placa} - ${caminhao.modelo}`, 
             formatarNumero(caminhao.mediaConsumo, 2),
             `${variacaoConsumo > 0 ? '+' : ''}${formatarNumero(variacaoConsumo, 1)}%`,
             `R$ ${formatarMoeda(caminhao.custoMedio)}`,
             classificacao]
        ], { origin: `A${linha}` });
        linha++;
    });
    
    XLSX.utils.book_append_sheet(wb, ws, 'Indicadores KPI');
}

// ================== NOVA FUNÇÃO PDF COMPLETO ==================

// Nova funcao para exportar PDF completo com todos os dados e analises
async function exportarPdfCompleto() {
    console.log('🚀 Iniciando geração de PDF de consumo...');
    
    try {
        // Capturar dados do formulário
        const dataInicio = document.getElementById('dataInicio')?.value;
        const dataFim = document.getElementById('dataFim')?.value;
        const caminhaoId = document.getElementById('caminhaoSelect')?.value || 'todos';

        // Validar se as datas estão preenchidas
        if (!dataInicio || !dataFim) {
            AlertError.validation('Por favor, selecione o período para gerar o relatório de consumo.');
            return;
        }

        // Processar dados de consumo igual à função gerarRelatorioCustos
        const dadosCaminhoes = window.caminhoes || [];
        let dadosAbastecimentos = window.abastecimentos || [];
        
        console.log('📊 Dados disponíveis para PDF de consumo:', {
            caminhoes: dadosCaminhoes.length,
            abastecimentos: dadosAbastecimentos.length,
            periodo: { inicio: dataInicio, fim: dataFim },
            caminhaoSelecionado: caminhaoId
        });
        
        // Verificar se há dados básicos
        if (dadosCaminhoes.length === 0) {
            console.error('❌ Não há caminhões cadastrados');
            AlertError.show(
                'Dados Insuficientes',
                'Não há caminhões cadastrados. Por favor, cadastre pelo menos um caminhão.'
            );
            return;
        }
        
        if (dadosAbastecimentos.length === 0) {
            console.error('❌ Não há abastecimentos cadastrados');
            AlertError.show(
                'Dados Insuficientes', 
                'Não há abastecimentos cadastrados. Por favor, registre pelo menos um abastecimento.'
            );
            return;
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

        // Filtrar por data
        let filtrados = dadosAbastecimentos.filter(a => {
            const dia = a.data.split('T')[0];
            return dia >= dataInicio && dia <= dataFim;
        });
        
        // Filtrar por caminhão
        if (caminhaoId !== 'todos') {
            filtrados = filtrados.filter(a => a.caminhaoId === caminhaoId);
        }
        
        if (filtrados.length === 0) {
            console.warn('⚠️ Nenhum abastecimento encontrado no período');
            AlertWarning.noData('Nenhum abastecimento foi encontrado no período selecionado.');
            return;
        }

        // Agrupar dados por caminhão com foco no consumo
        const dadosPorCaminhao = {};
        filtrados.forEach(a => {
            if (!dadosPorCaminhao[a.caminhaoId]) {
                const c = dadosCaminhoes.find(c => c.id === a.caminhaoId) || {};
                dadosPorCaminhao[a.caminhaoId] = {
                    placa: c.placa || 'Desconhecido',
                    modelo: c.modelo || 'Desconhecido',
                    totalLitros: 0,
                    totalGasto: 0,
                    totalKm: 0,
                    abastecimentos: 0
                };
            }
            const entry = dadosPorCaminhao[a.caminhaoId];
            const dist = a.kmFinal - a.kmInicial;
            entry.totalLitros += a.litros;
            entry.totalGasto += a.valorTotal;
            entry.totalKm += dist;
            entry.abastecimentos += 1;
        });

        // Calcular métricas de consumo
        let totalLitrosGeral = 0, totalGastoGeral = 0, totalKmGeral = 0;
        Object.values(dadosPorCaminhao).forEach(d => {
            d.mediaConsumo = d.totalLitros > 0 ? (d.totalKm / d.totalLitros) : 0;
            d.consumoPor100Km = d.totalKm > 0 ? (d.totalLitros / d.totalKm * 100) : 0;
            d.eficienciaMedia = d.mediaConsumo;
            d.custoMedio = d.totalKm > 0 ? (d.totalGasto / d.totalKm) : 0;
            d.valorMedioLitro = d.totalLitros > 0 ? (d.totalGasto / d.totalLitros) : 0;
            totalLitrosGeral += d.totalLitros;
            totalGastoGeral += d.totalGasto;
            totalKmGeral += d.totalKm;
        });
        const consumoMedioGeral = totalLitrosGeral > 0 ? formatarNumero(totalKmGeral / totalLitrosGeral, 2) : 'N/A';
        const consumoPor100KmGeral = totalKmGeral > 0 ? formatarNumero(totalLitrosGeral / totalKmGeral * 100, 2) : 'N/A';

        // Criar PDF profissional usando o mesmo estilo de custos
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurar esquema de cores profissional (Excel-like) - IGUAL AO RELATÓRIO DE CUSTOS
        const cores = {
            azulEscuro: [23, 55, 94],       // Cabeçalho principal
            azulMedio: [54, 96, 146],       // Seções secundárias
            azulClaro: [79, 129, 189],      // Destaque
            cinzaEscuro: [68, 68, 68],      // Texto principal
            cinzaMedio: [128, 128, 128],    // Texto secundário
            cinzaClaro: [217, 217, 217],    // Bordas
            brancoGelo: [248, 248, 248],    // Fundo alternado
            verde: [70, 136, 71],           // Valores positivos
            laranja: [237, 125, 49],        // Alertas
            vermelho: [192, 80, 77],        // Valores críticos
            branco: [255, 255, 255]
        };

        let yPos = 15;

        // === CABEÇALHO PRINCIPAL ESTILO EXCEL ===
        // Fundo gradiente principal
        doc.setFillColor(...cores.azulEscuro);
        doc.rect(10, 10, 190, 25, 'F');
        
        // Borda superior elegante
        doc.setDrawColor(...cores.azulClaro);
        doc.setLineWidth(0.8);
        doc.line(10, 10, 200, 10);
        
        // Título principal
        doc.setTextColor(...cores.branco);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        adicionarTextoPDF(doc, 'RELATÓRIO DE CUSTOS OPERACIONAIS', 105, 20, { align: 'center' });
        
        // Subtítulo
        doc.setFontSize(11);
        adicionarTextoPDF(doc, 'Sistema de Controle de Combustível', 105, 28, { align: 'center' });
        
        yPos = 45;

        // === INFORMAÇÕES DO PERÍODO (STYLE EXCEL HEADER) ===
        doc.setFillColor(...cores.azulMedio);
        doc.rect(15, yPos, 180, 12, 'F');
        doc.setDrawColor(...cores.cinzaClaro);
        doc.setLineWidth(0.3);
        doc.rect(15, yPos, 180, 12, 'S');
        
        doc.setTextColor(...cores.branco);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        adicionarTextoPDF(doc, `Período: ${formatDate(dataInicio)} até ${formatDate(dataFim)}`, 20, yPos + 7);
        
        const dataGeracao = new Date().toLocaleString('pt-BR');
        adicionarTextoPDF(doc, `Relatório gerado em: ${dataGeracao}`, 120, yPos + 7, { align: 'left' });
        
        yPos += 20;        // === DASHBOARD DE MÉTRICAS PRINCIPAIS ===
        // Container do dashboard com altura dinâmica
        // Calculamos a altura necessária com base no número de categorias (cada categoria ocupa 7 pontos)
        const categoriasPorTotal = {};
        despesasFiltradas.forEach(d => {
            if (!categoriasPorTotal[d.categoria]) {
                categoriasPorTotal[d.categoria] = 0;
            }
            categoriasPorTotal[d.categoria] += garantirNumero(d.valor, 0);
        });
        
        const categoriasOrdenadas = Object.entries(categoriasPorTotal)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
            
        // Altura base (título + informações básicas) + altura por categoria
        const alturaResumo = 40 + (categoriasOrdenadas.length * 7);
        
        doc.setFillColor(...cores.brancoGelo);
        doc.rect(15, yPos, 180, alturaResumo, 'F');
        doc.setDrawColor(...cores.cinzaClaro);
        doc.setLineWidth(0.5);
        doc.rect(15, yPos, 180, alturaResumo, 'S');
        
        // Título da seção
        doc.setFillColor(...cores.verde);
        doc.rect(15, yPos, 180, 8, 'F');
        doc.setTextColor(...cores.branco);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        adicionarTextoPDF(doc, 'RESUMO EXECUTIVO', 105, yPos + 5, { align: 'center' });
        
        yPos += 12;
        
        // Informações resumidas
        doc.setTextColor(...cores.cinzaEscuro);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        adicionarTextoPDF(doc, `Total de Despesas: R$ ${formatarMoeda(totalValor)}`, 20, yPos + 6);
        adicionarTextoPDF(doc, `Quantidade de Registros: ${despesasFiltradas.length}`, 20, yPos + 14);
        
        if (categoriasOrdenadas.length > 0) {
            adicionarTextoPDF(doc, `Categorias Principais:`, 120, yPos + 6, { align: 'left' });
            
            categoriasOrdenadas.forEach((cat, idx) => {
                const porcentagem = Math.round((cat[1] / totalValor) * 100);
                adicionarTextoPDF(doc, `${cat[0]}: R$ ${formatarMoeda(cat[1])} (${porcentagem}%)`, 120, yPos + 14 + (idx * 7), { align: 'left' });
            });        }
        
        // Ajustar a posição vertical com base na altura real utilizada
        // A posição atual mais a altura base mais um espaço para cada categoria
        yPos += alturaResumo + 5; // 5 pontos adicionais de espaçamento

        // === TABELA PRINCIPAL ESTILO EXCEL AVANÇADO ===
        // Cabeçalho da tabela com estilo Excel
        doc.setFillColor(...cores.azulEscuro);
        doc.rect(15, yPos, 180, 10, 'F');
        doc.setTextColor(...cores.branco);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        adicionarTextoPDF(doc, 'DETALHAMENTO DAS DESPESAS', 105, yPos + 6, { align: 'center' });
        
        yPos += 12;
        
        // Tabela de despesas
        const cabecalho = [
            { header: 'Data', dataKey: 'data' },
            { header: 'Fornecedor', dataKey: 'fornecedor' },
            { header: 'Descrição', dataKey: 'descricao' },
            { header: 'Categoria', dataKey: 'categoria' },
            { header: 'Valor (R$)', dataKey: 'valor' }
        ];
          const dados = despesasFiltradas.map(d => ({
            data: formatDate(d.data),
            fornecedor: d.fornecedor || '',
            descricao: d.descricao || '',
            categoria: d.categoria || 'Geral',
            valor: `R$ ${formatarMoeda(garantirNumero(d.valor, 0))}`
        }));
        
        // Configuração da tabela
        doc.autoTable({
            startY: yPos,
            head: [cabecalho.map(c => c.header)],
            body: dados.map(d => cabecalho.map(c => d[c.dataKey])),
            theme: 'grid',
            headStyles: {
                fillColor: cores.azulMedio,
                textColor: cores.branco,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 25 },
                1: { cellWidth: 35 },
                2: { cellWidth: 50 },
                3: { halign: 'center', cellWidth: 30 },
                4: { halign: 'right', cellWidth: 30 }
            },
            alternateRowStyles: { fillColor: [248, 249, 250] },
            margin: { left: 15, right: 15 }
        });
        
        // Adicionar linha de total
        const finalY = doc.lastAutoTable.finalY;
        doc.setFillColor(...cores.verde);
        doc.rect(15, finalY + 2, 180, 8, 'F');
        doc.setTextColor(...cores.branco);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        adicionarTextoPDF(doc, 'TOTAL GERAL', 105, finalY + 7, { align: 'left' });
        adicionarTextoPDF(doc, `R$ ${formatarMoeda(totalValor)}`, 165, finalY + 7, { align: 'right' });
        
        // === RODAPÉ PROFISSIONAL ===
        yPos = 280;
        
        // Linha de separação
        doc.setDrawColor(...cores.azulMedio);
        doc.setLineWidth(0.8);
        doc.line(15, yPos, 195, yPos);
        
        yPos += 5;
        
        // Rodapé com informações
        doc.setTextColor(...cores.cinzaMedio);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        adicionarTextoPDF(doc, `Relatório gerado automaticamente pelo Sistema de Controle de Despesas`, 20, yPos);
        adicionarTextoPDF(doc, `${dataGeracao}`, 180, yPos, { align: 'right' });
        
        yPos += 3;
        adicionarTextoPDF(doc, `Total de ${despesasFiltradas.length} despesas analisadas no período`, 20, yPos);
        adicionarTextoPDF(doc, `Página 1 de 1`, 180, yPos, { align: 'right' });

        // Salvar PDF
        const nomeArquivo = `relatorio_despesas_${dataInicio}_${dataFim}.pdf`;
        doc.save(nomeArquivo);

        console.log('✅ PDF de despesas gerado com sucesso!', {
            arquivo: nomeArquivo,
            registros: despesasFiltradas.length,
            periodo: { inicio: dataInicio, fim: dataFim }
        });
        
        AlertToast.success(`PDF de despesas gerado com sucesso! Arquivo: ${nomeArquivo}`);

    } catch (error) {
        console.error('❌ Erro ao gerar PDF de despesas:', error);
        AlertError.show(
            'Erro ao Gerar PDF',
            `Erro ao gerar PDF de despesas: ${error.message}. Verifique o console para mais detalhes.`
        );
    }
}

// Exportar funções para o escopo global
if (typeof window !== 'undefined') {
    window.gerarRelatorioConsumo = gerarRelatorioConsumo;
    window.gerarRelatorioCustos = gerarRelatorioCustos;
    window.gerarRelatorioDespesas = gerarRelatorioDespesas;
    window.exportarPdfCompleto = exportarPdfCompleto;
    window.exportarPdfCustos = exportarPdfCustos;
    window.exportarPdfDespesas = exportarPdfDespesas;
}
