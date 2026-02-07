# 🚀 Deploy Rápido na Vercel

## Opção 1: Deploy via CLI (Mais rápido)

### Passo 1: Instalar Vercel CLI (já instalado)
```bash
npm install -g vercel
```

### Passo 2: Fazer Login
```bash
vercel login
```
- Abrirá uma página no navegador
- Autorize o acesso
- Volte ao terminal

### Passo 3: Deploy
```bash
cd frontend
vercel --prod
```

**Pronto!** Seu site estará em `https://seu-projeto.vercel.app`

---

## Opção 2: Deploy via GitHub (Recomendado)

### Passo 1: Subir para GitHub
```bash
# Na raiz do projeto
git remote add origin https://github.com/SEU-USUARIO/convite-casamento.git
git push -u origin main
```

### Passo 2: Importar na Vercel
1. Acesse https://vercel.com/new
2. Importe seu repositório GitHub
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Clique em **Deploy**

---

## ⚙️ Configurar Variáveis de Ambiente

Após o primeiro deploy, adicione as variáveis:

1. Vá em https://vercel.com/dashboard
2. Selecione seu projeto
3. Settings > Environment Variables
4. Adicione:

| Nome | Valor | Exemplo |
|------|-------|---------|
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://...` |
| `ENCRYPTION_KEY` | Chave secreta | `openssl rand -base64 32` |
| `ADMIN_USER` | Usuário admin | `admin` |
| `ADMIN_PASSWORD` | Senha admin | `sua-senha-segura` |

5. Clique em **Save** e **Redeploy**

---

## 🗄️ Configurar Banco de Dados (Supabase)

1. Crie conta em https://supabase.com
2. New Project > Database
3. Vá em Settings > Database > Connection string
4. Copie a URI e substitua `[PASSWORD]`
5. Cole em `DATABASE_URL` na Vercel

---

## 🌐 Domínio Gratuito

Seu site terá:
- ✅ Domínio: `seu-projeto.vercel.app`
- ✅ SSL/HTTPS: Incluso
- ✅ CDN Global: Grátis

Para domínio personalizado:
1. Vercel Dashboard > Domains
2. Add Domain
3. Siga as instruções de DNS

---

## 📁 Projeto está pronto em:
`/root/convite/frontend`

## 📖 Documentação completa:
`/root/convite/DEPLOY.md`
