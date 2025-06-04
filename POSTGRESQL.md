# Configuração do PostgreSQL

Esta documentação descreve a configuração do PostgreSQL (local e Neon) para o Sistema de Controle de Combustível.

## Arquivos Modificados/Criados

1. **config.json**
   - Atualizado para suportar tanto PostgreSQL local quanto Neon PostgreSQL
   - Adicionada seção para configuração do Neon

2. **src/js/db.js**
   - Modificado para detectar automaticamente qual configuração usar (local ou Neon)
   - Adicionada configuração SSL para suporte ao Neon

3. **scripts/test-db-connection.js**
   - Criado para testar a conexão com o banco de dados
   - Verifica se o banco e as tabelas existem

4. **scripts/migrate-to-postgres.js**
   - Criado para migrar dados do localStorage para o PostgreSQL
   - Suporta tanto PostgreSQL local quanto Neon

5. **package.json**
   - Adicionados scripts úteis para testar conexão e migrar dados

6. **README.md**
   - Atualizado com informações sobre o Neon e os scripts úteis

## Como Usar

### PostgreSQL Local

1. Verifique a conexão com o PostgreSQL:
   ```
   npm run check-db
   ```

2. Se não tiver o banco de dados criado, crie-o:
   ```sql
   CREATE DATABASE controle_combustivel;
   ```

3. Inicie o servidor:
   ```
   npm run server
   ```

4. (Opcional) Migre dados do localStorage para o PostgreSQL:
   ```
   npm run migrate-db
   ```

### Neon PostgreSQL

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um projeto e um banco de dados `controle_combustivel`
3. Obtenha as credenciais de conexão
4. Atualize o arquivo `config.json` com as credenciais e defina `"enabled": true`
5. Execute os mesmos comandos da seção anterior

## Solução de Problemas

Se encontrar problemas com a conexão:

1. Verifique se o PostgreSQL está instalado e em execução
2. Verifique se o banco de dados `controle_combustivel` existe
3. Verifique se as credenciais no arquivo `config.json` estão corretas
4. Execute `npm run check-db` para diagnóstico detalhado

## Próximos Passos

- Testar a conexão com o Neon PostgreSQL
- Implementar backup automático de dados
- Adicionar suporte a múltiplos usuários com autenticação
