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
                <td>${formatarLitros(d.totalLitros)}</td>
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

// Exportar funções para o escopo global
if (typeof window !== 'undefined') {
    window.gerarRelatorioConsumo = gerarRelatorioConsumo;
    window.gerarRelatorioCustos = gerarRelatorioCustos;
    window.gerarRelatorioDespesas = gerarRelatorioDespesas;
    window.exportarPdfCompleto = exportarPdfCompleto;
    window.exportarPdfCustos = exportarPdfCustos;
    window.exportarPdfDespesas = exportarPdfDespesas;
}
