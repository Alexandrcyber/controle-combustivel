// Exportar relatório de despesas para PDF
async function exportarPdfDespesas() {
    console.log('🚀 Iniciando geração de PDF de despesas...');
    
    try {
        // Capturar dados do formulário
        const dataInicio = document.getElementById('despesasDataInicio')?.value;
        const dataFim = document.getElementById('despesasDataFim')?.value;

        // Validar se as datas estão preenchidas
        if (!dataInicio || !dataFim) {
            AlertError.validation('Por favor, selecione o período para gerar o relatório de despesas.');
            return;
        }

        // Acessar dados
        const despesasDados = window.despesas || [];
        
        console.log('📊 Dados disponíveis para PDF:', {
            despesas: despesasDados.length,
            periodo: { inicio: dataInicio, fim: dataFim }
        });
        
        // Verificar se há dados
        if (despesasDados.length === 0) {
            console.error('❌ Não há despesas cadastradas');
            AlertError.show(
                'Dados Insuficientes',
                'Não há despesas cadastradas. Por favor, cadastre pelo menos uma despesa.'
            );
            return;
        }
        
        // Filtrar por período
        let despesasFiltradas = despesasDados.filter(d => {
            const dData = d.data.split('T')[0];
            return dData >= dataInicio && dData <= dataFim;
        }).sort((a, b) => new Date(a.data) - new Date(b.data));
        
        if (despesasFiltradas.length === 0) {
            console.warn('⚠️ Nenhuma despesa encontrada no período');
            AlertWarning.noData('Nenhuma despesa foi encontrada no período selecionado.');
            return;
        }

        // Calcular valor total
        let totalValor = 0;
        despesasFiltradas.forEach(d => {
            const valor = garantirNumero(d.valor, 0);
            totalValor += valor;
        });

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
        adicionarTextoPDF(doc, 'RELATÓRIO DE DESPESAS GERAIS', 105, 20, { align: 'center' });
        
        // Subtítulo
        doc.setFontSize(11);
        adicionarTextoPDF(doc, 'Sistema de Controle de Despesas', 105, 28, { align: 'center' });
        
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
        adicionarTextoPDF(doc, 'RESUMO FINANCEIRO', 105, yPos + 5, { align: 'center' });
        
        yPos += 12;
        
        // Informações resumidas
        doc.setTextColor(...cores.cinzaEscuro);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        // Categorias mais comuns
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
        
        adicionarTextoPDF(doc, `Total de Despesas: R$ ${formatarMoeda(totalValor)}`, 20, yPos + 6);
        adicionarTextoPDF(doc, `Quantidade de Registros: ${despesasFiltradas.length}`, 20, yPos + 14);
        
        if (categoriasOrdenadas.length > 0) {
            adicionarTextoPDF(doc, `Categorias Principais:`, 120, yPos + 6, { align: 'left' });
            
            categoriasOrdenadas.forEach((cat, idx) => {
                const porcentagem = Math.round((cat[1] / totalValor) * 100);
                adicionarTextoPDF(doc, `${cat[0]}: R$ ${formatarMoeda(cat[1])} (${porcentagem}%)`, 120, yPos + 14 + (idx * 7), { align: 'left' });
            });
        }
        
        yPos += 40;

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
            fornecedor: d.fornecedor,
            descricao: d.descricao,
            categoria: d.categoria,
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
