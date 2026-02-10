# 🚀 Guia de Configuração Vercel + Supabase

Este guia mostra como configurar as variáveis de ambiente do Supabase na Vercel usando o CLI.

## Pré-requisitos

1. **Node.js** instalado
2. **Vercel CLI** instalado:
   ```bash
   npm install -g vercel
   # ou
   npx vercel
   ```

3. **Logado na Vercel**:
   ```bash
   npx vercel login
   ```

4. **Projeto vinculado** (execute na pasta do frontend):
   ```bash
   cd frontend
   npx vercel link
   ```

## 📝 Passo a Passo

### 1. Obter Credenciais do Supabase

Acesse: https://app.supabase.com

1. Entre no seu projeto
2. Clique em **Project Settings** (⚙️)
3. Clique em **API** no menu lateral
4. Copie os seguintes valores:

   ![Credenciais Supabase](https://i.imgur.com/example.png)

   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Executar o Script

```bash
cd /root/convite
./setup-vercel-env.sh
```

O script vai pedir:
- SUPABASE_URL
- SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY

### 3. Fazer Redeploy

Após configurar as variáveis:

```bash
cd frontend
npx vercel --prod
```

Ou pelo painel da Vercel:
1. Acesse https://vercel.com/dashboard
2. Clique no projeto
3. Vá em **Deployments**
4. Clique nos **três pontos** (...) do deploy mais recente
5. Clique em **Redeploy**

## ✅ Verificação

Após o redeploy, teste o pagamento PIX novamente. O erro "UNAUTHORIZED" deve ter desaparecido.

## 🛠️ Troubleshooting

### "Você não está logado na Vercel"
```bash
npx vercel login
```

### "Projeto não vinculado à Vercel"
```bash
cd frontend
npx vercel link
```

### "Comando vercel não encontrado"
```bash
npm install -g vercel
```

## 📋 Resumo das Variáveis

| Variável | Descrição | Segredo? |
|----------|-----------|----------|
| `SUPABASE_URL` | URL do projeto Supabase | ❌ |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do Supabase | ❌ |
| `SUPABASE_ANON_KEY` | Chave pública (anon) | ❌ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública para frontend | ❌ |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta com acesso total | ✅ |

---

Pronto! 🎉
