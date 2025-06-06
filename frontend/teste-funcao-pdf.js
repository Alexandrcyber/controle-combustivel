// Teste simples para verificar se a função exportarPdfCompleto está funcionando
console.log('🔍 Verificando funcionalidade PDF Completo...');

// Simular ambiente browser mínimo
global.window = {
    jspdf: {
        jsPDF: function(orientation, unit, format) {
            console.log('✅ jsPDF instanciado:', orientation, unit, format);
            return {
                addPage: () => console.log('✅ Página adicionada'),
                save: (filename) => console.log('✅ PDF salvo como:', filename),
                setFontSize: () => {},
                setTextColor: () => {},
                setFillColor: () => {},
                rect: () => {},
                text: () => {},
                autoTable: () => console.log('✅ Tabela adicionada')
            };
        }
    }
};

// Mock das funções de alerta
global.AlertInfo = {
    loading: (titulo, msg) => console.log(`📢 Loading: ${titulo} - ${msg}`)
};
global.AlertUtils = {
    close: () => console.log('📢 Alert fechado')
};
global.AlertToast = {
    success: (msg) => console.log(`📢 Success: ${msg}`)
};
global.AlertError = {
    show: (titulo, msg) => console.log(`📢 Error: ${titulo} - ${msg}`)
};
global.AlertWarning = {
    show: (titulo, msg) => console.log(`📢 Warning: ${titulo} - ${msg}`)
};

// Dados de teste
global.caminhoes = [
    {"placa": "TST-8888", "modelo": "Scania R450", "ano": 2024, "id": "1"}
];
global.abastecimentos = [
    {"id": "1", "caminhaoId": "1", "data": "2025-06-01", "litros": 50, "valorTotal": 300, "valorLitro": 6, "odometro": 1000, "posto": "Posto Teste"}
];

try {
    // Carregar o arquivo de relatórios
    require('./src/js/relatorios.js');
    console.log('✅ Arquivo relatorios.js carregado com sucesso');
    
    // Verificar se a função existe
    if (typeof exportarPdfCompleto === 'function') {
        console.log('✅ Função exportarPdfCompleto encontrada');
        
        // Tentar executar (pode falhar por dependências do browser)
        console.log('🚀 Tentando executar exportarPdfCompleto...');
        exportarPdfCompleto();
        
    } else {
        console.log('❌ Função exportarPdfCompleto não encontrada');
    }
    
} catch (error) {
    console.log('❌ Erro durante o teste:', error.message);
}

console.log('🏁 Teste finalizado');
