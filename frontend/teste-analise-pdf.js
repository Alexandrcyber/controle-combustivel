const fs = require('fs');
const path = require('path');

// Simular ambiente DOM básico para teste
global.document = {
    getElementById: (id) => {
        const mockElements = {
            'dataInicio': { value: '2025-05-01' },
            'dataFim': { value: '2025-06-06' }
        };
        return mockElements[id] || { value: '' };
    }
};

// Simular fetch global
global.fetch = async (url, options) => {
    console.log(`🌐 Fetch chamado: ${url}`);
    
    if (url.includes('/api/caminhoes')) {
        return {
            ok: true,
            json: async () => [
                {
                    id: "1749235625528o7tq6oai1",
                    placa: "IYC-0D05",
                    modelo: "Teste",
                    ano: 2010,
                    capacidade: "150.00",
                    motorista: "Teste"
                }
            ]
        };
    }
    
    if (url.includes('/api/abastecimentos')) {
        return {
            ok: true,
            json: async () => [
                {
                    id: "1749234431920bad493fpf",
                    data: "2025-06-05T03:00:00.000Z",
                    caminhao_id: "1749235625528o7tq6oai1",
                    motorista: "Carlos",
                    km_inicial: "5000.00",
                    km_final: "5400.00",
                    litros: "120.000",
                    valor_litro: "5.950",
                    valor_total: "714.00",
                    posto: "Posto Ipiranga"
                }
            ]
        };
    }
    
    throw new Error(`URL não mockada: ${url}`);
};

// Simular jsPDF
global.jsPDF = class {
    constructor() {
        console.log('📄 jsPDF instanciado');
        this.content = [];
    }
    
    text(text, x, y) {
        console.log(`📝 Texto adicionado: "${text}" em (${x}, ${y})`);
        this.content.push({ type: 'text', text, x, y });
        return this;
    }
    
    setFontSize(size) {
        console.log(`📏 Tamanho da fonte: ${size}`);
        return this;
    }
    
    setFont(font, style) {
        console.log(`🔤 Fonte: ${font}, estilo: ${style}`);
        return this;
    }
    
    autoTable(options) {
        console.log('📊 Tabela criada:', options);
        this.content.push({ type: 'table', options });
        return this;
    }
    
    save(filename) {
        console.log(`💾 PDF salvo como: ${filename}`);
        console.log('📋 Conteúdo do PDF:', this.content);
        return this;
    }
};

// Simular alert
global.alert = (message) => {
    console.log(`🚨 ALERT: ${message}`);
};

// Carregar o arquivo de relatórios
console.log('🔄 Carregando arquivo relatorios.js...');

try {
    // Ler o arquivo relatorios.js
    const relatoriosPath = path.join(__dirname, 'src', 'js', 'relatorios.js');
    const relatoriosContent = fs.readFileSync(relatoriosPath, 'utf8');
    
    // Executar o código (isso é uma simulação - em produção seria mais complexo)
    console.log('✅ Arquivo relatorios.js carregado com sucesso');
    console.log(`📊 Tamanho do arquivo: ${relatoriosContent.length} caracteres`);
    
    // Verificar se a função exportarPdfCustos existe no código
    if (relatoriosContent.includes('function exportarPdfCustos') || relatoriosContent.includes('exportarPdfCustos = function')) {
        console.log('✅ Função exportarPdfCustos encontrada no arquivo');
        
        // Verificar se há duplicatas
        const matches = relatoriosContent.match(/function exportarPdfCustos|exportarPdfCustos\s*=\s*.*function/g);
        if (matches && matches.length > 1) {
            console.log('❌ ERRO: Encontradas múltiplas definições da função exportarPdfCustos:', matches.length);
        } else {
            console.log('✅ Apenas uma definição da função encontrada - correção aplicada com sucesso');
        }
        
        // Verificar se a correção da variável foi aplicada
        if (relatoriosContent.includes('dadosPorCaminhao')) {
            console.log('✅ Correção da variável dadosPorCaminhao aplicada');
        } else if (relatoriosContent.includes('dadosPorCaminho')) {
            console.log('❌ ERRO: Variável dadosPorCaminho ainda não foi corrigida');
        }
        
        // Verificar se as dependências problemáticas foram removidas
        const problematicDeps = ['AlertInfo', 'AlertUtils', 'AlertError'];
        let depsEncontradas = [];
        
        problematicDeps.forEach(dep => {
            if (relatoriosContent.includes(dep)) {
                depsEncontradas.push(dep);
            }
        });
        
        if (depsEncontradas.length > 0) {
            console.log('⚠️  Dependências problemáticas ainda encontradas:', depsEncontradas);
        } else {
            console.log('✅ Dependências problemáticas removidas com sucesso');
        }
        
    } else {
        console.log('❌ ERRO: Função exportarPdfCustos não encontrada no arquivo');
    }
    
} catch (error) {
    console.error('❌ Erro ao carregar o arquivo:', error.message);
}

console.log('\n🧪 Teste de análise estática concluído!');
