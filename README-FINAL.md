# 🚛 Sistema de Controle de Combustível

> Sistema completo para gerenciamento e controle de abastecimento de combustível para frotas de caminhões

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Características](#-características)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação Rápida](#-instalação-rápida)
- [Desenvolvimento](#-desenvolvimento)
- [Deploy](#-deploy)
- [API Endpoints](#-api-endpoints)
- [Tecnologias](#-tecnologias)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Contato](#-contato)

## 🎯 Visão Geral

O **Sistema de Controle de Combustível** é uma aplicação web completa desenvolvida para empresas que precisam gerenciar frotas de caminhões e controlar gastos com combustível. O sistema oferece funcionalidades avançadas de relatórios, alertas em tempo real e dashboards interativos.

### 🎥 Demo
- **Frontend:** [Demo Online](https://seu-dominio.com)
- **API:** [Documentação da API](https://api.seu-dominio.com/docs)

## ✨ Características

### 🚀 Funcionalidades Principais
- ✅ **Gestão de Caminhões**: Cadastro completo com placa, modelo, ano, capacidade
- ✅ **Controle de Abastecimentos**: Registro detalhado com data, local, valor, quilometragem
- ✅ **Relatórios Avançados**: Consumo por período, eficiência, custos por caminhão
- ✅ **Dashboard Interativo**: Gráficos em tempo real com Chart.js
- ✅ **Alertas Inteligentes**: Notificações de status da API e conexão
- ✅ **Exportação de Dados**: PDF e Excel dos relatórios
- ✅ **Responsivo**: Interface adaptada para mobile e desktop

### 🔧 Características Técnicas
- ✅ **API RESTful**: Backend robusto com Express.js
- ✅ **Banco PostgreSQL**: Persistência confiável com migrações automáticas
- ✅ **Arquitetura Modular**: Separação clara entre frontend/backend
- ✅ **Sistema de Logs**: Monitoramento completo de erros e atividades
- ✅ **Configuração por Ambiente**: Desenvolvimento, staging e produção
- ✅ **Testes Automatizados**: Unit tests, integration tests e E2E
- ✅ **Deploy Automático**: PM2, Docker e Nginx configurados
- ✅ **Segurança**: Rate limiting, CORS, headers de segurança

## 📁 Estrutura do Projeto

```
controle-de-combustivel/
├── 📂 backend/              # API e servidor
│   ├── 📂 controllers/      # Controladores da API
│   ├── 📂 routes/          # Rotas da API  
│   ├── 📂 middleware/      # Middlewares personalizados
│   ├── 📂 models/          # Modelos de dados
│   ├── 📂 utils/           # Utilitários do backend
│   ├── 📄 server.js        # Servidor principal
│   ├── 📄 database.js      # Configuração do banco
│   └── 📄 package.json     # Dependências do backend
├── 📂 frontend/            # Interface do usuário
│   ├── 📂 src/
│   │   ├── 📂 js/          # JavaScript modules
│   │   ├── 📂 css/         # Estilos CSS
│   │   ├── 📂 img/         # Imagens e assets
│   │   ├── 📂 components/  # Componentes reutilizáveis
│   │   └── 📂 utils/       # Utilitários do frontend
│   ├── 📂 dist/            # Build de produção
│   ├── 📄 index.html       # Página principal
│   └── 📄 package.json     # Dependências do frontend
├── 📂 tests/               # Testes automatizados
│   ├── 📂 unit/            # Testes unitários
│   ├── 📂 integration/     # Testes de integração
│   ├── 📂 e2e/             # Testes end-to-end
│   ├── 📂 manual/          # Testes manuais
│   ├── 📂 fixtures/        # Dados de teste
│   ├── 📂 mocks/           # Mocks para testes
│   └── 📂 reports/         # Relatórios de teste
├── 📂 config/              # Configurações
│   ├── 📂 environments/    # Configs por ambiente
│   ├── 📄 index.js         # Config centralizada
│   └── 📄 nginx.conf       # Configuração Nginx
├── 📂 scripts/             # Scripts utilitários
│   ├── 📄 setup-env.js     # Setup de ambiente
│   ├── 📄 install-all.js   # Instalação de dependências
│   ├── 📄 dev.js           # Script de desenvolvimento
│   ├── 📄 cleanup-project.js # Limpeza do projeto
│   └── 📄 validate-project.js # Validação final
├── 📂 docs/                # Documentação
│   ├── 📄 DEPLOY-COMPLETE.md # Guia completo de deploy
│   ├── 📄 API.md           # Documentação da API
│   └── 📄 CONTRIBUTING.md  # Guia de contribuição
├── 📂 logs/                # Logs da aplicação
│   ├── 📂 app/             # Logs da aplicação
│   └── 📂 error/           # Logs de erro
├── 📂 data/                # Dados de exemplo
├── 📄 package.json         # Dependências principais
├── 📄 ecosystem.config.js  # Configuração PM2
├── 📄 .env.example         # Exemplo de variáveis
├── 📄 docker-compose.yml   # Docker setup
└── 📄 README.md            # Esta documentação
```

## 🚀 Instalação Rápida

### Pré-requisitos
- **Node.js** 16+ 
- **PostgreSQL** 12+
- **npm** 8+ ou **yarn**

### 1. Clone e Setup
```bash
# Clone o repositório
git clone https://github.com/AlexandreLiberatto/controle-de-combustivel.git
cd controle-de-combustivel

# Setup automático completo
npm run setup
```

### 2. Configuração do Banco
```bash
# Criar banco PostgreSQL
createdb controle_combustivel

# Configurar .env (copie de .env.example)
cp .env.example .env
# Edite .env com suas configurações
```

### 3. Inicialização
```bash
# Executar migrações
npm run migrate

# Iniciar em desenvolvimento
npm run dev
```

🎉 **Pronto!** Acesse:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 💻 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia backend + frontend
npm run dev:backend      # Apenas backend (porta 3001)
npm run dev:frontend     # Apenas frontend (porta 3000)

# Testes
npm run test             # Todos os testes
npm run test:unit        # Testes unitários
npm run test:integration # Testes de integração
npm run test:e2e         # Testes end-to-end
npm run test:watch       # Testes em modo watch

# Build
npm run build            # Build completo
npm run build:frontend   # Build do frontend
npm run build:prod       # Build de produção

# Database
npm run migrate          # Executar migrações
npm run migrate:status   # Status das migrações
npm run migrate:rollback # Reverter migração

# Utilitários
npm run cleanup          # Limpeza do projeto
npm run lint             # Verificar código
npm run format           # Formatar código
```

### Estrutura de Desenvolvimento

#### Backend (Express.js + PostgreSQL)
```javascript
// Exemplo de controller
const { pool } = require('../database');

const getAllCaminhoes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM caminhoes ORDER BY placa');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
```

#### Frontend (Vanilla JS + Bootstrap)
```javascript
// Exemplo de módulo
class CaminhaoService {
  static async getAll() {
    const response = await fetch('/api/caminhoes');
    return response.json();
  }
  
  static async create(caminhao) {
    const response = await fetch('/api/caminhoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caminhao)
    });
    return response.json();
  }
}
```

## 🌐 Deploy

### Deploy Rápido (PM2)
```bash
# Build de produção
npm run build:prod

# Iniciar com PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Deploy com Docker
```bash
# Build e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Deploy Manual
Consulte o [Guia Completo de Deploy](docs/DEPLOY-COMPLETE.md) para instruções detalhadas.

## 📡 API Endpoints

### Caminhões
```http
GET    /api/caminhoes           # Listar todos
GET    /api/caminhoes/:id       # Buscar por ID
POST   /api/caminhoes           # Criar novo
PUT    /api/caminhoes/:id       # Atualizar
DELETE /api/caminhoes/:id       # Remover
```

### Abastecimentos
```http
GET    /api/abastecimentos      # Listar todos
GET    /api/abastecimentos/:id  # Buscar por ID
POST   /api/abastecimentos      # Criar novo
PUT    /api/abastecimentos/:id  # Atualizar
DELETE /api/abastecimentos/:id  # Remover
```

### Relatórios
```http
GET    /api/relatorios/consumo           # Relatório de consumo
GET    /api/relatorios/custos            # Relatório de custos
GET    /api/relatorios/eficiencia        # Relatório de eficiência
GET    /api/relatorios/export/pdf        # Exportar PDF
GET    /api/relatorios/export/excel      # Exportar Excel
```

### Utilitários
```http
GET    /api/health              # Health check
GET    /api/status              # Status da API
```

**Documentação completa:** [API Documentation](docs/API.md)

## 🛠 Tecnologias

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.18+
- **Banco de Dados**: PostgreSQL 12+
- **ORM**: SQL Nativo com Pool de Conexões
- **Segurança**: Helmet, CORS, Rate Limiting
- **Logs**: Winston
- **Testes**: Jest, Supertest

### Frontend  
- **Base**: HTML5, CSS3, JavaScript ES6+
- **UI Framework**: Bootstrap 5.3
- **Gráficos**: Chart.js 4.0
- **Alertas**: SweetAlert2
- **Build**: Terser, PostCSS
- **Testes**: Jest, Cypress

### DevOps & Infraestrutura
- **Process Manager**: PM2
- **Proxy Reverso**: Nginx
- **Containerização**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoramento**: PM2 Monitoring, Custom Logs

### Desenvolvimento
- **Linting**: ESLint
- **Formatting**: Prettier  
- **Git Hooks**: Husky
- **Package Manager**: npm

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o [Guia de Contribuição](docs/CONTRIBUTING.md).

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

### Padrões de Código
```bash
# Verificar código
npm run lint

# Formatar código  
npm run format

# Executar testes
npm run test:all
```

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

**Desenvolvedor:** Alexandre Liberatto  
**WhatsApp:** [48991604054](https://wa.me/5548991604054)  
**GitHub:** [@AlexandreLiberatto](https://github.com/AlexandreLiberatto)  
**Email:** alexandre@example.com

### Links Úteis
- [🐛 Reportar Bug](https://github.com/AlexandreLiberatto/controle-de-combustivel/issues)
- [💡 Solicitar Feature](https://github.com/AlexandreLiberatto/controle-de-combustivel/issues)
- [📖 Documentação Completa](docs/)
- [🚀 Guia de Deploy](docs/DEPLOY-COMPLETE.md)

---

<div align="center">
  <p>Feito com ❤️ por Alexandre Liberatto</p>
  <p>
    <a href="https://github.com/AlexandreLiberatto/controle-de-combustivel">⭐ Star no GitHub</a> •
    <a href="https://github.com/AlexandreLiberatto/controle-de-combustivel/issues">🐛 Reportar Bug</a> •
    <a href="https://wa.me/5548991604054">💬 WhatsApp</a>
  </p>
</div>
