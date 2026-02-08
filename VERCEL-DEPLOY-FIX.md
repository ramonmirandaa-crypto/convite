# 🔧 Correção de Deploy na Vercel

## Problema
O deploy falhou porque o comando `prisma migrate deploy` está falhando. Isso geralmente acontece quando:
1. As variáveis de ambiente do banco de dados não estão configuradas
2. O banco de dados não está acessível

## Solução

### 1. Configurar Variáveis de Ambiente no Dashboard da Vercel

Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

Adicione as seguintes variáveis:

```
POSTGRES_PRISMA_URL=postgresql://postgres:SUA_SENHA@db.ldnsqfhvoktggurghbrz.supabase.co:5432/postgres?schema=public&pgbouncer=true&connection_limit=1
POSTGRES_URL_NON_POOLING=postgresql://postgres:SUA_SENHA@db.ldnsqfhvoktggurghbrz.supabase.co:5432/postgres?schema=public
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.ldnsqfhvoktggurghbrz.supabase.co:5432/postgres?schema=public
ENCRYPTION_KEY=SUA_CHAVE_DE_CRIPTOGRAFIA
ADMIN_USER=rmiranda
ADMIN_PASSWORD=SUA_SENHA_ADMIN
NEXT_PUBLIC_APP_URL=https://weending-7ss7cyf3t-f360.vercel.app
```

### 2. Rodar Migrações Manualmente

Como as migrações não rodam mais automaticamente no build, execute:

```bash
# Instalar Prisma CLI globalmente (se não tiver)
npm install -g prisma

# Rodar migrações
export POSTGRES_PRISMA_URL="postgresql://postgres:SUA_SENHA@db.ldnsqfhvoktggurghbrz.supabase.co:5432/postgres?schema=public"
cd /root/convite/frontend
npx prisma migrate deploy
```

Ou use o script de setup:
```bash
cd /root/convite
./setup-db-cli.sh
```

### 3. Redeploy

Após configurar as variáveis de ambiente:

```bash
cd /root/convite
./deploy-quick.sh
```

## Verificação

Para verificar se tudo está funcionando:

1. Acesse o site deployado
2. Teste a página /api/health
3. Faça login no admin
4. Teste uma contribuição de teste

## Notas

- O arquivo `vercel.json` foi atualizado para não rodar migrações no build
- As migrações devem ser rodadas manualmente ou via CLI
- O Prisma Client é gerado automaticamente durante o build
