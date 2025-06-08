# ✅ Checklist de Deploy - Sistema de Controle de Combustível

## 🎯 Status do Deploy

### Backend (Render) ✅ COMPLETO
- [x] Servidor configurado
- [x] Banco de dados Neon conectado
- [x] Variáveis de ambiente configuradas
- [x] CORS configurado para Netlify

### Frontend (Netlify) ✅ PRONTO PARA DEPLOY

## 📋 Passos Finais para Deploy no Netlify

### 1. ⚠️ CONFIGURAÇÃO OBRIGATÓRIA
**Antes de fazer o deploy, você DEVE:**

1. **Obter a URL do seu backend no Render**
   - Exemplo: `https://controle-combustivel-abc123.onrender.com`

2. **Atualizar os seguintes arquivos com a URL real:**
   - `netlify.toml` (linha 18)
   - `frontend/.env.netlify`
   - `NETLIFY_ENV_VARS.txt`

### 2. 🚀 Deploy no Netlify

```bash
# 1. Executar script automático
./deploy-netlify.sh

# 2. Fazer commit das alterações
git add .
git commit -m "Configure Netlify deployment"
git push origin main
```

### 3. 🌐 Configurar no Painel do Netlify

1. **Acesse [netlify.com](https://netlify.com)**
2. **New site from Git**
3. **Conecte seu repositório GitHub**
4. **Configure:**
   - Base directory: `frontend/`
   - Build command: `npm install && npm run build:netlify`
   - Publish directory: `frontend/`
   - Branch: `main`

### 4. 🔧 Variáveis de Ambiente no Netlify

**Site Settings > Environment Variables:**
```
NODE_ENV=production
BACKEND_URL=https://SUA-URL-DO-RENDER.onrender.com
API_BASE_URL=https://SUA-URL-DO-RENDER.onrender.com/api
```

### 5. 🔄 Atualizar CORS no Backend (Render)

**No painel do Render, adicione a variável:**
```
CORS_ORIGIN=http://localhost:3000,https://SEU-SITE.netlify.app
```

## 🧪 Testes Pós-Deploy

### ✅ Checklist de Teste:
- [ ] Homepage carrega sem erros
- [ ] Console do navegador sem erros de API
- [ ] Login funciona
- [ ] Cadastro de caminhões funciona
- [ ] Registro de abastecimentos funciona
- [ ] Relatórios são gerados
- [ ] Gráficos são exibidos

### 🐛 Troubleshooting Comum:

**Erro de CORS:**
```
Access to fetch at 'https://backend.onrender.com/api/...' from origin 'https://app.netlify.app' has been blocked by CORS policy
```
**Solução:** Adicionar o domínio do Netlify na variável `CORS_ORIGIN` do Render

**Erro 404 na API:**
```
GET https://app.netlify.app/api/caminhoes 404 (Not Found)
```
**Solução:** Verificar se a URL no `netlify.toml` está correta

**Página em branco:**
**Solução:** Verificar console do navegador e logs do Netlify

## 📁 Arquivos Configurados

### ✅ Criados/Atualizados:
- `netlify.toml` - Configurações de deploy
- `frontend/.env.netlify` - Variáveis de ambiente
- `frontend/src/js/config.js` - Detecção de ambiente
- `deploy-netlify.sh` - Script automatizado
- `NETLIFY_ENV_VARS.txt` - Template de variáveis
- `.env.render` - CORS atualizado para Netlify

## 🎉 Resultado Final

Após o deploy bem-sucedido:
- **Frontend:** `https://seu-app.netlify.app`
- **Backend:** `https://seu-backend.onrender.com`
- **Sistema completo funcionando em produção!**

---

**📞 Suporte:**
- Logs do Netlify: Site Settings > Functions > Deploy log
- Logs do Render: Dashboard do backend
- Console do navegador: F12 > Console

**Status:** ✅ Pronto para deploy
**Data:** 8 de junho de 2025
