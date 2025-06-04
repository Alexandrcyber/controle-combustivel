# Sistema de Controle de Combustível

Um sistema completo para gerenciamento e controle de abastecimento de combustível para frotas de caminhões, similar a uma planilha avançada de Excel, mas com funcionalidades interativas e relatórios dinâmicos.

## Funcionalidades

- **Dashboard Interativo**
  - Visão geral dos dados principais
  - Gráficos de consumo por caminhão
  - Gráficos de gastos mensais
  - Estatísticas e métricas de desempenho

- **Gerenciamento de Caminhões**
  - Cadastro completo de veículos
  - Informações técnicas e de capacidade
  - Média de consumo por caminhão
  - Vínculo com motoristas

- **Registro de Abastecimentos**
  - Controle detalhado de cada abastecimento
  - Cálculo automático de consumo
  - Registro de quilometragem
  - Histórico completo por veículo

- **Relatórios Avançados**
  - Relatórios de consumo por período
  - Relatórios de custos por caminhão ou motorista
  - Comparativo entre veículos
  - Exportação para Excel e PDF

## Tecnologias Utilizadas

- HTML5, CSS3 e JavaScript
- Bootstrap 5 para interface responsiva
- Chart.js para gráficos interativos
- SheetJS para exportação para Excel
- jsPDF para exportação para PDF
- LocalStorage para persistência de dados

## Como Usar

1. Clone este repositório ou baixe os arquivos
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Ao iniciar pela primeira vez, será oferecida a opção de carregar dados de exemplo
4. Navegue entre as diferentes seções através do menu superior
5. Adicione seus próprios caminhões e registros de abastecimento

## Persistência de Dados

O sistema utiliza o armazenamento local do navegador (localStorage) para salvar todos os dados. Isso significa que:

- Os dados ficarão salvos mesmo após fechar o navegador
- Não é necessário um servidor de banco de dados
- Os dados são armazenados apenas no dispositivo em que o sistema é utilizado

**Observação:** Para compartilhar dados entre dispositivos, utilize as funcionalidades de exportação.

## Recursos Adicionais

- Interface responsiva que funciona em computadores, tablets e smartphones
- Design moderno e intuitivo
- Cálculos automáticos de consumo e custos
- Gráficos interativos para análise visual dos dados

## Limitações do Armazenamento Local

- O localStorage tem limite de aproximadamente 5MB em muitos navegadores
- Os dados são armazenados apenas no dispositivo/navegador atual
- Limpar o cache do navegador pode resultar na perda dos dados

Para operações com grandes volumes de dados ou necessidade de compartilhamento entre dispositivos, considere implementar um backend com banco de dados.
