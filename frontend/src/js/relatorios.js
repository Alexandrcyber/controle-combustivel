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
    // let totalGasto = 0;

    // Calcular consumo médio e outros indicadores
    Object.values(dadosPorCaminhao).forEach(dadosCaminhao => {
        dadosCaminhao.mediaConsumo = dadosCaminhao.totalLitros > 0 ? 
            (dadosCaminhao.totalKm / dadosCaminhao.totalLitros).toFixed(2) : 'N/A';
        dadosCaminhao.custoMedio = dadosCaminhao.totalKm > 0 ? 
            (dadosCaminhao.totalGasto / dadosCaminhao.totalKm).toFixed(2) : 'N/A';
            
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
                <td>${dados.totalLitros.toFixed(2)}</td>
                <td>${dados.mediaConsumo}</td>
                <td>R$ ${dados.totalGasto.toFixed(2)}</td>
                <td>R$ ${dados.custoMedio}</td>
            </tr>
        `;    });
    
    // Adicionar linha de totais
    const consumoMedioGeral = totalConsumo > 0 ? (totalDistancia / totalConsumo).toFixed(2) : 'N/A';
    const custoPorKmGeral = totalDistancia > 0 ? (totalGasto / totalDistancia).toFixed(2) : 'N/A';
    
    html += `
        <tr class="table-success fw-bold">
            <td>TOTAL GERAL</td>
            <td>${totalDistancia.toLocaleString('pt-BR')}</td>
            <td>${totalConsumo.toFixed(2)}</td>
            <td>${consumoMedioGeral}</td>
            <td>R$ ${totalGasto.toFixed(2)}</td>
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
                const consumo = (distancia / litros).toFixed(2);
                
                html += `
                    <tr>
                        <td>${formatDate(a.data)}</td>
                        <td>${a.motorista}</td>
                        <td>${kmInicial.toLocaleString('pt-BR')}</td>
                        <td>${kmFinal.toLocaleString('pt-BR')}</td>
                        <td>${distancia.toLocaleString('pt-BR')}</td>
                        <td>${litros.toFixed(2)}</td>
                        <td>${consumo} km/l</td>
                        <td>R$ ${valorTotal.toFixed(2)}</td>
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
            const consumo = (distancia / litros).toFixed(2);
            
            html += `
                <tr>
                    <td>${formatDate(a.data)}</td>
                    <td>${a.motorista}</td>
                    <td>${kmInicial.toLocaleString('pt-BR')}</td>
                    <td>${kmFinal.toLocaleString('pt-BR')}</td>
                    <td>${distancia.toLocaleString('pt-BR')}</td>
                    <td>${litros.toFixed(2)}</td>
                    <td>${consumo} km/l</td>
                    <td>R$ ${valorTotal.toFixed(2)}</td>
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
    });

    // Calcular totais e indicadores
    let totalLitrosGeral = 0, totalGastoGeral = 0, totalKmGeral = 0;
    Object.values(dadosPorCaminhao).forEach(d => {
        d.mediaConsumo = d.totalLitros > 0 ? (d.totalKm / d.totalLitros).toFixed(2) : 'N/A';
        d.custoMedio = d.totalKm > 0 ? (d.totalGasto / d.totalKm).toFixed(2) : 'N/A';
        d.valorMedioLitro = d.totalLitros > 0 ? (d.totalGasto / d.totalLitros).toFixed(2) : 'N/A';
        totalLitrosGeral += d.totalLitros;
        totalGastoGeral += d.totalGasto;
        totalKmGeral += d.totalKm;
    });
    const consumoMedioGeral = totalLitrosGeral > 0 ? (totalKmGeral / totalLitrosGeral).toFixed(2) : 'N/A';
    const custoPorKmGeral = totalKmGeral > 0 ? (totalGastoGeral / totalKmGeral).toFixed(2) : 'N/A';

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
        html += `
            <tr>
                <td>${d.placa} - ${d.modelo}</td>
                <td>${d.totalLitros.toFixed(2)}</td>
                <td>R$ ${d.totalGasto.toFixed(2)}</td>
                <td>${d.totalKm.toLocaleString('pt-BR')}</td>
                <td>R$ ${d.valorMedioLitro}</td>
                <td>${d.mediaConsumo} km/l</td>
                <td>R$ ${d.custoMedio}</td>
            </tr>
        `;
    });
    html += `
            <tr class="table-success fw-bold">
                <td>TOTAL GERAL</td>
                <td>${totalLitrosGeral.toFixed(2)}</td>
                <td>R$ ${totalGastoGeral.toFixed(2)}</td>
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

// Exportar relatório para Excel
function exportarRelatorioExcel() {
    // Mostrar loading para exportação
    AlertInfo.loading('Exportando para Excel', 'Gerando arquivo Excel, aguarde...');
    
    const relatorioDiv = document.getElementById('relatorioResultados');
    
    // Verificar se há um relatório gerado
    if (relatorioDiv.querySelector('.alert')) {
        AlertUtils.close(); // Fechar loading
        AlertWarning.show('Ação Inválida', 'Gere um relatório válido antes de exportar.');
        return;
    }
    
    // Obter todas as tabelas do relatório
    const tabelas = relatorioDiv.querySelectorAll('table');
    if (tabelas.length === 0) {
        AlertUtils.close(); // Fechar loading
        AlertWarning.show('Sem Dados', 'Nenhuma tabela encontrada para exportar.');
        return;
    }
    
    try {
        // Criar um novo livro Excel
        const wb = XLSX.utils.book_new();
        
        // Processar cada tabela e adicionar como planilha
        tabelas.forEach((tabela, index) => {
            // Obter título da tabela (h4 ou h5 mais próximo acima da tabela)
            let titulo = 'Planilha ' + (index + 1);
            let elementoAnterior = tabela.previousElementSibling;
            
            while (elementoAnterior) {
                if (elementoAnterior.tagName === 'H4' || elementoAnterior.tagName === 'H5') {
                    titulo = elementoAnterior.textContent.trim();
                    break;
                }
                elementoAnterior = elementoAnterior.previousElementSibling;
            }
            
            // Limitar o tamanho do título (nomes de planilha Excel têm limite)
            if (titulo.length > 30) {
                titulo = titulo.substring(0, 27) + '...';
            }
            
            // Converter tabela HTML para planilha
            const ws = XLSX.utils.table_to_sheet(tabela);
            
            // Adicionar planilha ao livro
            XLSX.utils.book_append_sheet(wb, ws, titulo);
        });
        
        // Gerar nome do arquivo com data atual
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0]; // formato YYYY-MM-DD
        const nomeArquivo = `Relatorio_Combustivel_${dataFormatada}.xlsx`;
        
        // Exportar o arquivo
        XLSX.writeFile(wb, nomeArquivo);
          // Fechar loading e mostrar sucesso
        AlertUtils.close();
        AlertToast.success(`Relatório Excel baixado com sucesso! (${nomeArquivo})`);
        
    } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        AlertUtils.close(); // Fechar loading
        AlertError.show('Erro na Exportação', 'Ocorreu um erro ao gerar o arquivo Excel. Tente novamente.');
    }
}

// Exportar relatório para PDF
function exportarRelatorioPdf() {
    // Mostrar loading para exportação
    AlertInfo.loading('Exportando para PDF', 'Gerando arquivo PDF, aguarde...');
    
    const relatorioDiv = document.getElementById('relatorioResultados');
    
    // Verificar se há um relatório gerado
    if (relatorioDiv.querySelector('.alert')) {
        AlertUtils.close(); // Fechar loading
        AlertWarning.show('Ação Inválida', 'Gere um relatório válido antes de exportar.');        return;
    }
    
    try {
        // Obter título do relatório
        const titulo = relatorioDiv.querySelector('h4').textContent.trim();
          // Criar novo documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');
        
        // Configurar cabeçalho
        doc.setFontSize(18);
        doc.text(titulo, 14, 15);
        
        // Adicionar data e hora
        const dataHoraAtual = new Date().toLocaleString('pt-BR');
        doc.setFontSize(10);
        doc.text(`Gerado em: ${dataHoraAtual}`, 14, 22);
        
        // Obter todas as tabelas do relatório
        const tabelas = relatorioDiv.querySelectorAll('table');
        
        // Posição vertical inicial
        let yPos = 30;
        
        // Processar cada tabela
        tabelas.forEach((tabela, index) => {
            // Obter título da tabela (h4 ou h5 mais próximo acima da tabela)
            let tituloTabela = '';
            let elementoAnterior = tabela.previousElementSibling;
            
            while (elementoAnterior) {
                if (elementoAnterior.tagName === 'H4' || elementoAnterior.tagName === 'H5') {
                    tituloTabela = elementoAnterior.textContent.trim();
                    break;
                }
                elementoAnterior = elementoAnterior.previousElementSibling;
            }
            
            // Se não for a primeira tabela, adicionar nova página
            if (index > 0) {
                doc.addPage();
                yPos = 15;
                
                // Adicionar título da página
                doc.setFontSize(14);
                doc.text(titulo, 14, yPos);
                yPos += 10;
            }
            
            // Adicionar título da tabela
            if (tituloTabela && tituloTabela !== titulo) {
                doc.setFontSize(14);
                doc.text(tituloTabela, 14, yPos);
                yPos += 8;
            }
            
            // Converter tabela HTML para formato compatível com autoTable
            const dados = [];
            const cabecalhos = [];
            
            // Obter cabeçalhos
            const thElements = tabela.querySelectorAll('thead th');
            thElements.forEach(th => {
                cabecalhos.push(th.textContent.trim());
            });
            
            // Obter dados das linhas
            const trElements = tabela.querySelectorAll('tbody tr');
            trElements.forEach(tr => {
                const linha = [];
                tr.querySelectorAll('td').forEach(td => {
                    linha.push(td.textContent.trim());
                });
                dados.push(linha);
            });
            
            // Adicionar tabela ao PDF
            doc.autoTable({
                head: [cabecalhos],
                body: dados,
                startY: yPos,
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                margin: { top: 30 }
            });
            
            // Atualizar posição vertical para próxima tabela
            yPos = doc.lastAutoTable.finalY + 15;
        });
        
        // Gerar nome do arquivo com data atual
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0]; // formato YYYY-MM-DD
        const nomeArquivo = `Relatorio_Combustivel_${dataFormatada}.pdf`;
        
        // Exportar o arquivo
        doc.save(nomeArquivo);
          // Fechar loading e mostrar sucesso
        AlertUtils.close();
        AlertToast.success(`Relatório PDF baixado com sucesso! (${nomeArquivo})`);
        
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        AlertUtils.close(); // Fechar loading
        AlertError.show('Erro na Exportação', 'Ocorreu um erro ao gerar o arquivo PDF. Tente novamente.');
    }
}

// Funções auxiliares
function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function getTipoAgrupamentoLabel(tipo) {
    switch (tipo) {
        case 'caminhao': return 'Caminhão';
        case 'motorista': return 'Motorista';
        case 'mes': return 'Mês';
        default: return 'Grupo';
    }
}

// Função para carregar dados de caminhões e abastecimentos da API e popular select
async function carregarDados() {
    try {
        console.log('🔄 Carregando dados de caminhões e abastecimentos...');
        window.caminhoes = await window.dbApi.buscarCaminhoes();
        window.abastecimentos = await window.dbApi.buscarAbastecimentos();

        // Popular select de caminhões
        const select = document.getElementById('caminhaoSelect');
        if (select) {
            select.innerHTML = '<option value="todos">Todos os caminhões</option>';
            window.caminhoes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.placa} - ${c.modelo}`;
                select.appendChild(opt);
            });
        }
        console.log('✅ Dados carregados com sucesso');
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
}

// Disponibilizar como global
window.carregarDados = carregarDados;

// Documentar que este script foi carregado (para debugging)
console.log('Relatórios module loaded successfully');
