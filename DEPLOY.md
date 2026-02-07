# 🚀 Deploy na Vercel

Este projeto foi configurado para rodar completamente na Vercel usando Serverless Functions.

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Conta no [Supabase](https://supabase.com) ou [Neon](https://neon.tech) (PostgreSQL gratuito)
3. Git instalado

## 🗄️ Configurar Banco de Dados

### Opção 1: Supabase (Recomendado)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em Settings > Database > Connection string
3. Copie a URL de conexão (URI)
4. Substitua `[PASSWORD]` pela senha do banco

### Opção 2: Neon

1. Crie um projeto em [neon.tech](https://neon.tech)
2. Copie a connection string

## 🚀 Deploy na Vercel

### 1. Subir código para GitHub

```bash
# Na raiz do projeto
git add .
git commit -m "Configuração para deploy na Vercel"

# Crie um repositório no GitHub e conecte
git remote add origin https://github.com/SEU-USUARIO/convite-casamento.git
git push -u origin main
```

### 2. Importar na Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New Project"**
3. Importe seu repositório GitHub
4. Selecione o diretório `frontend` como root
5. Clique em **Deploy**

### 3. Configurar Variáveis de Ambiente

Após o primeiro deploy (que vai falhar por falta do banco):

1. No dashboard da Vercel, vá em **Settings > Environment Variables**
2. Adicione as seguintes variáveis:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | Sua URL do PostgreSQL |
| `ENCRYPTION_KEY` | Chave de 32 caracteres (use `openssl rand -base64 32`) |
| `ADMIN_USER` | Usuário admin (ex: admin) |
| `ADMIN_PASSWORD` | Senha admin forte |

3. Clique em **Save**
4. Vá em **Deployments** e clique em **Redeploy**

### 4. Configurar Banco de Dados

Após o deploy funcionar, execute as migrations:

#### Opção A: Usando Prisma (local)
```bash
cd frontend
npx prisma migrate deploy
```

#### Opção B: Usando Console do Supabase/Neon
Execute o SQL das migrations manualmente no console.

### 5. Seed do Banco (Opcional)

```bash
cd frontend
npx prisma db seed
```

Ou use o endpoint de health check para criar um evento padrão.

## 🔧 Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build local
npm run build

# Verificar banco
npx prisma studio

# Nova migration
npx prisma migrate dev --name nome_da_migracao
```

## 🌐 Domínio

Após o deploy, seu site estará em:
```
https://seu-projeto.vercel.app
```

Você pode configurar um domínio personalizado em:
**Vercel Dashboard > Settings > Domains**

## 📁 Estrutura do Projeto

```
frontend/
├── app/
│   ├── api/           # Serverless Functions (API Routes)
│   │   ├── rsvp/      # Confirmações de presença
│   │   ├── gifts/     # Lista de presentes
│   │   ├── contact/   # Mensagens de contato
│   │   ├── contributions/  # Contribuições
│   │   └── event/     # Dados do evento
│   ├── ...            # Páginas do site
├── lib/               # Utilitários
│   ├── prisma.ts      # Cliente Prisma
│   ├── validation.ts  # Schemas Zod
│   └── crypto.ts      # Encriptação
├── prisma/
│   └── schema.prisma  # Schema do banco
└── ...
```

## 🛠️ Solução de Problemas

### Erro de conexão com banco
- Verifique se a `DATABASE_URL` está correta
- Certifique-se que o banco aceita conexões externas
- No Supabase, vá em Settings > Database > Connection pooling (use a URL do pooler)

### Erro 500 nas APIs
- Verifique os logs em **Vercel Dashboard > Logs**
- Confirme se o `ENCRYPTION_KEY` está definido

### Build falha
- Certifique-se que `prisma generate` está sendo executado
- Verifique se o `package.json` tem o `postinstall` script

## 📞 Suporte

- Documentação Vercel: [vercel.com/docs](https://vercel.com/docs)
- Documentação Prisma: [prisma.io/docs](https://prisma.io/docs)
- Documentação Next.js: [nextjs.org/docs](https://nextjs.org/docs)
