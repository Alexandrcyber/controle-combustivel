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
    
    // Mostrar alerta de loading
    AlertInfo.loading('Gerando Relatorio de Consumo', 'Processando dados, aguarde...');
    
    // Mostrar loading enquanto processa
    const resultadosElement = document.getElementById('relatorioResultados');
    if (!resultadosElement) {
        console.error('Elemento relatorioResultados nao encontrado!');
        AlertUtils.close(); // Fechar loading
        AlertError.show('Erro do Sistema', 'Elemento de exibicao do relatorio nao encontrado.');
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
function exportarPdfCompleto() {
    console.log('🚀 Iniciando geração de PDF completo...');
    
    // Verificar se as datas foram selecionadas pelo usuário
    const dataInicio = document.getElementById('dataInicio')?.value;
    const dataFim = document.getElementById('dataFim')?.value;
    
    // Validar se as datas estão preenchidas
    if (!dataInicio || !dataFim) {
        AlertError.validation('Por favor, selecione o período para gerar o relatório PDF.');
        return;
    }
    
    AlertInfo.loading('Gerando PDF Completo', 'Criando relatorio abrangente com dashboards e analises...');
    
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
        
        // ================== PÁGINA 6: DADOS DETALHADOS ==================
        doc.addPage();
        yPos = criarDadosDetalhadosPdf(doc, dados, cores);
        
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
    adicionarTextoPDF(doc, 'RELATORIO DE COMBUSTIVEL', 105, 40, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(14);
    adicionarTextoPDF(doc, 'Analise Completa de Consumo e Performance', 105, 48, { align: 'center' });
    
    // Informações do relatório
    doc.setTextColor(...cores.texto);
    doc.setFontSize(12);
    
    let yPos = 70;
      // Data do relatório
    const agora = new Date();
    const dataAtual = agora.toLocaleDateString('pt-BR');
    adicionarTextoPDF(doc, `Data de Geracao: ${dataAtual}`, 20, yPos);
    yPos += 10;
    
    // Período analisado
    if (dados.periodo) {
        adicionarTextoPDF(doc, `Periodo Analisado: ${dados.periodo.inicio} ate ${dados.periodo.fim}`, 20, yPos);
        yPos += 10;
    }
    
    // Total de veiculos
    adicionarTextoPDF(doc, `Total de Veiculos: ${dados.totalCaminhoes}`, 20, yPos);
    yPos += 10;
    
    // Total de abastecimentos
    adicionarTextoPDF(doc, `Total de Abastecimentos: ${dados.totalAbastecimentos}`, 20, yPos);
    yPos += 20;
    
    // Resumo Executivo
    doc.setFillColor(...cores.secundaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(10, yPos, 190, 15, 'F');
    }    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    adicionarTextoPDF(doc, 'RESUMO EXECUTIVO', 105, yPos + 10, { align: 'center' });
    
    yPos += 25;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(12);
      // Principais indicadores
    const items = [
        `Total Gasto: R$ ${dados.totais.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `Total Consumido: ${formatarLitros(dados.totais.consumo)} L`,
        `Distancia Total: ${formatarQuilometragem(dados.totais.distancia)} km`,
        `Media de Consumo: ${formatarNumero(dados.medias.consumo)} km/L`,
        `Custo por km: R$ ${formatarMoeda(dados.medias.custoPorKm)}`
    ];
    
    items.forEach(item => {
        adicionarTextoPDF(doc, `• ${item}`, 20, yPos);
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
    adicionarTextoPDF(doc, 'PRINCIPAIS INSIGHTS', 105, yPos + 10, { align: 'center' });
    
    yPos += 25;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(11);
    
    // Análise automática baseada nos dados
    const insights = [];
    
    if (dados.medias.consumo < 3) {
        insights.push('• Consumo médio abaixo do esperado - investigar possíveis problemas');
    } else if (dados.medias.consumo > 6) {
        insights.push('• Excelente eficiencia no consumo da frota');
    }
    
    if (dados.medias.custoPorKm > 2) {
        insights.push('• Custo por quilômetro elevado - revisar estratégias de abastecimento');
    }
    
    if (insights.length === 0) {
        insights.push('• Performance da frota dentro dos padrões esperados');
        insights.push('• Continue monitorando para manter a eficiencia');
    }
    
    insights.forEach(insight => {
        adicionarTextoPDF(doc, insight, 20, yPos);
        yPos += 7;
    });
    
    // Rodapé da capa
    doc.setFontSize(10);
    doc.setTextColor(...cores.cinza);
    adicionarTextoPDF(doc, 'Sistema de Controle de Combustivel - Relatorio Automatizado', 105, 280, { align: 'center' });
    
    return yPos;
}

// Página 2: Dashboard Executivo
function criarDashboardExecutivoPdf(doc, dados, cores) {    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    doc.rect(10, 10, 190, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    adicionarTextoPDF(doc, 'DASHBOARD EXECUTIVO', 105, 21, { align: 'center' });
    
    let yPos = 35;
    doc.setTextColor(...cores.texto);
    
    // KPIs principais em cards
    const kpis = [
        { label: 'Gasto Total', valor: `R$ ${dados.totais.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, cor: cores.sucesso },
        { label: 'Consumo Total', valor: `${dados.totais.consumo.toLocaleString('pt-BR')} L`, cor: cores.info },
        { label: 'Distancia Total', valor: `${dados.totais.distancia.toLocaleString('pt-BR')} km`, cor: cores.alerta },
        { label: 'Eficiencia Media', valor: `${formatarNumero(dados.medias.consumo)} km/L`, cor: cores.secundaria }
    ];
      // Desenhar cards dos KPIs
    let cardX = 15;
    kpis.forEach(kpi => {
        // Card background - validar argumentos antes de chamar rect()
        if (!isNaN(cardX) && !isNaN(yPos) && cardX >= 0 && yPos >= 0) {
            doc.setFillColor(...kpi.cor);
            doc.rect(cardX, yPos, 40, 25, 'F');
        }
        
        // Texto do card        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        adicionarTextoPDF(doc, kpi.label, cardX + 20, yPos + 8, { align: 'center' });
        doc.setFontSize(12);
        adicionarTextoPDF(doc, kpi.valor, cardX + 20, yPos + 18, { align: 'center' });
        
        cardX += 45;
    });
    
    yPos += 40;
      // Grafico de barras simples - Top 5 veiculos por consumo
    doc.setTextColor(...cores.texto);
    doc.setFontSize(14);
    adicionarTextoPDF(doc, 'TOP 5 VEICULOS POR CONSUMO', 20, yPos);
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
        `Gasto medio por veiculo: R$ ${formatarMoeda(gastoPorVeiculo)}`,
        `Consumo medio por veiculo: ${formatarLitros(consumoPorVeiculo)}`,
        `Custo médio por litro: R$ ${((dados.totais.gasto && dados.totais.consumo > 0) ? 
            (dados.totais.gasto / dados.totais.consumo) : 0).toFixed(2)}`,
        `Quilometragem media por veiculo: R$ ${((dados.totais.distancia && dados.totalCaminhoes > 0) ? 
            (dados.totais.distancia / dados.totalCaminhoes) : 0).toFixed(2)} km`
    ];    tendencias.forEach(tendencia => {
        adicionarTextoPDF(doc, `• ${tendencia}`, 20, yPos);
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
    }    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    adicionarTextoPDF(doc, 'INDICADORES DE PERFORMANCE', 105, 21, { align: 'center' });
    
    let yPos = 35;
    doc.setTextColor(...cores.texto);
    
    // Matriz de performance
    doc.setFontSize(14);
    adicionarTextoPDF(doc, 'MATRIZ DE PERFORMANCE POR VEICULO', 20, yPos);
    yPos += 15;
    
    // Cabeçalho da tabela
    doc.setFillColor(...cores.secundaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(10, yPos, 190, 10, 'F');
    }    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    adicionarTextoPDF(doc, 'PLACA', 15, yPos + 7);
    adicionarTextoPDF(doc, 'CONSUMO (L)', 50, yPos + 7);    adicionarTextoPDF(doc, 'DISTANCIA (km)', 90, yPos + 7);
    adicionarTextoPDF(doc, 'EFICIENCIA (km/L)', 135, yPos + 7);
    adicionarTextoPDF(doc, 'STATUS', 175, yPos + 7);
    
    yPos += 12;
    
    // Dados dos veiculos
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
        adicionarTextoPDF(doc, caminhao.placa, 15, yPos + 3);
        adicionarTextoPDF(doc, formatarLitros(caminhao.totalLitros), 55, yPos + 3);
        adicionarTextoPDF(doc, formatarQuilometragem(caminhao.totalKm), 95, yPos + 3);
        adicionarTextoPDF(doc, formatarMoeda(eficiencia), 145, yPos + 3);
        
        // Status colorido
        doc.setTextColor(...corStatus);
        adicionarTextoPDF(doc, status, 175, yPos + 3);
        
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
    adicionarTextoPDF(doc, 'ALERTAS E RECOMENDACOES', 105, yPos + 10, { align: 'center' });
    
    yPos += 25;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(11);
    
    // Gerar alertas baseados nos dados
    const alertas = [];
      // Verificar veiculos com baixa eficiencia
    const veiculosBaixaEficiencia = Object.values(dados.dadosPorCaminhao)
        .filter(c => c.totalLitros > 0 && (c.totalKm / c.totalLitros) < 3);
    
    if (veiculosBaixaEficiencia.length > 0) {
        alertas.push(`ATENCAO: ${veiculosBaixaEficiencia.length} veiculo(s) com baixa eficiencia precisam de atencao`);
    }
    
    // Verificar gastos elevados
    const gastoMedio = dados.totais.gasto / dados.totalCaminhoes;
    const veiculosGastoAlto = Object.values(dados.dadosPorCaminhao)
        .filter(c => c.totalGasto > gastoMedio * 1.5);
    
    if (veiculosGastoAlto.length > 0) {
        alertas.push(`CUSTO ALTO: ${veiculosGastoAlto.length} veiculo(s) com gastos acima da media`);
    }
    
    // Recomendações gerais
    alertas.push('RECOMENDACAO: Realizar manutencao preventiva regularmente');
    alertas.push('RECOMENDACAO: Monitorar padroes de conducao dos motoristas');
    alertas.push('RECOMENDACAO: Avaliar rotas para otimizacao de combustivel');
    
    alertas.forEach(alerta => {
        adicionarTextoPDF(doc, alerta, 20, yPos);
        yPos += 8;
    });
    
    return yPos;
}

// Pagina 3: Analise Detalhada por Veiculo
function criarAnaliseDetalhadaPdf(doc, dados, cores) {
    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    adicionarTextoPDF(doc, 'ANALISE DETALHADA POR VEICULO', 105, 21, { align: 'center' });
    
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
        doc.setTextColor(255, 255, 255);        doc.setFontSize(12);
        adicionarTextoPDF(doc, `${caminhao.placa} - ${caminhao.modelo}`, 20, yPos + 6);
        
        yPos += 15;
        doc.setTextColor(...cores.texto);
        doc.setFontSize(10);
        
        // Dados do caminhão
        const consumo = caminhao.totalKm > 0 ? formatarNumero(caminhao.totalLitros / caminhao.totalKm * 100, 2) : 0;
        const custoPorKm = caminhao.totalKm > 0 ? formatarMoeda(caminhao.totalGasto / caminhao.totalKm) : 0;
          adicionarTextoPDF(doc, `Quilometragem Total: ${formatarQuilometragem(caminhao.totalKm)} km`, 20, yPos);
        adicionarTextoPDF(doc, `Combustivel Total: ${formatarLitros(caminhao.totalLitros)} litros`, 110, yPos);
        yPos += 7;
        adicionarTextoPDF(doc, `Gasto Total: R$ ${formatarMoeda(caminhao.totalGasto)}`, 20, yPos);
        adicionarTextoPDF(doc, `Consumo: ${consumo} L/100km`, 110, yPos);
        yPos += 7;
        adicionarTextoPDF(doc, `Custo/km: R$ ${custoPorKm}`, 20, yPos);
        adicionarTextoPDF(doc, `Abastecimentos: ${caminhao.abastecimentos.length}`, 110, yPos);
        
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
    adicionarTextoPDF(doc, 'ANALISE DE CUSTOS E TENDENCIAS', 105, 21, { align: 'center' });
    
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
    adicionarTextoPDF(doc, 'ANALISE FINANCEIRA', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
      // Métricas financeiras
    adicionarTextoPDF(doc, `Gasto Total no Periodo: R$ ${formatarMoeda(totais.totalGasto)}`, 20, yPos);
    yPos += 8;
    adicionarTextoPDF(doc, `Custo Medio por km: R$ ${formatarMoeda(totais.custoPorKm)}`, 20, yPos);
    yPos += 8;
    adicionarTextoPDF(doc, `Preco Medio do Litro: R$ ${formatarMoeda(totais.valorMedioLitro)}`, 20, yPos);
    yPos += 8;
    adicionarTextoPDF(doc, `Consumo Medio da Frota: ${formatarNumero(totais.consumoMedio, 2)} km/l`, 20, yPos);
    
    yPos += 20;
      // Projeções
    doc.setFillColor(...cores.alerta);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    adicionarTextoPDF(doc, 'PROJECOES MENSAIS E ANUAIS', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(10);
    
    const gastoMensal = totais.totalGasto;
    const gastoAnual = gastoMensal * 12;
    const litrosMensais = totais.totalLitros;
    const litrosAnuais = litrosMensais * 12;
      adicionarTextoPDF(doc, `Projecao Mensal: R$ ${formatarMoeda(gastoMensal)} / ${formatarLitros(litrosMensais)} litros`, 20, yPos);
    yPos += 8;
    adicionarTextoPDF(doc, `Projecao Anual: R$ ${formatarMoeda(gastoAnual)} / ${formatarLitros(litrosAnuais)} litros`, 20, yPos);
    yPos += 8;
    adicionarTextoPDF(doc, `Economia potencial com 10% de melhoria: R$ ${formatarMoeda(gastoAnual * 0.1)}/ano`, 20, yPos);
    
    yPos += 20;
      // Ranking de Eficiencia
    doc.setFillColor(...cores.sucesso);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(yPos) && yPos >= 0) {
        doc.rect(15, yPos, 180, 8, 'F');
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    adicionarTextoPDF(doc, 'RANKING DE EFICIENCIA DOS VEICULOS', 105, yPos + 6, { align: 'center' });
    
    yPos += 20;
    doc.setTextColor(...cores.texto);
    doc.setFontSize(9);
    
    // Ordenar caminhoes por eficiencia
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
        const indicador = posicao === 1 ? '1º LUGAR' : posicao === 2 ? '2º LUGAR' : posicao === 3 ? '3º LUGAR' : `${posicao}º LUGAR`;
        adicionarTextoPDF(doc, `${indicador} - ${caminhao.placa} - ${formatarNumero(caminhao.consumo, 1)} L/100km - R$ ${formatarMoeda(caminhao.custoPorKm)}/km`, 20, yPos);
        yPos += 6;
    });
    
    return yPos;
}

// Página 7: Dados Detalhados
function criarDadosDetalhadosPdf(doc, dados, cores) {
    // Cabeçalho da página
    doc.setFillColor(...cores.primaria);
    // Validar argumentos antes de chamar rect()
    if (!isNaN(10) && !isNaN(10) && !isNaN(190) && !isNaN(15)) {
        doc.rect(10, 10, 190, 15, 'F');
    }    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    adicionarTextoPDF(doc, 'DADOS DETALHADOS DE ABASTECIMENTOS', 105, 21, { align: 'center' });
    
    let yPos = 35;
    
    // Preparar dados para tabela
    const abastecimentos = dados.abastecimentosFiltrados.slice(0, 20); // Limitar a 20 registros mais recentes
    
    const cabecalhos = ['Data', 'Veiculo', 'Litros', 'Valor', 'Posto'];
    const dadosTabela = abastecimentos.map(a => {
        const caminhao = dados.caminhoes.find(c => c.id === a.caminhaoId);
        return [
            new Date(a.data).toLocaleDateString('pt-BR'),
            caminhao ? caminhao.placa : 'N/A',
            `${formatarLitros(a.litros)}L`,
            `R$ ${formatarMoeda(a.valorTotal)}`,
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
    doc.setFontSize(10);    adicionarTextoPDF(doc, `Exibindo ${abastecimentos.length} de ${dados.abastecimentosFiltrados.length} registros`, 20, yPos);
    if (dados.abastecimentosFiltrados.length > 20) {
        yPos += 8;
        adicionarTextoPDF(doc, `Para ver todos os registros, acesse o sistema online`, 20, yPos);
    }
    
    return yPos + 10;
}




// Exportar relatório de custos para PDF
async function exportarPdfCustos() {
    console.log('🚀 Iniciando geracao de PDF de custos...');
    
    try {
        // Capturar dados do formulário
        const dataInicio = document.getElementById('custosDataInicio')?.value;
        const dataFim = document.getElementById('custosDataFim')?.value;
        const caminhaoId = document.getElementById('caminhaoCustosSelect')?.value || 'todos';

        // Validar se as datas estão preenchidas
        if (!dataInicio || !dataFim) {
            AlertError.validation('Por favor, selecione o período para gerar o relatório de custos.');
            return;
        }

        // Processar dados igual à função gerarRelatorioCustos
        const dadosCaminhoes = window.caminhoes || [];
        let dadosAbastecimentos = window.abastecimentos || [];
        
        console.log('📊 Dados disponíveis para PDF:', {
            caminhoes: dadosCaminhoes.length,
            abastecimentos: dadosAbastecimentos.length,
            periodo: { inicio: dataInicio, fim: dataFim },
            caminhaoSelecionado: caminhaoId        });
        
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

        // Agrupar dados por caminhão
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
        });

        // Calcular totais gerais
        let totalLitrosGeral = 0, totalGastoGeral = 0, totalKmGeral = 0;
        Object.values(dadosPorCaminhao).forEach(d => {
            d.mediaConsumo = d.totalLitros > 0 ? (d.totalKm / d.totalLitros) : 0;
            d.custoMedio = d.totalKm > 0 ? (d.totalGasto / d.totalKm) : 0;
            d.valorMedioLitro = d.totalLitros > 0 ? (d.totalGasto / d.totalLitros) : 0;
            totalLitrosGeral += d.totalLitros;
            totalGastoGeral += d.totalGasto;
            totalKmGeral += d.totalKm;
        });
        const consumoMedioGeral = totalLitrosGeral > 0 ? formatarNumero(totalKmGeral / totalLitrosGeral, 2) : 'N/A';
        const custoPorKmGeral = totalKmGeral > 0 ? formatarMoeda(totalGastoGeral / totalKmGeral) : 'N/A';

        // Criar PDF profissional
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurar esquema de cores profissional (Excel-like)
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
        adicionarTextoPDF(doc, 'RELATORIO DE CUSTOS OPERACIONAIS', 105, 20, { align: 'center' });
        
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
        
        const caminhaoSelecionado = caminhaoId === 'todos' ? 'Todos os Veículos' : 
            (dadosCaminhoes.find(c => c.id === caminhaoId)?.placa || 'Desconhecido');
              adicionarTextoPDF(doc, `Periodo: ${formatDate(dataInicio)} até ${formatDate(dataFim)}`, 20, yPos + 5);
        adicionarTextoPDF(doc, `Veiculo: ${caminhaoSelecionado}`, 20, yPos + 9);
        
        const dataGeracao = new Date().toLocaleString('pt-BR');
        adicionarTextoPDF(doc, `Relatorio gerado em: ${dataGeracao}`, 120, yPos + 7, { align: 'left' });
        
        yPos += 20;

        // === DASHBOARD DE MÉTRICAS PRINCIPAIS ===
        // Container do dashboard
        doc.setFillColor(...cores.brancoGelo);
        doc.rect(15, yPos, 180, 35, 'F');
        doc.setDrawColor(...cores.cinzaClaro);
        doc.setLineWidth(0.5);
        doc.rect(15, yPos, 180, 35, 'S');
        
        // Título da seção
        doc.setFillColor(...cores.verde);
        doc.rect(15, yPos, 180, 8, 'F');
        doc.setTextColor(...cores.branco);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        adicionarTextoPDF(doc, 'RESUMO EXECUTIVO', 105, yPos + 5, { align: 'center' });
        
        yPos += 12;
        
        // Cards de métricas (3 colunas)
        const larguraCard = 55;
        const espacoCard = 60;
        
        // Card 1: Veículos e Combustível
        doc.setFillColor(...cores.branco);
        doc.rect(20, yPos, larguraCard, 18, 'F');
        doc.setDrawColor(...cores.cinzaClaro);
        doc.rect(20, yPos, larguraCard, 18, 'S');
          doc.setTextColor(...cores.azulEscuro);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        adicionarTextoPDF(doc, 'FROTA E COMBUSTIVEL', 47.5, yPos + 4, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...cores.cinzaEscuro);
        adicionarTextoPDF(doc, `Veiculos: ${Object.keys(dadosPorCaminhao).length}`, 22, yPos + 8);
        adicionarTextoPDF(doc, `Combustivel: ${formatarLitros(totalLitrosGeral)} L`, 22, yPos + 12);
        adicionarTextoPDF(doc, `Consumo Medio: ${consumoMedioGeral} km/L`, 22, yPos + 16);
        
        // Card 2: Financeiro
        doc.setFillColor(...cores.branco);
        doc.rect(20 + espacoCard, yPos, larguraCard, 18, 'F');
        doc.setDrawColor(...cores.cinzaClaro);
        doc.rect(20 + espacoCard, yPos, larguraCard, 18, 'S');
        
        doc.setTextColor(...cores.verde);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        adicionarTextoPDF(doc, 'CUSTOS OPERACIONAIS', 47.5 + espacoCard, yPos + 4, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...cores.cinzaEscuro);        adicionarTextoPDF(doc, `Total Gasto: R$ ${formatarMoeda(totalGastoGeral)}`, 22 + espacoCard, yPos + 8);
        adicionarTextoPDF(doc, `Custo por km: R$ ${custoPorKmGeral}`, 22 + espacoCard, yPos + 12);
        const valorMedioLitro = totalLitrosGeral > 0 ? formatarMoeda(totalGastoGeral / totalLitrosGeral) : 'N/A';
        adicionarTextoPDF(doc, `Preço por litro: R$ ${valorMedioLitro}`, 22 + espacoCard, yPos + 16);
        
        // Card 3: Operacional
        doc.setFillColor(...cores.branco);
        doc.rect(20 + (espacoCard * 2), yPos, larguraCard, 18, 'F');
        doc.setDrawColor(...cores.cinzaClaro);
        doc.rect(20 + (espacoCard * 2), yPos, larguraCard, 18, 'S');
        
        doc.setTextColor(...cores.laranja);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        adicionarTextoPDF(doc, 'DESEMPENHO OPERACIONAL', 47.5 + (espacoCard * 2), yPos + 4, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...cores.cinzaEscuro);        adicionarTextoPDF(doc, `Quilometragem total: ${formatarQuilometragem(totalKmGeral)} km`, 22 + (espacoCard * 2), yPos + 8);
        const mediaKmPorVeiculo = Object.keys(dadosPorCaminhao).length > 0 ? Math.round(totalKmGeral / Object.keys(dadosPorCaminhao).length) : 0;
        adicionarTextoPDF(doc, `Media por veículo: ${formatarQuilometragem(mediaKmPorVeiculo)} km`, 22 + (espacoCard * 2), yPos + 12);
        const abastecimentosPeriodo = filtrados.length;
        adicionarTextoPDF(doc, `Abastecimentos: ${abastecimentosPeriodo}`, 22 + (espacoCard * 2), yPos + 16);
        
        yPos += 28;

        // === TABELA PRINCIPAL ESTILO EXCEL AVANÇADO ===
        yPos += 10;
        
        // Cabeçalho da tabela com estilo Excel
        doc.setFillColor(...cores.azulEscuro);
        doc.rect(15, yPos, 180, 10, 'F');
        doc.setTextColor(...cores.branco);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        adicionarTextoPDF(doc, 'DETALHAMENTO POR VEÍCULO', 105, yPos + 6, { align: 'center' });
        
        yPos += 12;
          // Headers da tabela com cores alternadas - ajustando larguras para separar placa e modelo
        const colunas = [
            { titulo: 'PLACA', x: 20, largura: 25 },
            { titulo: 'MODELO', x: 47, largura: 27 },
            { titulo: 'COMBUSTIVEL', x: 75, largura: 25 },
            { titulo: 'GASTO TOTAL', x: 98, largura: 25 },
            { titulo: 'DISTANCIA', x: 123, largura: 25 },
            { titulo: 'CONSUMO', x: 146, largura: 25 },
            { titulo: 'CUSTO/KM', x: 169, largura: 27 }
        ];
        
        // Cabeçalho das colunas
        doc.setFillColor(...cores.azulMedio);
        doc.rect(15, yPos, 180, 8, 'F');
        
        doc.setTextColor(...cores.branco);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        
        colunas.forEach(col => {
            adicionarTextoPDF(doc, col.titulo, col.x, yPos + 5);
        });
        
        // Subheaders - português brasileiro correto
        yPos += 8;
        doc.setFillColor(...cores.azulClaro);
        doc.rect(15, yPos, 180, 6, 'F');
        doc.setFontSize(7);
        adicionarTextoPDF(doc, 'Identificaçao', 20, yPos + 4);
        adicionarTextoPDF(doc, 'Tipo do Veiculo', 47, yPos + 4);
        adicionarTextoPDF(doc, 'Litros', 75, yPos + 4);
        adicionarTextoPDF(doc, 'Reais', 98, yPos + 4);
        adicionarTextoPDF(doc, 'Quilometros', 123, yPos + 4);
        adicionarTextoPDF(doc, 'km por Litro', 146, yPos + 4);
        adicionarTextoPDF(doc, 'Reais por km', 169, yPos + 4);
        
        yPos += 8;
        
        // Dados dos veículos com linhas alternadas
        let linhaPar = true;
        const dadosOrdenados = Object.values(dadosPorCaminhao).sort((a, b) => b.totalGasto - a.totalGasto);
        
        dadosOrdenados.forEach((d, index) => {
            if (yPos > 265) { // Nova página se necessário
                doc.addPage();
                yPos = 20;
                  // Repetir cabeçalho na nova página
                doc.setFillColor(...cores.azulEscuro);
                doc.rect(15, yPos, 180, 8, 'F');
                doc.setTextColor(...cores.branco);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                adicionarTextoPDF(doc, 'DETALHAMENTO POR VEICULO - Continuaçao', 105, yPos + 5, { align: 'center' });
                yPos += 10;
                linhaPar = true;
            }
              // Fundo alternado
            if (linhaPar) {
                doc.setFillColor(...cores.brancoGelo);
                doc.rect(15, yPos, 180, 7, 'F');
            }
            
            // Bordas das células
            doc.setDrawColor(...cores.cinzaClaro);
            doc.setLineWidth(0.2);
            let xPos = 15;
            colunas.forEach(col => {
                doc.rect(xPos, yPos, col.largura, 7, 'S');
                xPos += col.largura;
            });
            
            // Texto das células
            doc.setTextColor(...cores.cinzaEscuro);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            
            // Placa sem ranking (apenas a placa)
            adicionarTextoPDF(doc, d.placa, 21, yPos + 4.5);
            
            // Modelo (coluna separada)
            doc.setFontSize(7);
            adicionarTextoPDF(doc, d.modelo, 47, yPos + 4.5);
            
            // Valores com formatação condicional
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            adicionarTextoPDF(doc, formatarLitros(d.totalLitros), 75, yPos + 4.5);
            
            // Cor baseada no gasto (verde para menor, vermelho para maior)
            const maiorGasto = Math.max(...dadosOrdenados.map(v => v.totalGasto));
            const menorGasto = Math.min(...dadosOrdenados.map(v => v.totalGasto));
            if (d.totalGasto >= maiorGasto * 0.8) {
                doc.setTextColor(...cores.vermelho);
            } else if (d.totalGasto <= menorGasto * 1.2) {
                doc.setTextColor(...cores.verde);
            } else {
                doc.setTextColor(...cores.cinzaEscuro);
            }
            adicionarTextoPDF(doc, formatarMoeda(d.totalGasto), 98, yPos + 4.5);
            
            doc.setTextColor(...cores.cinzaEscuro);
            adicionarTextoPDF(doc, formatarQuilometragem(d.totalKm), 123, yPos + 4.5);
            
            // Consumo com código de cores
            if (d.mediaConsumo >= 8) {
                doc.setTextColor(...cores.verde);
            } else if (d.mediaConsumo <= 5) {
                doc.setTextColor(...cores.vermelho);
            } else {
                doc.setTextColor(...cores.laranja);
            }
            adicionarTextoPDF(doc, formatarNumero(d.mediaConsumo, 2), 146, yPos + 4.5);
            
            doc.setTextColor(...cores.cinzaEscuro);
            adicionarTextoPDF(doc, formatarMoeda(d.custoMedio), 169, yPos + 4.5);
            
            yPos += 7;
            linhaPar = !linhaPar;
        });
        
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
        adicionarTextoPDF(doc, `Relatório gerado automaticamente pelo Sistema de Controle de Combustível`, 20, yPos);
        adicionarTextoPDF(doc, `${dataGeracao}`, 180, yPos, { align: 'right' });
        
        yPos += 3;
        adicionarTextoPDF(doc, `Total de ${filtrados.length} abastecimentos analisados no período`, 20, yPos);
        adicionarTextoPDF(doc, `Página 1 de 1`, 180, yPos, { align: 'right' });

        // Salvar PDF
        const nomeArquivo = `relatorio_custos_${dataInicio}_${dataFim}.pdf`;
        doc.save(nomeArquivo);

        console.log('✅ PDF de custos gerado com sucesso!', {
            arquivo: nomeArquivo,
            veiculos: Object.keys(dadosPorCaminhao).length,
            periodo: { inicio: dataInicio, fim: dataFim }
        });
        
        AlertToast.success(`PDF de custos gerado com sucesso! Arquivo: ${nomeArquivo} | Veículos: ${Object.keys(dadosPorCaminhao).length}`);

    } catch (error) {
        console.error('❌ Erro ao gerar PDF de custos:', error);
        AlertError.show(
            'Erro ao Gerar PDF',
            `Erro ao gerar PDF de custos: ${error.message}. Verifique o console para mais detalhes.`
        );
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

function criarAnalisePrecos(abastecimentos) {
    if (!abastecimentos || abastecimentos.length === 0) return [];
    
    const precosPorData = abastecimentos
        .filter(a => a.litros > 0)
        .map(a => ({
            data: a.data,
            valorLitro: a.valorTotal / a.litros
        }))
        .sort((a, b) => new Date(a.data) - new Date(b.data));
    
    const analise = [];
    for (let i = 0; i < precosPorData.length; i++) {
        const atual = precosPorData[i];
        const anterior = i > 0 ? precosPorData[i - 1] : atual;
        
        const variacao = i > 0 ? 
            ((atual.valorLitro - anterior.valorLitro) / anterior.valorLitro * 100) : 0;
        
        let tendencia = 'Estável';
        if (variacao > 5) tendencia = 'Alta';
        else if (variacao < -5) tendencia = 'Baixa';
        
        analise.push({
            data: atual.data,
            valorLitro: atual.valorLitro,
            variacao: variacao,
            tendencia: tendencia
        });
    }
    
    return analise.slice(-10); // Últimos 10 registros
}

function criarAnaliseTemporalData(abastecimentos) {
    if (!abastecimentos || abastecimentos.length === 0) return [];
    
    const dadosPorMes = {};
    
    abastecimentos.forEach(a => {
        const data = new Date(a.data);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        
        if (!dadosPorMes[chave]) {
            dadosPorMes[chave] = {
                periodo: chave,
                abastecimentos: 0,
                distancia: 0,
                combustivel: 0,
                gasto: 0
            };
        }
        
        const entrada = dadosPorMes[chave];
        entrada.abastecimentos++;
        entrada.distancia += (a.kmFinal - a.kmInicial);
        entrada.combustivel += a.litros;
        entrada.gasto += a.valorTotal;
    });
    
    // Calcular métricas
    return Object.values(dadosPorMes).map(periodo => ({
        ...periodo,
        consumoMedio: periodo.combustivel > 0 ? periodo.distancia / periodo.combustivel : 0,
        custoPorKm: periodo.distancia > 0 ? periodo.gasto / periodo.distancia : 0
    }));
}

function aplicarEstilizacaoDashboard(ws) {
    // Função placeholder para estilização básica
    // Em implementações futuras, pode adicionar cores e formatação
    if (!ws['!ref']) return;
    
    // Adicionar larguras de coluna básicas
    ws['!cols'] = [
        { wch: 15 }, // Coluna A
        { wch: 12 }, // Coluna B
        { wch: 10 }, // Coluna C
        { wch: 15 }, // Coluna D
        { wch: 12 }  // Coluna E
    ];
}

// ================== FUNÇÃO PARA TRATAR CARACTERES ESPECIAIS NO PDF ==================

// Função para converter emojis e caracteres especiais para texto compatível com PDF
function normalizarTextoPDF(texto) {
    if (typeof texto !== 'string') {
        return String(texto || '');
    }
    
    // Mapeamento de emojis para texto em português (padrão ABNT)
    const emojisParaTexto = {
        '📊': '[DADOS]',
        '⛽': '[COMBUSTIVEL]',
        '💰': '[GASTO]',
        '📈': '[GRAFICO]',
        '💵': '[CUSTO]',
        '🔢': '[NUMERO]',
        '💡': '[DICA]',
        '🚗': '[VEICULO]',
        '🥇': '[1º]',
        '🥈': '[2º]',
        '🥉': '[3º]',
        '📅': '[DATA]',
        '🔄': '[PROCESSO]',
        '⚠️': '[ALERTA]',
        '✅': '[OK]',
        '❌': '[ERRO]',
        '🎯': '[META]',
        '📋': '[LISTA]',
        '🔍': '[BUSCA]',
        '📦': '[PACOTE]',
        '🚀': '[LANCAMENTO]',
        '⭐': '[ESTRELA]',
        '🔧': '[MANUTENCAO]',
        '📝': '[RELATORIO]',
        '💯': '[100%]',
        '🏆': '[PREMIO]',
        '🎉': '[CELEBRACAO]',
        '👍': '[APROVADO]',
        '👎': '[REPROVADO]',
        '⚡': '[RAPIDO]',
        '🔥': '[DESTAQUE]',
        '❗': '[IMPORTANTE]',
        '❓': '[DUVIDA]',
        '🎪': '[EVENTO]'
    };
    
    // Substituir emojis por texto
    let textoNormalizado = texto;
    for (const [emoji, textoEquivalente] of Object.entries(emojisParaTexto)) {
        textoNormalizado = textoNormalizado.replace(new RegExp(emoji, 'g'), textoEquivalente);
    }
    
    // Normalizar caracteres acentuados para compatibilidade com PDF
    textoNormalizado = textoNormalizado
        // Acentos agudos
        .replace(/[áàâãä]/gi, 'a')
        .replace(/[éèêë]/gi, 'e')
        .replace(/[íìîï]/gi, 'i')
        .replace(/[óòôõö]/gi, 'o')
        .replace(/[úùûü]/gi, 'u')
        .replace(/[ç]/gi, 'c')
        // Maiúsculas acentuadas
        .replace(/[ÁÀÂÃÄ]/g, 'A')
        .replace(/[ÉÈÊË]/g, 'E')
        .replace(/[ÍÌÎÏ]/g, 'I')
        .replace(/[ÓÒÔÕÖ]/g, 'O')
        .replace(/[ÚÙÛÜ]/g, 'U')
        .replace(/[Ç]/g, 'C')
        // Outros caracteres especiais
        .replace(/[^\x00-\x7F]/g, '') // Remove caracteres não ASCII restantes
        .replace(/Ø/g, 'O')           // Substitui Ø por O
        .replace(/Ü/g, 'U')           // Substitui Ü por U
        .replace(/È/g, 'E')           // Substitui È por E
        .replace(/=/g, ' = ')         // Normaliza símbolos de igualdade
        .replace(/\s+/g, ' ')         // Remove espaços extras
        .trim();                      // Remove espaços no início/fim
    
    return textoNormalizado;
}

// Função auxiliar para adicionar texto normalizado ao PDF
function adicionarTextoPDF(doc, texto, x, y, opcoes = {}) {
    const textoNormalizado = normalizarTextoPDF(texto);
    doc.text(textoNormalizado, x, y, opcoes);
}
