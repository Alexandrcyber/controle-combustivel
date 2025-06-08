# 🔧 CONFIGURAÇÃO MANUAL DO NETLIFY - PASSO A PASSO

## ❌ Problema Identificado
O Netlify não está lendo o arquivo `netlify.toml` corretamente. Precisamos configurar manualmente.

## 🎯 CONFIGURAÇÕES CORRETAS NO PAINEL NETLIFY

### 1. 📁 Build Settings (Site Settings > Build & deploy > Build settings)

**Clique em "Edit settings" e configure:**

```
Base directory: frontend
Build command: npm install && npm run build:netlify
Publish directory: frontend
Functions directory: netlify/functions
```

**⚠️ IMPORTANTE:** 
- **Base directory:** `frontend` (não `/`)
- **Build command:** `npm install && npm run build:netlify`
- **Publish directory:** `frontend` (não vazio)

### 2. 🌐 Environment Variables (Site Settings > Environment variables)

**Adicione estas variáveis:**

```
NODE_ENV=production
API_BASE_URL=https://controle-combustivel.onrender.com/api
BACKEND_URL=https://controle-combustivel.onrender.com
```

**⚠️ NOTA:** Removemos a variável `NETLIFY` pois ela é reservada pelo sistema. O ambiente é detectado automaticamente através de outras variáveis internas do Netlify.

### 3. 🔄 Redirects & Rewrites (Site Settings > Build & deploy > Redirects)

**Adicione manualmente:**

```
/api/*  https://controle-combustivel.onrender.com/api/:splat  200
/*      /index.html                                            200
```

## 🚀 COMO CONFIGURAR PASSO A PASSO

### Passo 1: Build Settings
1. Acesse seu site no Netlify
2. **Site Settings** > **Build & deploy** > **Build settings**
3. Clique em **"Edit settings"**
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm install && npm run build:netlify`
   - **Publish directory:** `frontend`
5. Clique em **"Save"**

### Passo 2: Environment Variables
1. **Site Settings** > **Environment variables**
2. Clique em **"Add a variable"**
3. Adicione uma por vez:
   - `NODE_ENV` = `production`
   - `API_BASE_URL` = `https://controle-combustivel.onrender.com/api`
   - `BACKEND_URL` = `https://controle-combustivel.onrender.com`

**⚠️ IMPORTANTE:** Não adicione a variável `NETLIFY` pois ela é reservada pelo sistema.

### Passo 3: Redirects (Opcional - já está no netlify.toml)
1. **Site Settings** > **Build & deploy** > **Redirects**
2. Clique em **"Add redirect"**
3. Adicione:
   - **From:** `/api/*`
   - **To:** `https://controle-combustivel.onrender.com/api/:splat`
   - **Status:** `200` (Proxy)

### Passo 4: Deploy Manual
1. **Deploys** > **Trigger deploy** > **Deploy site**
2. Aguarde o build completar

## 🧪 TESTE APÓS CONFIGURAÇÃO

### 1. Verificar Build Log
- Acesse **Deploys** > clique no deploy mais recente
- Verifique se aparece: `🌐 API_BASE_URL: https://controle-combustivel.onrender.com/api`

### 2. Testar API
Abra no navegador:
```
https://SEU-SITE.netlify.app/api/health
```
Deve retornar dados do backend (não 404)

### 3. Testar Frontend
```
https://SEU-SITE.netlify.app/test-config.html
```
Deve mostrar configurações carregadas

## 🐛 SE AINDA NÃO FUNCIONAR

### Opção 1: Build Command Alternativo
Se o build falhar, use:
```
Build command: cd frontend && npm install && npm run build:netlify
```

### Opção 2: Verificar Logs
1. **Deploys** > clique no deploy
2. Verifique **Deploy log** para erros

### Opção 3: Manual Deploy
1. Baixe o repositório
2. Execute localmente:
   ```bash
   cd frontend
   npm install
   npm run build:netlify
   ```
3. Faça upload manual da pasta `frontend/`

## 📋 CHECKLIST OBRIGATÓRIO

- [ ] ✅ Base directory: `frontend`
- [ ] ✅ Build command: `npm install && npm run build:netlify`
- [ ] ✅ Publish directory: `frontend`
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Build executado com sucesso
- [ ] ✅ `/api/health` funciona
- [ ] ✅ Dados carregam no frontend

## 🎯 RESULTADO ESPERADO

Após configuração correta:
- ✅ Build passa sem erros
- ✅ `/api/*` redireciona para Render
- ✅ Frontend carrega dados da API
- ✅ Sistema completo funciona

---

**Status:** Configuração manual necessária
**Próximo passo:** Configurar build settings manualmente
