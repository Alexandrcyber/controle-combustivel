# 🚛 Sistema de Controle de Combustível

Sistema completo para gerenciamento e controle de abastecimento de combustível para frotas de caminhões, com funcionalidades interativas e relatórios dinâmicos.

## 🏗️ Arquitetura do Projeto

```
controle-de-combustivel/
├── 📁 backend/          # API e servidor backend
├── 📁 frontend/         # Interface do usuário
├── 📁 config/           # Configurações centralizadas
├── 📁 tests/            # Testes automatizados
├── 📁 docs/             # Documentação
├── 📁 scripts/          # Scripts de automação
├── 📁 data/             # Dados persistidos
└── 📁 logs/             # Arquivos de log
```

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 14+ 
- NPM 6+

### Instalação e Configuração

1. **Clone o repositório**
```bash
git clone https://github.com/AlexandreLiberatto/controle-de-combustivel.git
cd controle-de-combustivel
```

2. **Setup automático**
```bash
npm run setup
```

3. **Instalar dependências**
```bash
npm run install:all
```

4. **Iniciar em modo desenvolvimento**
```bash
npm run dev
```

5. **Acessar a aplicação**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## 📋 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev              # Inicia frontend e backend
npm run dev:frontend     # Apenas frontend
npm run dev:backend      # Apenas backend
```

### Produção
```bash
npm run build           # Build para produção
npm run prod:start      # Iniciar em produção
```

### Testes
```bash
npm test               # Todos os testes
npm run test:unit      # Testes unitários
npm run test:integration # Testes de integração
npm run test:manual    # Abrir testes manuais
```

### Utilitários
```bash
npm run setup          # Configuração inicial
npm run clean          # Limpeza de arquivos temporários
npm run install:all    # Instalar todas as dependências
```

## 🔧 Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Ambiente
NODE_ENV=development

# Backend
BACKEND_PORT=3001
BACKEND_HOST=localhost

# Frontend  
FRONTEND_PORT=3000
FRONTEND_HOST=localhost

# API
API_BASE_URL=http://localhost:3001/api

# Banco de Dados
DB_TYPE=json
DB_PATH=./data
```

### Configuração para Produção

1. **Definir variáveis de ambiente**:
```env
NODE_ENV=production
BACKEND_PORT=8080
API_BASE_URL=https://sua-api.com/api
JWT_SECRET=seu-jwt-secret-seguro
SESSION_SECRET=seu-session-secret-seguro
```

2. **Build e deploy**:
```bash
npm run build
npm run prod:start
```

## 📊 Funcionalidades

### ✅ Implementado

- **Gestão de Caminhões**: Cadastro e gerenciamento da frota
- **Controle de Abastecimentos**: Registro detalhado de abastecimentos  
- **Dashboard Interativo**: Visão geral com métricas em tempo real
- **Relatórios Dinâmicos**: Consumo, custos e análises
- **Exportação**: Excel e PDF
- **Sistema de Alertas**: Notificações elegantes com SweetAlert2
- **API RESTful**: Backend robusto com Express.js
- **Responsivo**: Interface adaptável para dispositivos móveis

### 🔄 Em Desenvolvimento

- Autenticação de usuários
- Backup automático
- Integração com APIs externas
- Dashboards avançados

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── unit/           # Testes unitários
├── integration/    # Testes de integração  
├── e2e/           # Testes end-to-end
├── manual/        # Testes manuais
└── reports/       # Relatórios de testes
```

### Executar Testes

```bash
# Todos os testes
npm test

# Específicos
npm run test:unit
npm run test:integration

# Testes manuais (abre no navegador)
npm run test:manual
```

## 📱 Tecnologias

### Frontend
- **HTML5/CSS3**: Interface moderna
- **JavaScript ES6+**: Lógica do cliente
- **Bootstrap 5**: Framework CSS
- **Chart.js**: Gráficos interativos
- **SweetAlert2**: Sistema de alertas
- **SheetJS**: Manipulação de planilhas

### Backend  
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web
- **CORS**: Políticas de origem cruzada
- **JSON**: Armazenamento de dados

### DevOps
- **NPM Scripts**: Automação
- **Concurrently**: Execução paralela
- **Dotenv**: Gestão de ambiente
- **Nodemon**: Desenvolvimento

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📞 Contato

**Alexandre** - WhatsApp: [48991604054](https://wa.me/5548991604054)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🏆 Status do Projeto

✅ **Versão 1.0.0 - Funcional**
- Sistema completo implementado
- Testes validados
- Documentação atualizada
- Pronto para produção

---

Desenvolvido com ❤️ por [Alexandre](https://wa.me/5548991604054)
