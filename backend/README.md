# Backend - Sistema de Controle de Combustível

API REST em Node.js com Express e PostgreSQL para gerenciamento de caminhões e abastecimentos.

## 🚀 Instalação e Configuração

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

### 3. Configurar PostgreSQL

#### Opção A: PostgreSQL Local
```sql
-- Criar banco de dados
CREATE DATABASE controle_combustivel;
```

#### Opção B: Neon PostgreSQL (Cloud)
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta e um novo projeto
3. Configure as variáveis de ambiente no `.env`

### 4. Executar Migrações
```bash
# Testar conexão
npm run db:test

# Verificar status das migrações
npm run migrate:status

# Executar todas as migrações pendentes
npm run migrate
```

### 5. Iniciar Servidor
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

## 🗃️ Sistema de Migrações

O sistema utiliza um mecanismo de migrações similar ao Spring Boot para gerenciar automaticamente a estrutura do banco de dados.

### Comandos de Migração

```bash
# Executar todas as migrações pendentes
npm run migrate

# Verificar status das migrações
npm run migrate:status

# Reverter uma migração específica (apenas remove o registro)
npm run migrate:rollback 1.2.0

# Testar conexão com o banco
npm run db:test
```

### CLI de Migrações

Você também pode usar o CLI diretamente:

```bash
# Executar migrações
node cli-migrate.js migrate

# Ver status
node cli-migrate.js status

# Ver ajuda
node cli-migrate.js help
```

### Estrutura das Migrações

As migrações são versionadas e executadas automaticamente:

- **1.0.0**: Criação das tabelas base (caminhoes, abastecimentos)
- **1.1.0**: Adição de triggers e campos de status
- **1.2.0**: Campos para controle de manutenção
- **1.3.0**: Campos para controle de documentação

### Adicionando Novas Migrações

Para adicionar uma nova migração, edite o arquivo `migrations.js`:

```javascript
{
    version: '1.4.0',
    description: 'Sua nova funcionalidade',
    up: async () => {
        // Sua lógica de migração aqui
        await addColumnIfNotExists('tabela', 'nova_coluna', 'VARCHAR(100)');
    }
}
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `caminhoes`
- `id`: Identificador único
- `placa`: Placa do veículo (único)
- `modelo`: Modelo do caminhão
- `ano`: Ano de fabricação
- `capacidade`: Capacidade do tanque
- `motorista`: Motorista designado
- `status`: Status do veículo (ativo/inativo)
- `observacoes`: Observações gerais
- `created_at`, `updated_at`: Timestamps

#### `abastecimentos`
- `id`: Identificador único
- `caminhao_id`: Referência ao caminhão
- `data`: Data do abastecimento
- `periodo_inicio`, `periodo_fim`: Período do consumo
- `motorista`: Motorista responsável
- `km_inicial`, `km_final`: Quilometragem
- `litros`: Quantidade abastecida
- `valor_litro`, `valor_total`: Valores
- `posto`: Posto de combustível
- `observacoes`: Observações
- `created_at`, `updated_at`: Timestamps

#### `schema_migrations` (Sistema)
- `id`: ID auto-incremento
- `version`: Versão da migração
- `applied_at`: Data/hora da aplicação
- `description`: Descrição da migração

### Tabelas Futuras (Migrações 1.2.0+)

#### `manutencoes`
- Histórico de manutenções dos veículos

#### `documentos`
- Controle de documentação dos veículos

## 🔧 API Endpoints

### Caminhões
- `GET /api/caminhoes` - Listar todos
- `GET /api/caminhoes/:id` - Buscar por ID
- `POST /api/caminhoes` - Criar novo
- `PUT /api/caminhoes/:id` - Atualizar
- `DELETE /api/caminhoes/:id` - Excluir

### Abastecimentos
- `GET /api/abastecimentos` - Listar todos
- `GET /api/abastecimentos/:id` - Buscar por ID
- `POST /api/abastecimentos` - Criar novo
- `PUT /api/abastecimentos/:id` - Atualizar
- `DELETE /api/abastecimentos/:id` - Excluir

### Relatórios
- `GET /api/relatorios/consumo` - Relatório de consumo
- `GET /api/relatorios/custos` - Relatório de custos

## 🛠️ Desenvolvimento

### Estrutura de Arquivos
```
backend/
├── server.js              # Servidor principal
├── database.js            # Configuração do banco
├── migrations.js          # Sistema de migrações
├── cli-migrate.js         # CLI para migrações
├── controllers/           # Controllers da API
├── routes/               # Definição das rotas
├── middleware/           # Middlewares customizados
├── package.json          # Dependências
└── .env.example          # Exemplo de configuração
```

### Logs
O sistema registra automaticamente:
- Execução de migrações
- Conexões com o banco
- Erros e operações importantes

### Boas Práticas
- Sempre teste as migrações em ambiente de desenvolvimento
- Faça backup do banco antes de aplicar migrações em produção
- Use transações para operações críticas
- Mantenha o arquivo `.env` seguro e fora do controle de versão

## 🚀 Deploy

### Variáveis de Ambiente Necessárias
```bash
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=controle_combustivel
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SSL=true
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Comandos de Deploy
```bash
# Instalar dependências
npm ci --only=production

# Executar migrações
npm run migrate

# Iniciar aplicação
npm start
```
