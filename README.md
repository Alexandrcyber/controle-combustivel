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
  - Controle de períodos com data inicial e final

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
- PostgreSQL para armazenamento persistente de dados (opcional)
- Node.js e pg (node-postgres) para conexão com banco de dados
- LocalStorage para persistência de dados local (fallback)

## Como Usar

Há duas formas de utilizar o sistema:

### 1. Modo Simples (Sem PostgreSQL)

1. Clone este repositório ou baixe os arquivos
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Os dados serão armazenados no localStorage do navegador

### 2. Modo Avançado (Com PostgreSQL)

1. Clone este repositório ou baixe os arquivos
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o PostgreSQL:
   - Instale o PostgreSQL e crie um banco de dados chamado `controle_combustivel`
   - Edite o arquivo `config.json` com suas credenciais

4. Inicie o servidor Node.js:
   ```bash
   npm run server
   ```

5. Acesse o sistema pelo navegador em:
   ```
   http://localhost:3000
   ```

Ao iniciar pela primeira vez, será oferecida a opção de carregar dados de exemplo. Navegue entre as diferentes seções através do menu superior.

## Persistência de Dados

O sistema utiliza o armazenamento local do navegador (localStorage) para salvar todos os dados. Isso significa que:

- Os dados ficarão salvos mesmo após fechar o navegador
- Não é necessário um servidor de banco de dados (na configuração padrão)
- Os dados são armazenados apenas no dispositivo em que o sistema é utilizado

**Observação:** Para compartilhar dados entre dispositivos, utilize as funcionalidades de exportação ou configure a conexão com PostgreSQL.

## Nova Funcionalidade: Suporte ao PostgreSQL

O sistema agora oferece suporte ao armazenamento em banco de dados PostgreSQL, permitindo:

- Compartilhamento de dados entre múltiplos dispositivos
- Capacidade para grandes volumes de dados
- Maior segurança e persistência de dados
- Backup e restauração facilitados
- Suporte para PostgreSQL local e Neon PostgreSQL (serviço na nuvem)

### Configuração do PostgreSQL Local

1. **Instalação do PostgreSQL**
   - Faça o download e instale o PostgreSQL em [postgresql.org/download](https://www.postgresql.org/download/)
   - Durante a instalação, defina uma senha para o usuário `postgres`

2. **Criação do Banco de Dados**
   ```sql
   CREATE DATABASE controle_combustivel;
   ```

3. **Configuração da Conexão**
   - Edite o arquivo `config.json` na raiz do projeto com suas credenciais:
   ```json
   {
       "postgresql": {
           "user": "postgres",
           "host": "localhost",
           "database": "controle_combustivel",
           "password": "sua_senha_aqui",
           "port": 5432
       },
       "neon": {
           "enabled": false,
           "user": "seu_usuario_neon",
           "host": "seu_endpoint_neon.cloud.neon.tech",
           "database": "controle_combustivel",
           "password": "sua_senha_neon",
           "port": 5432,
           "ssl": true
       }
   }
   ```

### Configuração do Neon PostgreSQL (Opcional)

O sistema também suporta conexão com o Neon PostgreSQL, um serviço de banco de dados PostgreSQL na nuvem:

1. **Crie uma conta no Neon**
   - Acesse [neon.tech](https://neon.tech) e crie uma conta gratuita
   - Crie um novo projeto e banco de dados chamado `controle_combustivel`
   - Obtenha as credenciais de conexão (usuário, senha, host)

2. **Configure o arquivo `config.json`**
   - Preencha os dados na seção "neon" conforme obtidos no painel do Neon
   - Altere o parâmetro `enabled` para `true` para usar o Neon em vez do PostgreSQL local

3. **Ative SSL para Conexão Segura**
   - A conexão com o Neon requer SSL, que já está configurado por padrão no sistema

### Scripts Úteis para Gestão do Banco de Dados

O sistema oferece ferramentas de linha de comando para facilitar a gestão do banco de dados:

1. **Verificar Conexão com PostgreSQL**
   ```bash
   npm run check-db
   ```
   Este comando testa a conexão com o banco de dados configurado (local ou Neon) e verifica
   se as tabelas necessárias existem.

2. **Migrar Dados do LocalStorage para PostgreSQL**
   ```bash
   npm run migrate-db
   ```
   Este comando ajuda a transferir os dados do localStorage do navegador para o banco de dados
   PostgreSQL, útil quando você já possui dados no sistema e deseja migrar para o banco de dados.

3. **Testar Conexão Simples**
   ```bash
   npm run test-db
   ```
   Realiza um teste simples de conexão com o banco de dados.

O sistema tentará conectar-se primeiro ao PostgreSQL na configuração selecionada (local ou Neon). Em caso de falha, utilizará o localStorage como alternativa.

## Recursos Adicionais

- Interface responsiva que funciona em computadores, tablets e smartphones
- Design moderno e intuitivo
- Cálculos automáticos de consumo e custos
- Gráficos interativos para análise visual dos dados

## Limitações do Armazenamento Local

- O localStorage tem limite de aproximadamente 5MB em muitos navegadores
- Os dados são armazenados apenas no dispositivo/navegador atual
- Limpar o cache do navegador pode resultar na perda dos dados

Para operações com grandes volumes de dados ou necessidade de compartilhamento entre dispositivos, recomendamos utilizar a configuração com PostgreSQL conforme descrito acima.

## Estrutura do Banco de Dados PostgreSQL

O banco de dados consiste em duas tabelas principais:

### Tabela `caminhoes`
- `id`: Identificador único (chave primária)
- `placa`: Placa do caminhão
- `modelo`: Modelo do caminhão
- `ano`: Ano de fabricação
- `capacidade`: Capacidade do tanque em litros
- `motorista`: Nome do motorista designado (opcional)

### Tabela `abastecimentos`
- `id`: Identificador único (chave primária)
- `data`: Data do abastecimento
- `periodo_inicio`: Data de início do período
- `periodo_fim`: Data de fim do período
- `caminhao_id`: Referência ao caminhão (chave estrangeira)
- `motorista`: Nome do motorista
- `km_inicial`: Quilometragem inicial
- `km_final`: Quilometragem final
- `litros`: Quantidade de litros abastecidos
- `valor_litro`: Valor por litro
- `valor_total`: Valor total do abastecimento
- `posto`: Nome do posto (opcional)
- `observacoes`: Observações adicionais (opcional)
