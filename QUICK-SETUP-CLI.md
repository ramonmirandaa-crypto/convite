# 🚀 Setup Rápido via CLI

## Opção 1: Script Interativo (Recomendado)

```bash
cd /root/convite/frontend
../setup-db-cli.sh
```

O script vai perguntar as URLs do Supabase e fazer tudo automaticamente.

---

## Opção 2: Comandos Manuais

### Passo 1: Pegar URLs do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. **Settings** > **Database** > **Connection string**
4. Copie:
   - **URI** (Pooling) → Para `POSTGRES_PRISMA_URL`
   - **URI** (Direct) → Para `POSTGRES_URL_NON_POOLING`

### Passo 2: Configurar .env

```bash
cd /root/convite/frontend

# Criar arquivo .env
cat > .env << 'EOF'
POSTGRES_PRISMA_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
POSTGRES_URL_NON_POOLING=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
ENCRYPTION_KEY=sua-chave-aqui
ADMIN_USER=admin
ADMIN_PASSWORD=sua-senha
EOF
```

Substitua `[PASSWORD]` e `xxxxx` pelos valores do seu Supabase.

### Passo 3: Executar Migrations

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate deploy
```

### Passo 4: Seed (Dados iniciais)

```bash
npx prisma db seed
```

Ou execute o SQL no Supabase:

```bash
# Pega a URL non-pooling
export PGPASSWORD='sua-senha'
psql -h db.xxxxx.supabase.co -p 5432 -U postgres -d postgres -f ../setup-supabase.sql
```

---

## Opção 3: SQL Editor (Mais Fácil)

Se preferir, use o SQL Editor do Supabase:

1. https://app.supabase.com
2. SQL Editor > New Query
3. Cole o conteúdo de `setup-supabase.sql`
4. Run

---

## ✅ Verificar

Após configurar:

```bash
# Testar conexão
curl https://weending.vercel.app/api/health
curl https://weending.vercel.app/api/event
curl https://weending.vercel.app/api/gifts
```

---

## 🚨 Troubleshooting

**Erro: "Can't reach database server"**
```bash
# No Supabase Dashboard:
Settings > Database > Network Restrictions
# Desmarque "Enable IP Restriction"
```

**Erro: "relation does not exist"**
```bash
# Migrations não executadas
npx prisma migrate deploy
```

**Erro: "password authentication failed"**
```bash
# Senha incorreta no .env
# Verifique no Supabase: Settings > Database
```
