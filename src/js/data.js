// Dados de exemplo para demonstração
const dadosExemplo = {
    caminhoes: [
        {
            id: 1,
            placa: 'ABC-1234',
            modelo: 'Volvo FH 460',
            ano: 2020,
            capacidade: 600,
            motorista: 'João Silva'
        },
        {
            id: 2,
            placa: 'DEF-5678',
            modelo: 'Scania R450',
            ano: 2019,
            capacidade: 550,
            motorista: 'Carlos Oliveira'
        },
        {
            id: 3,
            placa: 'GHI-9012',
            modelo: 'Mercedes-Benz Actros 2651',
            ano: 2021,
            capacidade: 650,
            motorista: 'Pedro Santos'
        },
        {
            id: 4,
            placa: 'JKL-3456',
            modelo: 'DAF XF 105',
            ano: 2018,
            capacidade: 580,
            motorista: 'Rafael Pereira'
        }
    ],
    abastecimentos: [
        // Abastecimentos para o caminhão 1
        {
            id: 1,
            data: '2025-04-02',
            caminhaoId: 1,
            motorista: 'João Silva',
            kmInicial: 10000,
            kmFinal: 10500,
            litros: 180,
            valorLitro: 5.79,
            valorTotal: 1042.20,
            posto: 'Posto Ipiranga',
            observacoes: 'Abastecimento rotineiro'
        },
        {
            id: 2,
            data: '2025-04-15',
            caminhaoId: 1,
            motorista: 'João Silva',
            kmInicial: 10500,
            kmFinal: 11200,
            litros: 230,
            valorLitro: 5.82,
            valorTotal: 1338.60,
            posto: 'Posto Shell',
            observacoes: 'Viagem longa para São Paulo'
        },
        {
            id: 3,
            data: '2025-05-03',
            caminhaoId: 1,
            motorista: 'João Silva',
            kmInicial: 11200,
            kmFinal: 11800,
            litros: 210,
            valorLitro: 5.75,
            valorTotal: 1207.50,
            posto: 'Posto Petrobras',
            observacoes: ''
        },
        {
            id: 4,
            data: '2025-05-20',
            caminhaoId: 1,
            motorista: 'João Silva',
            kmInicial: 11800,
            kmFinal: 12300,
            litros: 195,
            valorLitro: 5.80,
            valorTotal: 1131.00,
            posto: 'Posto Ipiranga',
            observacoes: 'Manutenção realizada'
        },
        
        // Abastecimentos para o caminhão 2
        {
            id: 5,
            data: '2025-04-05',
            caminhaoId: 2,
            motorista: 'Carlos Oliveira',
            kmInicial: 15000,
            kmFinal: 15600,
            litros: 210,
            valorLitro: 5.79,
            valorTotal: 1215.90,
            posto: 'Posto Shell',
            observacoes: ''
        },
        {
            id: 6,
            data: '2025-04-18',
            caminhaoId: 2,
            motorista: 'Carlos Oliveira',
            kmInicial: 15600,
            kmFinal: 16200,
            litros: 220,
            valorLitro: 5.82,
            valorTotal: 1280.40,
            posto: 'Posto Petrobras',
            observacoes: 'Rota alternativa devido a obras'
        },
        {
            id: 7,
            data: '2025-05-06',
            caminhaoId: 2,
            motorista: 'Carlos Oliveira',
            kmInicial: 16200,
            kmFinal: 16800,
            litros: 215,
            valorLitro: 5.75,
            valorTotal: 1236.25,
            posto: 'Posto Ipiranga',
            observacoes: ''
        },
        {
            id: 8,
            data: '2025-05-24',
            caminhaoId: 2,
            motorista: 'Carlos Oliveira',
            kmInicial: 16800,
            kmFinal: 17400,
            litros: 208,
            valorLitro: 5.80,
            valorTotal: 1206.40,
            posto: 'Posto Shell',
            observacoes: ''
        },
        
        // Abastecimentos para o caminhão 3
        {
            id: 9,
            data: '2025-04-03',
            caminhaoId: 3,
            motorista: 'Pedro Santos',
            kmInicial: 5000,
            kmFinal: 5600,
            litros: 210,
            valorLitro: 5.79,
            valorTotal: 1215.90,
            posto: 'Posto Petrobras',
            observacoes: 'Primeiro abastecimento após revisão'
        },
        {
            id: 10,
            data: '2025-04-17',
            caminhaoId: 3,
            motorista: 'Pedro Santos',
            kmInicial: 5600,
            kmFinal: 6250,
            litros: 240,
            valorLitro: 5.82,
            valorTotal: 1396.80,
            posto: 'Posto Shell',
            observacoes: ''
        },
        {
            id: 11,
            data: '2025-05-05',
            caminhaoId: 3,
            motorista: 'Pedro Santos',
            kmInicial: 6250,
            kmFinal: 6900,
            litros: 230,
            valorLitro: 5.75,
            valorTotal: 1322.50,
            posto: 'Posto Ipiranga',
            observacoes: 'Tráfego intenso na rodovia'
        },
        {
            id: 12,
            data: '2025-05-22',
            caminhaoId: 3,
            motorista: 'Pedro Santos',
            kmInicial: 6900,
            kmFinal: 7500,
            litros: 220,
            valorLitro: 5.80,
            valorTotal: 1276.00,
            posto: 'Posto Petrobras',
            observacoes: ''
        },
        
        // Abastecimentos para o caminhão 4
        {
            id: 13,
            data: '2025-04-08',
            caminhaoId: 4,
            motorista: 'Rafael Pereira',
            kmInicial: 20000,
            kmFinal: 20650,
            litros: 215,
            valorLitro: 5.79,
            valorTotal: 1244.85,
            posto: 'Posto Shell',
            observacoes: ''
        },
        {
            id: 14,
            data: '2025-04-22',
            caminhaoId: 4,
            motorista: 'Rafael Pereira',
            kmInicial: 20650,
            kmFinal: 21300,
            litros: 225,
            valorLitro: 5.82,
            valorTotal: 1309.50,
            posto: 'Posto Ipiranga',
            observacoes: 'Reabastecimento durante viagem longa'
        },
        {
            id: 15,
            data: '2025-05-10',
            caminhaoId: 4,
            motorista: 'Rafael Pereira',
            kmInicial: 21300,
            kmFinal: 21950,
            litros: 220,
            valorLitro: 5.75,
            valorTotal: 1265.00,
            posto: 'Posto Petrobras',
            observacoes: ''
        },
        {
            id: 16,
            data: '2025-05-28',
            caminhaoId: 4,
            motorista: 'Rafael Pereira',
            kmInicial: 21950,
            kmFinal: 22600,
            litros: 218,
            valorLitro: 5.80,
            valorTotal: 1264.40,
            posto: 'Posto Shell',
            observacoes: 'Problemas na estrada, desvio longo'
        },
        
        // Abastecimentos do mês atual (junho/2025)
        {
            id: 17,
            data: '2025-06-01',
            caminhaoId: 1,
            motorista: 'João Silva',
            kmInicial: 12300,
            kmFinal: 12950,
            litros: 205,
            valorLitro: 5.85,
            valorTotal: 1199.25,
            posto: 'Posto Petrobras',
            observacoes: 'Início do mês'
        },
        {
            id: 18,
            data: '2025-06-01',
            caminhaoId: 2,
            motorista: 'Carlos Oliveira',
            kmInicial: 17400,
            kmFinal: 18050,
            litros: 225,
            valorLitro: 5.85,
            valorTotal: 1316.25,
            posto: 'Posto Shell',
            observacoes: ''
        },
        {
            id: 19,
            data: '2025-06-02',
            caminhaoId: 3,
            motorista: 'Pedro Santos',
            kmInicial: 7500,
            kmFinal: 8150,
            litros: 235,
            valorLitro: 5.85,
            valorTotal: 1374.75,
            posto: 'Posto Ipiranga',
            observacoes: ''
        },
        {
            id: 20,
            data: '2025-06-03',
            caminhaoId: 4,
            motorista: 'Rafael Pereira',
            kmInicial: 22600,
            kmFinal: 23250,
            litros: 220,
            valorLitro: 5.85,
            valorTotal: 1287.00,
            posto: 'Posto Petrobras',
            observacoes: 'Abastecimento recente'
        }
    ]
};

// Função para carregar dados de exemplo
function carregarDadosExemplo() {
    // Verificar se já existem dados salvos
    const dadosSalvos = localStorage.getItem('caminhoes') || localStorage.getItem('abastecimentos');
    
    // Se não existirem dados, carregar os dados de exemplo
    if (!dadosSalvos) {
        localStorage.setItem('caminhoes', JSON.stringify(dadosExemplo.caminhoes));
        localStorage.setItem('abastecimentos', JSON.stringify(dadosExemplo.abastecimentos));
        
        console.log('Dados de exemplo carregados com sucesso!');
        
        // Recarregar a página para atualizar a interface
        window.location.reload();
    }
}

// Adicionar evento para carregar dados de exemplo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existem dados
    const dadosSalvos = localStorage.getItem('caminhoes') || localStorage.getItem('abastecimentos');
    
    // Se não existirem dados, perguntar se deseja carregar os dados de exemplo
    if (!dadosSalvos) {
        if (confirm('Deseja carregar dados de exemplo para demonstração?')) {
            carregarDadosExemplo();
        }
    }
    
    // Adicionar botão para carregar dados de exemplo no rodapé
    const footer = document.querySelector('footer .container');
    if (footer) {
        const loadDataBtn = document.createElement('button');
        loadDataBtn.className = 'btn btn-sm btn-outline-secondary mt-2';
        loadDataBtn.textContent = 'Carregar Dados de Exemplo';
        loadDataBtn.addEventListener('click', () => {
            if (confirm('Isso substituirá quaisquer dados existentes. Deseja continuar?')) {
                carregarDadosExemplo();
            }
        });
        
        footer.appendChild(document.createElement('br'));
        footer.appendChild(loadDataBtn);
    }
});
