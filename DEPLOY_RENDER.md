# Deploy no Render - Sistema de Controle de Combustível

## Configuração para Deploy

### 1. Preparação do Projeto

O projeto está configurado para deploy no Render com as seguintes configurações:

- **Build Command**: `npm install && cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Node Version**: >=16.0.0

### 2. Arquivo de Configuração

O arquivo `render.yaml` na raiz do projeto contém todas as configurações necessárias.

### 3. Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no dashboard do Render:

#### Obrigatórias:
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require`
- `JWT_SECRET=your-super-secret-jwt-key`
- `API_KEY=your-api-key`

#### Opcionais:
- `CORS_ORIGIN=https://seu-frontend.vercel.app`
- `LOG_LEVEL=info`
- `BACKEND_HOST=0.0.0.0`
- `BACKEND_PORT=3001`

### 4. Estrutura do Comando no Render

Se você não usar o arquivo `render.yaml`, configure manualmente:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment**: Node.js
- **Node Version**: 18.x ou superior

### 5. Banco de Dados

Certifique-se de que:
- O banco PostgreSQL está acessível
- A URL de conexão está correta
- SSL está habilitado (`DB_SSL=true`)

### 6. Resolução de Problemas Comuns

#### Erro "Cannot find module"
- Verifique se o comando de start está correto: `cd backend && npm start`
- Certifique-se de que as dependências do backend estão instaladas

#### Erro de conexão com banco
- Verifique a `DATABASE_URL`
- Confirme que o banco permite conexões externas
- Verifique se o SSL está configurado corretamente

#### Erro de porta
- O Render define automaticamente a variável `PORT`
- Não é necessário configurar `BACKEND_PORT` no Render

### 7. Comandos Úteis para Debug

```bash
# Verificar se as dependências estão corretas
npm run build

# Testar localmente com configurações de produção
NODE_ENV=production npm start

# Verificar estrutura do projeto
ls -la backend/
```

### 8. Logs

Para verificar logs no Render:
1. Acesse o dashboard do seu serviço
2. Vá para a aba "Logs"
3. Monitore os logs de deploy e runtime
