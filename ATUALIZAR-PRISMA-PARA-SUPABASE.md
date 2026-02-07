# 🔧 Atualizar Prisma para Supabase Integration

Como você está usando a integração nativa Vercel + Supabase, precisamos ajustar o Prisma.

## Variáveis Disponíveis

A integração já configurou estas variáveis na Vercel:

```
POSTGRES_URL              → Pooling (recomendado para serverless)
POSTGRES_PRISMA_URL       → Optimized for Prisma
POSTGRES_URL_NON_POOLING  → Direto (para migrations)
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## ⚙️ Configuração do Prisma

### 1. Atualizar schema.prisma

Edite `frontend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")  // Usar esta para Prisma
  directUrl = env("POSTGRES_URL_NON_POOLING")  // Para migrations
}
```

### 2. Atualizar vercel.json

Edite `frontend/vercel.json`:

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "PRISMA_CLI_BINARY_TARGETS": "rhel-openssl-3.0.x"
  }
}
```

### 3. Atualizar next.config.js

Edite `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Importante: Configurar env vars do Supabase
  env: {
    DATABASE_URL: process.env.POSTGRES_PRISMA_URL,
  },
}

module.exports = nextConfig
```

## 🔄 Executar Migrations

### Local (para configurar banco):

```bash
cd frontend

# Criar .env.local temporário com NON_POOLING URL
echo "POSTGRES_PRISMA_URL=sua-url-pooling" > .env
echo "POSTGRES_URL_NON_POOLING=sua-url-direct" >> .env

# Executar migrations
npx prisma migrate deploy

# Seed
npx prisma db seed
```

### Ou usar SQL Editor no Supabase:

1. Vá em https://app.supabase.com
2. Selecione seu projeto
3. Menu lateral > SQL Editor
4. Cole o conteúdo de `seed.sql`
5. Clique em Run

## 🚀 Redeploy

Após fazer as alterações:

```bash
git add .
git commit -m "fix: Atualiza Prisma para integração Supabase"
git push

# Ou deploy manual:
cd frontend
vercel --prod
```

## ✅ Verificar

Teste estas URLs:
- https://weending.vercel.app/api/health
- https://weending.vercel.app/api/event
- https://weending.vercel.app/api/gifts

## 🚨 Se der erro de conexão

No Supabase Dashboard:
1. Settings > Database > Network Restrictions
2. Desmarque "Enable IP Restriction" (ou adicione 0.0.0.0/0)
3. Salve

Isso permite conexões de qualquer IP (necessário para Vercel serverless).
