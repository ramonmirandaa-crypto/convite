# Deploy na Vercel + Supabase

Este guia explica como fazer o deploy do sistema de convite de casamento na Vercel com banco de dados Supabase.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Git instalado

## 🚀 Passo a Passo

### 1. Configurar Banco de Dados no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Aguarde a criação do projeto (pode levar alguns minutos)
3. Vá em **Settings > Database** e copie a **Connection string** (URI format)

Exemplo:
```
postgresql://postgres:[PASSWORD]@db.abcdefg.supabase.co:5432/postgres
```

4. No SQL Editor, execute o script `setup-supabase.sql`:
   - Copie o conteúdo do arquivo `/root/convite/setup-supabase.sql`
   - Cole no SQL Editor e execute

### 2. Conectar Vercel ao Supabase

1. Na dashboard da Vercel, clique em **Add New... > Project**
2. Importe seu repositório Git
3. Na tela de configuração, expanda **Environment Variables**
4. Adicione as seguintes variáveis:

```env
# Banco de Dados (do Supabase)
POSTGRES_PRISMA_URL=postgresql://postgres:[PASSWORD]@db.abcdefg.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://postgres:[PASSWORD]@db.abcdefg.supabase.co:5432/postgres

# Segurança (gerar valores fortes)
ENCRYPTION_KEY=sua-chave-aleatoria-32-caracteres
ADMIN_USER=admin
ADMIN_PASSWORD=sua-senha-segura

# Ambiente
NODE_ENV=production
```

> **Dica:** Você pode usar a integração nativa Vercel + Supabase na marketplace para configuração automática.

### 3. Deploy do Frontend

1. Configure o build:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `prisma generate && next build`

2. Clique em **Deploy**

3. Após o deploy, execute as migrações:
   ```bash
   # Instale o Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Execute as migrações
   cd frontend
   npx prisma migrate deploy
   ```

### 4. Configurar Domínio (Opcional)

1. Na dashboard da Vercel, vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruções

## 🔧 Comandos Úteis

### Rodar migrações no Supabase
```bash
cd frontend
npx prisma migrate deploy
```

### Gerar Prisma Client
```bash
cd frontend
npx prisma generate
```

### Verificar conexão
```bash
cd frontend
npx prisma db pull
```

## 📁 Estrutura do Projeto

```
frontend/
├── app/
│   ├── admin/           # Área administrativa
│   │   ├── login/       # Página de login
│   │   └── dashboard/   # Dashboard com CRUDs
│   ├── api/             # APIs do Next.js
│   ├── contact/         # Página de contato
│   ├── gallery/         # Galeria de fotos
│   ├── gifts/           # Lista de presentes
│   ├── rsvp/            # Confirmação de presença
│   └── ...
├── prisma/
│   └── schema.prisma    # Schema do banco
└── ...
```

## 🔐 Acesso Admin

Após o deploy, acesse:
- URL: `https://seu-site.vercel.app/admin`
- Usuário: `admin` (ou o definido em ADMIN_USER)
- Senha: definida em ADMIN_PASSWORD

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se as variáveis POSTGRES_PRISMA_URL e POSTGRES_URL_NON_POOLING estão corretas
- Certifique-se de que o pooler PgBouncer está habilitado no Supabase

### Erro "Prisma Client não encontrado"
- Adicione `prisma generate` ao script de build
- Ou adicione `postinstall": "prisma generate"` no package.json

### Migrações não aplicadas
- Execute manualmente: `npx prisma migrate deploy`
- Ou use o SQL Editor do Supabase para rodar os scripts

## 📞 Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação Supabase: https://supabase.com/docs
- Documentação Prisma: https://www.prisma.io/docs
