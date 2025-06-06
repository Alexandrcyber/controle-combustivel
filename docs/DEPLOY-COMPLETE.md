# Guia Completo de Deployment - Controle de Combustível

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Deploy Local](#deploy-local)
4. [Deploy em Servidor](#deploy-em-servidor)
5. [Deploy com Docker](#deploy-com-docker)
6. [Monitoramento](#monitoramento)
7. [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

### Sistema Operacional
- **Linux/Ubuntu**: Recomendado para produção
- **Windows**: Desenvolvimento e produção local
- **macOS**: Desenvolvimento

### Software Necessário
```bash
# Node.js (versão 16 ou superior)
node --version  # >= 16.0.0
npm --version   # >= 8.0.0

# PostgreSQL (versão 12 ou superior)
psql --version  # >= 12.0

# Git
git --version

# PM2 (para produção)
npm install -g pm2

# Nginx (para proxy reverso)
nginx -v
```

## ⚙️ Configuração do Ambiente

### 1. Clone do Repositório
```bash
git clone https://github.com/AlexandreLiberatto/controle-de-combustivel.git
cd controle-de-combustivel
```

### 2. Configuração Automática
```bash
# Setup completo do projeto
npm run setup

# Ou manual:
npm run install:all
cp .env.example .env
```

### 3. Configuração do Banco de Dados
```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar database
CREATE DATABASE controle_combustivel;
CREATE USER combustivel_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE controle_combustivel TO combustivel_user;
```

### 4. Variáveis de Ambiente (.env)
```env
# Ambiente
NODE_ENV=production
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=controle_combustivel
DB_USER=combustivel_user
DB_PASSWORD=sua_senha_segura
DB_SSL=false

# Segurança
JWT_SECRET=sua_chave_jwt_muito_segura_aqui
SESSION_SECRET=sua_chave_sessao_muito_segura_aqui
CORS_ORIGIN=https://seudominio.com

# Features
ENABLE_CORS=true
ENABLE_RATE_LIMIT=true
ENABLE_COMPRESSION=true
ENABLE_HELMET=true

# Logs
LOG_LEVEL=info
LOG_FILE=true

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_email

# URLs
FRONTEND_URL=https://seudominio.com
BACKEND_URL=https://api.seudominio.com
```

## 🚀 Deploy Local

### Desenvolvimento
```bash
# Iniciar em modo desenvolvimento
npm run dev

# Ou separadamente:
npm run dev:backend  # Porta 3001
npm run dev:frontend # Porta 3000
```

### Produção Local
```bash
# Build do projeto
npm run build:prod

# Executar migrações
npm run migrate

# Iniciar em produção
npm run prod:start
```

## 🌐 Deploy em Servidor

### 1. Preparação do Servidor (Ubuntu)
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2
sudo npm install -g pm2
```

### 2. Deploy da Aplicação
```bash
# Clonar projeto
git clone https://github.com/AlexandreLiberatto/controle-de-combustivel.git
cd controle-de-combustivel

# Configurar ambiente
npm run setup
cp .env.example .env
# Editar .env com configurações de produção

# Build
npm run build:prod

# Executar migrações
npm run migrate

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Configuração do Nginx
```nginx
# /etc/nginx/sites-available/controle-combustivel
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Frontend
    location / {
        root /var/www/controle-combustivel/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 4. Ativar Site
```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/controle-combustivel /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl reload nginx
```

## 🐳 Deploy com Docker

### 1. Dockerfile - Backend
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15-alpine
    container_name: combustivel_db
    environment:
      POSTGRES_DB: controle_combustivel
      POSTGRES_USER: combustivel_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - combustivel_network
    restart: unless-stopped

  # Backend
  backend:
    build: ./backend
    container_name: combustivel_backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: controle_combustivel
      DB_USER: combustivel_user
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    networks:
      - combustivel_network
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  # Frontend (Nginx)
  frontend:
    image: nginx:alpine
    container_name: combustivel_frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - combustivel_network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  combustivel_network:
    driver: bridge
```

### 3. Deploy com Docker
```bash
# Build e iniciar
docker-compose up -d

# Executar migrações
docker-compose exec backend npm run migrate

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## 📊 Monitoramento

### 1. PM2 Monitoring
```bash
# Status dos processos
pm2 status

# Logs em tempo real
pm2 logs

# Monitoramento
pm2 monit

# Restart aplicação
pm2 restart all
```

### 2. Health Checks
```javascript
// healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: 3001,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.end();
```

### 3. Logs
```bash
# Ver logs do sistema
tail -f logs/app.log
tail -f logs/error.log

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Database
```bash
# Verificar status PostgreSQL
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U combustivel_user -d controle_combustivel

# Verificar configurações
cat .env | grep DB_
```

#### 2. Porta já em uso
```bash
# Verificar processos na porta
sudo lsof -i :3001
sudo netstat -tulpn | grep :3001

# Matar processo
sudo kill -9 PID
```

#### 3. Permissões de arquivo
```bash
# Corrigir permissões
sudo chown -R $USER:$USER /var/www/controle-combustivel
chmod -R 755 /var/www/controle-combustivel
```

#### 4. SSL/HTTPS Issues
```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew

# Testar SSL
openssl s_client -connect seudominio.com:443
```

### Scripts de Diagnóstico
```bash
# Verificar sistema completo
npm run test:all

# Verificar conectividade
curl -f http://localhost:3001/health

# Verificar database
npm run migrate:status
```

## 📱 Contato

**Desenvolvedor:** Alexandre Liberatto  
**WhatsApp:** 48991604054  
**GitHub:** [AlexandreLiberatto](https://github.com/AlexandreLiberatto)

## 📝 Notas Importantes

1. **Backup Regular**: Configure backup automático do banco de dados
2. **Monitoramento**: Implemente alertas para falhas de sistema
3. **Atualizações**: Mantenha dependências sempre atualizadas
4. **Segurança**: Revise configurações de segurança regularmente
5. **Performance**: Monitore uso de recursos e otimize conforme necessário

---

*Último update: 5 de junho de 2025*
