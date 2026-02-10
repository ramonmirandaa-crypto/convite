# 🗄️ Integração Vercel + Supabase - Guia Completo

## ✅ Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Escolha organização e nome do projeto (ex: `convite-casamento`)
4. Defina uma senha segura para o banco de dados
5. Escolha a região mais próxima (São Paulo para Brasil)
6. Clique em **"Create new project"**

---

### 2. Obter Connection String

1. No dashboard do Supabase, vá em **Project Settings** (engrenagem ⚙️)
2. Clique em **Database** no menu lateral
3. Role até **Connection string**
4. Selecione **URI** no dropdown
5. Copie a string que aparece:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Substitua `[YOUR-PASSWORD]` pela senha que você criou

---

### 3. Configurar Variáveis na Vercel

1. Acesse https://vercel.com/dashboard
2. Clique no seu projeto (`weending`)
3. Vá em **Settings** (menu superior)
4. Clique em **Environment Variables** (menu lateral)
5. Adicione as seguintes variáveis:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `DATABASE_URL` | `postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres` | Production |
| `ENCRYPTION_KEY` | (gerar abaixo) | Production |
| `ADMIN_USER` | admin | Production |
| `ADMIN_PASSWORD` | sua-senha-segura | Production |

**Gerar ENCRYPTION_KEY:**
```bash
openssl rand -base64 32
```

6. Clique em **Save**

---

### 3.1. (Opcional) Storage Para Upload de Imagens (Admin)

Se você quer **enviar imagens direto pelo painel de admin** (sem colar link), configure o Supabase Storage:

1. No Supabase, vá em **Storage** (menu lateral)
2. Clique em **New bucket**
3. Crie um bucket chamado `photos` e marque como **Public**

Opcional (se quiser outro nome/pasta):

- `SUPABASE_STORAGE_BUCKET`: nome do bucket (padrão: `photos`)
- `SUPABASE_STORAGE_PREFIX`: pasta dentro do bucket (padrão: `uploads`)

---

### 4. Executar Migrations

#### Opção A: Local (Recomendado)

```bash
cd /root/convite/frontend

# Criar arquivo .env temporário
echo "DATABASE_URL=postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres" > .env

# Executar migrations
npx prisma migrate deploy

# Seed do banco (cria evento e presentes padrão)
npx prisma db seed
```

#### Opção B: SQL Editor no Supabase

1. No Supabase, vá em **SQL Editor** (menu lateral)
2. Cole o conteúdo do arquivo `prisma/migrations/xxxx_init/migration.sql`
3. Clique em **Run**

---

### 5. Redeploy na Vercel

Após configurar as variáveis:

1. Vá em **Deployments** no menu da Vercel
2. Clique nos três pontos (...) do deploy mais recente
3. Clique em **Redeploy**
4. Selecione **Use existing Build Cache**: Não
5. Clique em **Redeploy**

---

## 🧪 Testar Conexão

Acesse: `https://weending.vercel.app/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "message": "API está funcionando"
}
```

Depois acesse: `https://weending.vercel.app/api/event`

Se retornar dados do evento, a conexão com o banco está funcionando! ✅

---

## 🔄 Comandos Úteis

```bash
# Ver status do banco
npx prisma db pull

# Abrir Prisma Studio (visualizar dados)
npx prisma studio

# Nova migration (após alterar schema)
npx prisma migrate dev --name nome_da_alteracao

# Reset do banco (cuidado!)
npx prisma migrate reset
```

---

## 🚨 Solução de Problemas

### Erro: "Can't reach database server"
- Verifique se a senha está correta na DATABASE_URL
- Confirme se o projeto Supabase está ativo (não pausado)
- Verifique se o IP está liberado (Supabase > Settings > Database > Network Restrictions)

### Erro: "relation does not exist"
- As migrations não foram executadas
- Rode `npx prisma migrate deploy` novamente

### Erro: "connection pooler"
- Use a URL de connection pooling do Supabase para produção:
  ```
  postgresql://postgres.xxxxx:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
  ```

---

## 📊 Dashboard Úteis

- **Vercel**: https://vercel.com/dashboard
- **Supabase**: https://app.supabase.com
- **Seu Site**: https://weending.vercel.app

---

Pronto! Seu convite de casamento está completamente funcional! 🎉
