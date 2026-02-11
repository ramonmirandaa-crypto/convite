# 📸 Configuração do Supabase Storage para Upload de Imagens

Este guia explica como configurar o **Supabase Storage** para permitir o upload de imagens nos presentes e fotos da galeria.

---

## ✅ Configuração Automática (RECOMENDADO)

O sistema agora **cria automaticamente** o bucket quando você tenta fazer upload de uma imagem. Basta tentar adicionar uma imagem a um presente que o sistema:

1. ✅ Detecta que o bucket não existe
2. ✅ Cria o bucket automaticamente como público
3. ✅ Configura as políticas de acesso (RLS)
4. ✅ Completa o upload

### Se a configuração automática falhar:

1. Acesse a página de diagnóstico: `/admin/dashboard/diagnostic`
2. Clique no botão **"Configurar Storage Automaticamente"**
3. O sistema tentará criar o bucket e configurar as políticas

---

## 🔧 Configuração Manual (se automática falhar)

Se a configuração automática não funcionar, siga estes passos:

### 1. Acesse o Dashboard do Supabase

1. Vá para https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto do convite de casamento

---

### 2. Crie o Bucket de Storage

1. No menu lateral, clique em **Storage**
2. Clique no botão **New bucket** (ou "Novo bucket")
3. Preencha as informações:
   - **Name**: `photos` (exatamente assim, em minúsculas)
   - **Public bucket**: ✅ Marque esta opção (MUITO IMPORTANTE!)
4. Clique em **Save**

---

### 3. Configure as Políticas de Acesso (RLS)

1. Dentro do bucket `photos`, clique na aba **Policies**
2. Clique em **New Policy** (ou "Nova Política")
3. Para cada operação abaixo, crie uma política:

#### Política 1: SELECT (Leitura pública)
- **Name**: `Allow public read access`
- **Allowed operation**: `SELECT`
- **Target roles**: `anon`
- **Policy definition**: `bucket_id = 'photos'`

#### Política 2: INSERT (Upload)
- **Name**: `Allow service role uploads`
- **Allowed operation**: `INSERT`
- **Target roles**: `service_role`
- **WITH CHECK expression**: `bucket_id = 'photos'`

#### Política 3: DELETE
- **Name**: `Allow service role deletes`
- **Allowed operation**: `DELETE`
- **Target roles**: `service_role`
- **Policy definition**: `bucket_id = 'photos'`

---

### 4. Usando SQL (alternativa)

Você também pode executar este SQL no **SQL Editor** do Supabase:

```sql
-- Criar bucket se não existir
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Garantir que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role deletes" ON storage.objects;

-- Política 1: Leitura pública
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'photos');

-- Política 2: Upload via service_role
CREATE POLICY "Allow service role uploads"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'photos');

-- Política 3: Delete via service_role
CREATE POLICY "Allow service role deletes"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'photos');
```

---

## 🔍 Verificação

Após configurar, teste o upload:

1. Acesse `/admin/dashboard/diagnostic`
2. Verifique se o status do Storage mostra ✅ Configurado
3. Tente criar um novo presente com imagem

---

## 🛠️ Solução de Problemas

### Erro: "Bucket not found"

O sistema tenta criar automaticamente. Se falhar:
- Vá no Supabase Dashboard → Storage
- Crie manualmente o bucket "photos"
- Marque como **Public**

### Erro: "new row violates row-level security policy"

As políticas RLS não estão configuradas:
- Siga o passo 3 acima para configurar as políticas
- Ou use o SQL fornecido

### Erro: "Supabase service role key not configured"

A variável `SUPABASE_SERVICE_ROLE_KEY` não está configurada:
- Vá em Project Settings → API
- Copie a **service_role key** (não a anon key!)
- Adicione como variável de ambiente no Vercel

### Erro: "Upload local não disponível na Vercel"

Você está na Vercel mas o Supabase Storage não está configurado:
- Configure o bucket como explicado acima
- Certifique-se de que `SUPABASE_SERVICE_ROLE_KEY` está configurada

---

## 📁 Estrutura dos Arquivos

Os arquivos serão salvos no bucket com esta estrutura:
```
photos/
  └── uploads/
      ├── xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.jpg
      ├── xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.png
      └── ...
```

---

## 🔗 Links Úteis

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 💡 Dica

Se preferir não usar o Supabase Storage, você pode usar URLs de imagens externas:
- Imgur
- Cloudinary
- AWS S3
- Qualquer outro serviço de hospedagem de imagens

Basta colar a URL no campo "URL da imagem" ao criar/editar um presente.
