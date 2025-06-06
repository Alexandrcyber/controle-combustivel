# 🧪 GUIA DE TESTE DOS RELATÓRIOS - INTERFACE WEB

## 📋 INSTRUÇÕES PARA TESTAR OS RELATÓRIOS

### 🚀 Passo 1: Abrir o Sistema
1. Abra o navegador e vá para: http://localhost:8080
2. Aguarde a página carregar completamente

### 📊 Passo 2: Navegar para Relatórios
1. Clique na aba "Relatórios" no menu principal
2. Aguarde a seção de relatórios aparecer

### 🧪 Passo 3: Testar Relatório de Consumo
1. No formulário "Relatório de Consumo por Período":
   - Data Início: 2025-01-01
   - Data Fim: 2025-12-31
   - Caminhão: Selecione qualquer um da lista
2. Clique no botão "Gerar Relatório"
3. Verifique se o relatório aparece na área de resultados abaixo

### 💰 Passo 4: Testar Relatório de Custos
1. No formulário "Relatório de Custos":
   - Mês Início: 2025-01
   - Mês Fim: 2025-12
   - Tipo de Agrupamento: Selecione "Por Mês"
2. Clique no botão "Gerar Relatório"
3. Verifique se o relatório aparece na área de resultados

### 🔍 Passo 5: Teste Avançado (Console do Navegador)
1. Abra o Console do navegador (F12 → Console)
2. Cole e execute o código do arquivo: `teste-funcoes-rapido.js`
3. Verifique os logs para diagnóstico detalhado

### 📤 Passo 6: Testar Exportação (Opcional)
1. Após gerar um relatório, verifique se os botões "Exportar Excel" e "Exportar PDF" estão habilitados
2. Teste clicar nos botões de exportação

## 🔧 DADOS DISPONÍVEIS PARA TESTE

### 🚚 Caminhões Cadastrados:
- Placa: izx0c26 - Modelo: atego (2019) - Motorista: Ricardo
- Placa: IYC-0D05 - Modelo: Mercedes (2015) - Motorista: Alexandre
- Placa: XYZ5678 - Modelo: Scania R450 (2024) - Motorista: Maria Oliveira

### ⛽ Abastecimentos Cadastrados:
- 2 abastecimentos registrados em junho de 2025
- Valores entre R$ 104,85 e R$ 139,80
- Postos: Zandona e Sim

## ✅ RESULTADOS ESPERADOS

### Para Relatório de Consumo:
- Tabela com dados de consumo por caminhão
- Gráfico de consumo (se implementado)
- Cálculos de km/litro

### Para Relatório de Custos:
- Tabela com custos por período
- Totais e médias
- Gráfico de custos (se implementado)

## 🚨 SINAIS DE PROBLEMA

Se os relatórios NÃO funcionarem, verifique:
1. Console do navegador para erros JavaScript
2. Se os dados estão sendo carregados (window.caminhoes e window.abastecimentos)
3. Se os formulários estão submetendo corretamente
4. Se as funções gerarRelatorioConsumo() e gerarRelatorioCustos() existem

## 📞 PRÓXIMOS PASSOS

Após o teste:
1. ✅ Se funcionar: Relatórios estão operacionais
2. ❌ Se não funcionar: Reportar erros específicos encontrados
3. 🔧 Ajustes necessários com base nos resultados
