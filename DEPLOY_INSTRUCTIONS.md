# 🚀 Instruções de Deploy - Sistema de Controle de Combustível

## ✅ Status do Projeto

### Backend (Render) - CONFIGURADO
- ✅ Servidor Express.js configurado
- ✅ Banco PostgreSQL Neon conectado
- ✅ Variáveis de ambiente configuradas
- ✅ Arquivos de configuração criados

### Frontend (Netlify) - PRONTO PARA DEPLOY

## 📋 Passos para Deploy no Netlify

### 1. Preparar o Repositório
```bash
# Fazer commit de todas as alterações
git add .
git commit -m "Configure Netlify deployment"
git push origin main
```

### 2. Deploy no Netlify

#### Opção A: Através do Git (Recomendado)
1. Acesse [netlify.com](https://netlify.com)
2. Faça login e clique em **"New site from Git"**
3. Conecte seu repositório GitHub
4. Configure as seguintes opções:
   - **Base directory**: `frontend/`
   - **Build command**: `npm install && npm run build:netlify`
   - **Publish directory**: `frontend/`
   - **Branch**: `main`

#### Opção B: Deploy Manual
```bash
# No diretório do projeto
cd frontend
npm install
npm run build:netlify

# Fazer upload manual da pasta frontend/ no Netlify
```

### 3. Configurar Variáveis de Ambiente no Netlify

No painel do Netlify, vá para **Site Settings > Environment Variables** e adicione:

```
NODE_ENV=production
BACKEND_URL=https://SEU-BACKEND-RENDER.onrender.com
API_BASE_URL=https://SEU-BACKEND-RENDER.onrender.com/api
```

**⚠️ IMPORTANTE**: Substitua `SEU-BACKEND-RENDER` pela URL real do seu backend no Render.

### 4. Atualizar URLs do Backend

#### No arquivo `netlify.toml`:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://SUA-URL-DO-RENDER.onrender.com/api/:splat"
  status = 200
  force = true
```

#### No arquivo `frontend/.env.netlify`:
```env
BACKEND_URL=https://SUA-URL-DO-RENDER.onrender.com
API_BASE_URL=https://SUA-URL-DO-RENDER.onrender.com/api
```

## 🔧 Configurações já Implementadas

### ✅ Arquivos de Configuração Criados:
- `netlify.toml` - Configurações de build e redirecionamentos
- `frontend/.env.netlify` - Variáveis de ambiente para produção
- `frontend/package.json` - Scripts de build atualizados
- `frontend/src/js/config.js` - Detecção automática de ambiente

### ✅ Funcionalidades Configuradas:
- **Redirecionamento de API**: `/api/*` → Backend no Render
- **SPA Routing**: Redirecionamento para `index.html`
- **Headers de Segurança**: CSP, XSS Protection, etc.
- **Cache de Arquivos Estáticos**: CSS, JS, imagens
- **Detecção de Ambiente**: Automática entre dev/prod

## 🌐 URLs de Exemplo

Após o deploy:
- **Frontend**: `https://seu-app.netlify.app`
- **Backend**: `https://seu-backend.onrender.com`
- **API**: As chamadas `/api/*` serão redirecionadas automaticamente

## 🔍 Teste Pós-Deploy

1. **Verifique a Homepage**: Acesse a URL do Netlify
2. **Teste Login**: Tente fazer login no sistema
3. **Verifique API**: Abra o console do navegador e veja se há erros
4. **Teste Funcionalidades**: Cadastro de caminhões, abastecimentos, etc.

## 🐛 Troubleshooting

### Erro de CORS:
- Verifique se o backend no Render está configurado para aceitar requests do domínio do Netlify
- Adicione o domínio do Netlify nas configurações de CORS do backend

### Erro 404 nas rotas da API:
- Verifique se a URL do backend no `netlify.toml` está correta
- Confirme se o backend está rodando no Render

### Erro de carregamento da página:
- Verifique se o `publish directory` está configurado como `frontend/`
- Confirme se todos os arquivos estão na pasta correta

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Netlify em **Functions > Deploy log**
2. Verifique os logs do Render no painel do backend
3. Use o console do navegador para debugar erros de JavaScript

---

**Status**: ✅ Pronto para deploy
**Última atualização**: $(date)
