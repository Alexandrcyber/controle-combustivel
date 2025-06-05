# Frontend - Sistema de Controle de Combustível

Interface web responsiva para gerenciamento de caminhões e abastecimentos, com integração à API backend.

## 🚀 Configuração e Instalação

### 1. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as configurações conforme necessário
nano .env
```

### 2. Variáveis de Ambiente Disponíveis

```bash
# URL da API Backend
API_BASE_URL=http://localhost:3001

# Configurações de Desenvolvimento
NODE_ENV=development
PORT=3000
DEBUG_MODE=true
SHOW_LOGS=true

# Configurações de Cache
CACHE_ENABLED=true
CACHE_DURATION=300000

# Configurações de Tema
DEFAULT_THEME=light
ENABLE_DARK_MODE=true

# Configurações de Relatórios
EXPORT_FORMATS=pdf,excel
MAX_EXPORT_RECORDS=10000
```

### 3. Iniciar o Frontend

#### Opção A: Servidor Simples (Recomendado)
```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start
```

#### Opção B: Arquivo Local
```bash
# Abrir diretamente no navegador
open index.html
```

## 🔧 Configuração Dinâmica

O sistema permite alteração de configurações em tempo de execução através do console do navegador:

### Comandos Úteis

```javascript
// Ver configuração atual
window.configUtils.showConfig();

// Alterar URL da API
window.configUtils.setApiUrl('http://nova-api.com');

// Ativar/desativar modo debug
window.configUtils.toggleDebug();

// Ativar/desativar cache
window.configUtils.toggleCache();

// Resetar configurações
window.configUtils.resetConfig();

// Limpar cache da API
window.apiClient.clearCache();

// Testar conexão com a API
window.dbApi.testarConexao();
```

## 🌐 Ambientes de Deploy

### Desenvolvimento Local
```bash
API_BASE_URL=http://localhost:3001
NODE_ENV=development
DEBUG_MODE=true
```

### Produção
```bash
API_BASE_URL=https://sua-api-backend.herokuapp.com
NODE_ENV=production
DEBUG_MODE=false
SHOW_LOGS=false
```

### Staging/Teste
```bash
API_BASE_URL=https://api-staging.seu-dominio.com
NODE_ENV=staging
DEBUG_MODE=true
```

## 🎨 Funcionalidades

- **Interface Responsiva**: Funciona em desktop, tablet e mobile
- **Tema Claro/Escuro**: Alternância automática ou manual
- **Cache Inteligente**: Cache automático de requisições GET
- **Debug Mode**: Logs detalhados para desenvolvimento
- **Exportação**: PDF e Excel dos relatórios
- **Gráficos Interativos**: Chart.js para visualização de dados
- **PWA Ready**: Preparado para ser Progressive Web App

## 🔌 API Integration

O frontend se comunica com o backend através da `window.dbApi`, que mantém compatibilidade com o código anterior:

```javascript
// Buscar dados
const caminhoes = await window.dbApi.buscarCaminhoes();
const abastecimentos = await window.dbApi.buscarAbastecimentos();

// Salvar dados
const caminhaoSalvo = await window.dbApi.salvarCaminhao(caminhao);
const abastecimentoSalvo = await window.dbApi.salvarAbastecimento(abastecimento);

// Excluir dados
await window.dbApi.excluirCaminhao(id);
await window.dbApi.excluirAbastecimento(id);
```

## 🐛 Debug e Desenvolvimento

### Modo Debug

Quando `DEBUG_MODE=true`, o sistema exibe logs detalhados:

```
[API] GET http://localhost:3001/api/caminhoes
[API] Response: [{id: "1", placa: "ABC-1234", ...}]
```

### Cache de Requisições

O sistema cacheia automaticamente requisições GET por 5 minutos (configurável):

```javascript
// Primeira chamada - faz requisição HTTP
const dados1 = await window.dbApi.buscarCaminhoes();

// Segunda chamada - usa cache
const dados2 = await window.dbApi.buscarCaminhoes(); // Cache hit!
```

### Tratamento de Erros

```javascript
try {
    const resultado = await window.dbApi.salvarCaminhao(caminhao);
} catch (error) {
    console.error('Erro ao salvar:', error.message);
    // Exibir mensagem para o usuário
}
```

## 📱 Progressive Web App (PWA)

O frontend está preparado para ser uma PWA. Para ativar:

1. Adicione um `manifest.json`
2. Implemente um Service Worker
3. Configure HTTPS em produção

## 🚀 Deploy

### Netlify
```bash
# Build command (se necessário)
npm run build

# Publish directory
./

# Environment variables
API_BASE_URL=https://sua-api.herokuapp.com
NODE_ENV=production
```

### Vercel
```bash
# Configure no vercel.json
{
  "env": {
    "API_BASE_URL": "https://sua-api.herokuapp.com",
    "NODE_ENV": "production"
  }
}
```

### GitHub Pages
```bash
# Configure no repositório Settings > Pages
# Defina as variáveis de ambiente nas Actions
```

## 🔒 Segurança

- **CORS**: Configurado no backend para aceitar apenas domínios autorizados
- **HTTPS**: Sempre use HTTPS em produção
- **API Keys**: Se necessário, configure através de variáveis de ambiente
- **Sanitização**: Dados são validados no frontend e backend

## 🧪 Testes

```bash
# Teste de conexão com a API
window.dbApi.testarConexao().then(conectado => {
    console.log('API conectada:', conectado);
});

# Teste de funcionalidades
// Abra o console do navegador e teste as funções
```

## 📚 Estrutura de Arquivos

```
frontend/
├── index.html              # Página principal
├── package.json            # Dependências
├── .env                    # Configurações locais
├── .env.example            # Exemplo de configurações
├── README.md               # Esta documentação
└── src/
    ├── css/
    │   └── styles.css      # Estilos personalizados
    ├── js/
    │   ├── api.js          # Cliente da API
    │   ├── app.js          # Lógica principal
    │   ├── data.js         # Camada de dados
    │   ├── charts.js       # Gráficos
    │   └── relatorios.js   # Relatórios
    └── img/
        └── icon_combustivel.png
```

## 🤝 Contribuindo

1. Configure o ambiente de desenvolvimento
2. Ative o modo debug: `window.configUtils.toggleDebug()`
3. Faça suas alterações
4. Teste com diferentes configurações de API
5. Documente as mudanças

## 📞 Suporte

Para problemas com a configuração:

1. Verifique se o backend está rodando
2. Teste a conexão: `window.dbApi.testarConexao()`
3. Verifique as configurações: `window.configUtils.showConfig()`
4. Consulte os logs do console quando `DEBUG_MODE=true`
