// Gerar relatório de consumo
function gerarRelatorioConsumo() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    const caminhaoId = document.getElementById('caminhaoSelect').value;
    
    // Validar datas
    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione o período para o relatório.');
        return;
    }
    
    // Filtrar abastecimentos pelo período
    let abastecimentosFiltrados = abastecimentos.filter(a => {
        return a.data >= dataInicio && a.data <= dataFim;
    });
    
    // Filtrar por caminhão se não for "todos"
    if (caminhaoId !== 'todos') {
        abastecimentosFiltrados = abastecimentosFiltrados.filter(a => a.caminhaoId == caminhaoId);
    }
    
    // Verificar se há dados para o relatório
    if (abastecimentosFiltrados.length === 0) {
        document.getElementById('relatorioResultados').innerHTML = 
            '<div class="alert alert-warning">Nenhum dado encontrado para o período e caminhão selecionados.</div>';
        return;
    }
    
    // Agrupar dados por caminhão
    const dadosPorCaminhao = {};
    
    abastecimentosFiltrados.forEach(a => {
        if (!dadosPorCaminhao[a.caminhaoId]) {
            const caminhao = caminhoes.find(c => c.id == a.caminhaoId);
            dadosPorCaminhao[a.caminhaoId] = {
                id: a.caminhaoId,
                placa: caminhao ? caminhao.placa : 'Desconhecido',
                modelo: caminhao ? caminhao.modelo : 'Desconhecido',
                totalKm: 0,
                totalLitros: 0,
                totalGasto: 0,
                abastecimentos: []
            };
        }
        
        // Adicionar dados deste abastecimento
        const distancia = a.kmFinal - a.kmInicial;
        dadosPorCaminhao[a.caminhaoId].totalKm += distancia;
        dadosPorCaminhao[a.caminhaoId].totalLitros += parseFloat(a.litros);
        dadosPorCaminhao[a.caminhaoId].totalGasto += a.valorTotal;
        dadosPorCaminhao[a.caminhaoId].abastecimentos.push(a);
    });
    
    // Calcular consumo médio e outros indicadores
    Object.values(dadosPorCaminhao).forEach(dadosCaminhao => {
        dadosCaminhao.mediaConsumo = dadosCaminhao.totalLitros > 0 ? 
            (dadosCaminhao.totalKm / dadosCaminhao.totalLitros).toFixed(2) : 'N/A';
        dadosCaminhao.custoMedio = dadosCaminhao.totalKm > 0 ? 
            (dadosCaminhao.totalGasto / dadosCaminhao.totalKm).toFixed(2) : 'N/A';
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
        `;
    });
    
    // Fechar tabela principal
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    // Adicionar detalhamento por caminhão se houver mais de um
    if (Object.keys(dadosPorCaminhao).length > 1) {
        // Criar gráfico comparativo
        html += `
            <div class="mb-4">
                <h5>Comparativo de Consumo</h5>
                <div style="height: 300px;">
                    <canvas id="graficoComparativoConsumo"></canvas>
                </div>
            </div>
        `;
        
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
                const distancia = a.kmFinal - a.kmInicial;
                const consumo = (distancia / parseFloat(a.litros)).toFixed(2);
                
                html += `
                    <tr>
                        <td>${formatDate(a.data)}</td>
                        <td>${a.motorista}</td>
                        <td>${a.kmInicial.toLocaleString('pt-BR')}</td>
                        <td>${a.kmFinal.toLocaleString('pt-BR')}</td>
                        <td>${distancia.toLocaleString('pt-BR')}</td>
                        <td>${parseFloat(a.litros).toFixed(2)}</td>
                        <td>${consumo} km/l</td>
                        <td>R$ ${a.valorTotal.toFixed(2)}</td>
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
            const distancia = a.kmFinal - a.kmInicial;
            const consumo = (distancia / parseFloat(a.litros)).toFixed(2);
            
            html += `
                <tr>
                    <td>${formatDate(a.data)}</td>
                    <td>${a.motorista}</td>
                    <td>${a.kmInicial.toLocaleString('pt-BR')}</td>
                    <td>${a.kmFinal.toLocaleString('pt-BR')}</td>
                    <td>${distancia.toLocaleString('pt-BR')}</td>
                    <td>${parseFloat(a.litros).toFixed(2)}</td>
                    <td>${consumo} km/l</td>
                    <td>R$ ${a.valorTotal.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Exibir resultados
    document.getElementById('relatorioResultados').innerHTML = html;
    
    // Criar gráficos após renderizar o HTML
    if (Object.keys(dadosPorCaminhao).length > 1) {
        // Gráfico comparativo entre caminhões
        const labels = Object.values(dadosPorCaminhao).map(d => d.placa);
        const consumoData = Object.values(dadosPorCaminhao).map(d => parseFloat(d.mediaConsumo) || 0);
        const custoData = Object.values(dadosPorCaminhao).map(d => parseFloat(d.custoMedio) || 0);
        
        createCustomChart(
            'graficoComparativoConsumo',
            'bar',
            labels,
            [
                {
                    label: 'Consumo (km/l)',
                    data: consumoData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Custo (R$/km)',
                    data: custoData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ],
            'Comparativo entre Caminhões',
            'Caminhão',
            'Consumo (km/l)'
        );
    } else if (Object.keys(dadosPorCaminhao).length === 1) {
        // Gráfico de evolução para um caminhão
        const dadosCaminhao = Object.values(dadosPorCaminhao)[0];
        const abastecimentosOrdenados = [...dadosCaminhao.abastecimentos].sort((a, b) => {
            return new Date(a.data) - new Date(b.data);
        });
        
        const labels = abastecimentosOrdenados.map(a => formatDate(a.data));
        const consumoData = abastecimentosOrdenados.map(a => {
            const distancia = a.kmFinal - a.kmInicial;
            return distancia / parseFloat(a.litros);
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
            }],
            'Evolução do Consumo',
            'Data',
            'Consumo (km/l)'
        );
    }
}

// Gerar relatório de custos
function gerarRelatorioCustos() {
    const mesInicio = document.getElementById('mesInicio').value;
    const mesFim = document.getElementById('mesFim').value;
    const tipoAgrupamento = document.getElementById('tipoAgrupamento').value;
    
    // Validar período
    if (!mesInicio || !mesFim) {
        alert('Por favor, selecione o período para o relatório.');
        return;
    }
    
    // Construir datas a partir dos valores do tipo month (YYYY-MM)
    const dataInicio = new Date(`${mesInicio}-01`);
    const dataFimMonth = mesFim.split('-');
    // Último dia do mês
    const ultimoDia = new Date(parseInt(dataFimMonth[0]), parseInt(dataFimMonth[1]), 0).getDate();
    const dataFim = new Date(`${mesFim}-${ultimoDia}`);
    
    // Filtrar abastecimentos pelo período
    const abastecimentosFiltrados = abastecimentos.filter(a => {
        const dataAbastecimento = new Date(a.data);
        return dataAbastecimento >= dataInicio && dataAbastecimento <= dataFim;
    });
    
    // Verificar se há dados para o relatório
    if (abastecimentosFiltrados.length === 0) {
        document.getElementById('relatorioResultados').innerHTML = 
            '<div class="alert alert-warning">Nenhum dado encontrado para o período selecionado.</div>';
        return;
    }
    
    // Agrupar dados conforme o tipo de agrupamento
    const dadosAgrupados = {};
    
    abastecimentosFiltrados.forEach(a => {
        let chave;
        let nomeExibicao;
        
        if (tipoAgrupamento === 'caminhao') {
            const caminhao = caminhoes.find(c => c.id == a.caminhaoId);
            chave = a.caminhaoId;
            nomeExibicao = caminhao ? `${caminhao.placa} - ${caminhao.modelo}` : 'Desconhecido';
        } else if (tipoAgrupamento === 'motorista') {
            chave = a.motorista;
            nomeExibicao = a.motorista;
        } else if (tipoAgrupamento === 'mes') {
            const dataAbastecimento = new Date(a.data);
            chave = `${dataAbastecimento.getFullYear()}-${(dataAbastecimento.getMonth() + 1).toString().padStart(2, '0')}`;
            nomeExibicao = `${dataAbastecimento.toLocaleString('pt-BR', { month: 'long' })} de ${dataAbastecimento.getFullYear()}`;
        }
        
        if (!dadosAgrupados[chave]) {
            dadosAgrupados[chave] = {
                chave: chave,
                nome: nomeExibicao,
                totalLitros: 0,
                totalGasto: 0,
                totalKm: 0,
                abastecimentos: []
            };
        }
        
        // Adicionar dados deste abastecimento
        const distancia = a.kmFinal - a.kmInicial;
        dadosAgrupados[chave].totalLitros += parseFloat(a.litros);
        dadosAgrupados[chave].totalGasto += a.valorTotal;
        dadosAgrupados[chave].totalKm += distancia;
        dadosAgrupados[chave].abastecimentos.push(a);
    });
    
    // Calcular indicadores adicionais
    Object.values(dadosAgrupados).forEach(dados => {
        dados.mediaConsumo = dados.totalLitros > 0 ? 
            (dados.totalKm / dados.totalLitros).toFixed(2) : 'N/A';
        dados.custoMedio = dados.totalKm > 0 ? 
            (dados.totalGasto / dados.totalKm).toFixed(2) : 'N/A';
        dados.valorMedioLitro = dados.totalLitros > 0 ? 
            (dados.totalGasto / dados.totalLitros).toFixed(2) : 'N/A';
    });
    
    // Ordenar dados pelo gasto total (maior para menor)
    const dadosOrdenados = Object.values(dadosAgrupados).sort((a, b) => b.totalGasto - a.totalGasto);
    
    // Calcular totais gerais
    const totalGeral = {
        litros: dadosOrdenados.reduce((total, dados) => total + dados.totalLitros, 0),
        gasto: dadosOrdenados.reduce((total, dados) => total + dados.totalGasto, 0),
        km: dadosOrdenados.reduce((total, dados) => total + dados.totalKm, 0)
    };
    
    totalGeral.mediaConsumo = totalGeral.litros > 0 ? (totalGeral.km / totalGeral.litros).toFixed(2) : 'N/A';
    totalGeral.custoMedio = totalGeral.km > 0 ? (totalGeral.gasto / totalGeral.km).toFixed(2) : 'N/A';
    
    // Formatar período para exibição
    const mesInicioExibicao = new Date(dataInicio).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const mesFimExibicao = new Date(dataFim).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    
    // Gerar HTML para exibir os resultados
    let html = `
        <h4 class="mb-3">Relatório de Custos - ${mesInicioExibicao} a ${mesFimExibicao}</h4>
        
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <h5 class="card-title">Gasto Total</h5>
                        <h2>R$ ${totalGeral.gasto.toFixed(2)}</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <h5 class="card-title">Total de Combustível</h5>
                        <h2>${totalGeral.litros.toFixed(2)} litros</h2>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-info text-white">
                    <div class="card-body text-center">
                        <h5 class="card-title">Distância Percorrida</h5>
                        <h2>${totalGeral.km.toLocaleString('pt-BR')} km</h2>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="height: 300px;" class="mb-4">
            <canvas id="graficoGastosCustos"></canvas>
        </div>
        
        <div class="table-responsive mb-4">
            <table class="table table-striped table-bordered">
                <thead class="table-primary">
                    <tr>
                        <th>${getTipoAgrupamentoLabel(tipoAgrupamento)}</th>
                        <th>Gasto Total (R$)</th>
                        <th>Combustível (L)</th>
                        <th>Distância (km)</th>
                        <th>Valor Médio/L (R$)</th>
                        <th>Consumo (km/l)</th>
                        <th>Custo por km (R$)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Adicionar linha para cada grupo
    dadosOrdenados.forEach(dados => {
        html += `
            <tr>
                <td>${dados.nome}</td>
                <td>R$ ${dados.totalGasto.toFixed(2)}</td>
                <td>${dados.totalLitros.toFixed(2)}</td>
                <td>${dados.totalKm.toLocaleString('pt-BR')}</td>
                <td>R$ ${dados.valorMedioLitro}</td>
                <td>${dados.mediaConsumo} km/l</td>
                <td>R$ ${dados.custoMedio}</td>
            </tr>
        `;
    });
    
    // Adicionar linha com totais
    html += `
                <tr class="table-secondary fw-bold">
                    <td>TOTAL</td>
                    <td>R$ ${totalGeral.gasto.toFixed(2)}</td>
                    <td>${totalGeral.litros.toFixed(2)}</td>
                    <td>${totalGeral.km.toLocaleString('pt-BR')}</td>
                    <td>R$ ${(totalGeral.gasto / totalGeral.litros).toFixed(2)}</td>
                    <td>${totalGeral.mediaConsumo} km/l</td>
                    <td>R$ ${totalGeral.custoMedio}</td>
                </tr>
            </tbody>
        </table>
    `;
    
    // Adicionar detalhamento se for agrupado por caminhão ou motorista
    if (tipoAgrupamento !== 'mes' && dadosOrdenados.length > 0) {
        html += `<div class="accordion mb-4" id="detalhamentoCustos">`;
        
        dadosOrdenados.forEach((dados, index) => {
            // Agrupar por mês se for caminhão ou motorista
            const abastecimentosPorMes = {};
            
            dados.abastecimentos.forEach(a => {
                const dataAbastecimento = new Date(a.data);
                const chave = `${dataAbastecimento.getFullYear()}-${(dataAbastecimento.getMonth() + 1).toString().padStart(2, '0')}`;
                const nomeMes = dataAbastecimento.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                
                if (!abastecimentosPorMes[chave]) {
                    abastecimentosPorMes[chave] = {
                        nome: nomeMes,
                        totalLitros: 0,
                        totalGasto: 0,
                        totalKm: 0,
                        abastecimentos: []
                    };
                }
                
                const distancia = a.kmFinal - a.kmInicial;
                abastecimentosPorMes[chave].totalLitros += parseFloat(a.litros);
                abastecimentosPorMes[chave].totalGasto += a.valorTotal;
                abastecimentosPorMes[chave].totalKm += distancia;
                abastecimentosPorMes[chave].abastecimentos.push(a);
            });
            
            // Ordenar por mês
            const mesesOrdenados = Object.keys(abastecimentosPorMes).sort();
            
            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapseC${dados.chave}">
                            ${dados.nome} - R$ ${dados.totalGasto.toFixed(2)}
                        </button>
                    </h2>
                    <div id="collapseC${dados.chave}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#detalhamentoCustos">
                        <div class="accordion-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-hover">
                                    <thead>
                                        <tr>
                                            <th>Mês</th>
                                            <th>Gasto (R$)</th>
                                            <th>Litros</th>
                                            <th>Distância (km)</th>
                                            <th>Consumo (km/l)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
            `;
            
            mesesOrdenados.forEach(chaveMes => {
                const dadosMes = abastecimentosPorMes[chaveMes];
                const consumoMes = dadosMes.totalLitros > 0 ? (dadosMes.totalKm / dadosMes.totalLitros).toFixed(2) : 'N/A';
                
                html += `
                    <tr>
                        <td>${dadosMes.nome}</td>
                        <td>R$ ${dadosMes.totalGasto.toFixed(2)}</td>
                        <td>${dadosMes.totalLitros.toFixed(2)}</td>
                        <td>${dadosMes.totalKm.toLocaleString('pt-BR')}</td>
                        <td>${consumoMes} km/l</td>
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
    }
    
    // Exibir resultados
    document.getElementById('relatorioResultados').innerHTML = html;
    
    // Criar gráfico de gastos
    const labels = dadosOrdenados.map(d => d.nome);
    const gastosData = dadosOrdenados.map(d => d.totalGasto);
    
    createCustomChart(
        'graficoGastosCustos',
        'bar',
        labels,
        [{
            label: 'Gasto Total (R$)',
            data: gastosData,
            backgroundColor: chartColors,
            borderColor: chartColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1
        }],
        `Gastos por ${getTipoAgrupamentoLabel(tipoAgrupamento)}`,
        getTipoAgrupamentoLabel(tipoAgrupamento),
        'Valor (R$)'
    );
}

// Exportar relatório para Excel
function exportarRelatorioExcel() {
    const relatorioDiv = document.getElementById('relatorioResultados');
    
    // Verificar se há um relatório gerado
    if (relatorioDiv.querySelector('.alert')) {
        alert('Gere um relatório válido antes de exportar.');
        return;
    }
    
    // Obter todas as tabelas do relatório
    const tabelas = relatorioDiv.querySelectorAll('table');
    if (tabelas.length === 0) {
        alert('Nenhuma tabela encontrada para exportar.');
        return;
    }
    
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
}

// Exportar relatório para PDF
function exportarRelatorioPdf() {
    const relatorioDiv = document.getElementById('relatorioResultados');
    
    // Verificar se há um relatório gerado
    if (relatorioDiv.querySelector('.alert')) {
        alert('Gere um relatório válido antes de exportar.');
        return;
    }
    
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

// Documentar que este script foi carregado (para debugging)
console.log('Relatórios module loaded successfully');
