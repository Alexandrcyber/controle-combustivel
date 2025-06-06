# 🚀 Guia de Deploy em Produção

## 📋 Pré-requisitos

- Servidor com Node.js 14+
- NPM ou Yarn
- Domínio configurado
- SSL/HTTPS configurado (recomendado)

## 🔧 Configuração para Produção

### 1. Variáveis de Ambiente

Crie um arquivo `.env` no servidor com as configurações de produção:

```env
# Ambiente
NODE_ENV=production

# Servidor Backend
BACKEND_PORT=8080
BACKEND_HOST=0.0.0.0

# Frontend
FRONTEND_PORT=80
FRONTEND_HOST=0.0.0.0

# API
API_BASE_URL=https://sua-api.com/api

# Banco de Dados
DB_TYPE=json
DB_PATH=/app/data

# CORS (seus domínios)
CORS_ORIGIN=https://seu-frontend.com,https://www.seu-frontend.com

# Segurança (OBRIGATÓRIO - gere chaves seguras)
JWT_SECRET=sua-chave-jwt-super-segura-de-256-bits-ou-mais
SESSION_SECRET=sua-chave-sessao-super-segura-de-256-bits

# Logs
LOG_LEVEL=error
LOG_FILE=/app/logs/production.log
```

### 2. Deploy com PM2 (Recomendado)

#### Instalar PM2
```bash
npm install -g pm2
```

#### Configurar PM2
Crie `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'combustivel-backend',
      script: './backend/server.js',
      cwd: '/caminho/para/controle-de-combustivel',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log'
    },
    {
      name: 'combustivel-frontend',
      script: './frontend/server.js',
      cwd: '/caminho/para/controle-de-combustivel',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log'
    }
  ]
};
```

#### Iniciar aplicações
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Deploy com Docker

#### Dockerfile Backend
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
COPY config/ ./config/
COPY data/ ./data/

RUN cd backend && npm ci --only=production

COPY backend/ ./backend/

EXPOSE 8080

CMD ["node", "backend/server.js"]
```

#### Dockerfile Frontend
```dockerfile
FROM nginx:alpine

COPY frontend/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### 4. Nginx como Proxy Reverso

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seu-dominio.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚀 Processo de Deploy

### Deploy Manual

1. **Preparar servidor**:
```bash
# Clonar repositório
git clone https://github.com/AlexandreLiberatto/controle-de-combustivel.git
cd controle-de-combustivel

# Configurar ambiente
cp .env.example .env
# Editar .env com configurações de produção
```

2. **Instalar dependências**:
```bash
npm run install:all
```

3. **Build da aplicação**:
```bash
npm run build
```

4. **Iniciar aplicação**:
```bash
npm run prod:start
```

### Deploy Automático com GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm run install:all
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /app/controle-de-combustivel
          git pull origin main
          npm run install:all
          npm run build
          pm2 restart combustivel-backend
          pm2 restart combustivel-frontend
```

## 🔒 Segurança em Produção

### 1. Variáveis Sensíveis
- ✅ JWT_SECRET com pelo menos 256 bits
- ✅ SESSION_SECRET único e seguro
- ✅ Variáveis de banco de dados protegidas

### 2. HTTPS Obrigatório
- ✅ Certificado SSL válido
- ✅ Redirecionamento HTTP → HTTPS
- ✅ Headers de segurança

### 3. Firewall
```bash
# Abrir apenas portas necessárias
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 4. Monitoramento
- ✅ Logs centralizados
- ✅ Alertas de erro
- ✅ Monitoramento de recursos
- ✅ Backup automático

## 📊 Monitoramento

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 status
```

### Health Check
- Backend: `https://sua-api.com/api/health`
- Frontend: Página principal carregando

## 🔄 Manutenção

### Backup de Dados
```bash
# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/data_$DATE.tar.gz /app/data/
```

### Atualizações
```bash
# Deploy de nova versão
git pull origin main
npm run install:all
npm run build
pm2 restart all
```

## 🆘 Troubleshooting

### Logs
```bash
# PM2 logs
pm2 logs --lines 100

# Logs da aplicação
tail -f logs/production.log
```

### Problemas Comuns

1. **Erro de conexão API**:
   - Verificar variáveis de ambiente
   - Verificar CORS configuration
   - Verificar firewall

2. **Erro de memória**:
   - Aumentar limit no PM2
   - Verificar memory leaks

3. **SSL/HTTPS**:
   - Verificar certificados
   - Verificar configuração Nginx

---

💡 **Dica**: Sempre teste o deploy em ambiente de staging antes de produção!
