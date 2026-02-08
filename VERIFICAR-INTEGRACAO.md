# ✅ Verificação da Integração Vercel + Supabase

## 🌐 URLs Importantes

| Serviço | URL |
|---------|-----|
| **Site** | https://weending.vercel.app |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Supabase Dashboard** | https://app.supabase.com |

---

## 🔍 Testar Conexão

### 1. Health Check
Acesse: https://weending.vercel.app/api/health

**Esperado:**
```json
{
  "status": "ok",
  "message": "API está funcionando"
}
```

### 2. Dados do Evento
Acesse: https://weending.vercel.app/api/event

**Esperado (se banco configurado):**
```json
{
  "id": "uuid...",
  "coupleNames": "Raiana & Raphael",
  "date": "2026-05-16T12:00:00.000Z",
  "venue": "Rancho do Coutinho, Estrada Sao Jose do Turvo, 2195",
  ...
}
```

**Se retornar erro 500:** O banco não está conectado

---

## ⚙️ Checklist de Configuração

### ✅ Supabase
- [ ] Projeto criado
- [ ] Senha do banco definida
- [ ] Connection String copiada
- [ ] Migrations executadas
- [ ] Seed executado (dados padrão)

### ✅ Vercel
- [ ] Projeto deployado
- [ ] Variável `DATABASE_URL` configurada
- [ ] Variável `ENCRYPTION_KEY` configurada
- [ ] Variável `ADMIN_USER` configurada
- [ ] Variável `ADMIN_PASSWORD` configurada
- [ ] Redeploy realizado após configurar variáveis

### ✅ Testes
- [ ] Página inicial carrega
- [ ] API `/api/health` funciona
- [ ] API `/api/event` retorna dados
- [ ] API `/api/gifts` retorna lista
- [ ] Formulário RSVP funciona
- [ ] Reserva de presente funciona

---

## 🚨 Problemas Comuns

### "Cannot reach database server"
**Causa:** Senha incorreta ou IP bloqueado
**Solução:**
1. Verifique a senha na `DATABASE_URL`
2. No Supabase: Settings > Database > Network Restrictions
3. Desative "Restrict to specific IP addresses" ou adicione 0.0.0.0/0

### "relation 'events' does not exist"
**Causa:** Migrations não executadas
**Solução:**
```bash
cd frontend
npx prisma migrate deploy
```

### "Internal Server Error" (500)
**Causa:** Variáveis de ambiente não configuradas
**Solução:**
1. Verifique todas as variáveis na Vercel
2. Faça redeploy

### "Request failed with status code 500" no formulário
**Causa:** Erro no banco ou variáveis
**Solução:**
1. Verifique logs na Vercel: Dashboard > Functions
2. Confirme que todas as variáveis estão definidas

---

## 📊 Status Atual

Para verificar o status atual, execute:

```bash
# Testar APIs
curl https://weending.vercel.app/api/health
curl https://weending.vercel.app/api/event
curl https://weending.vercel.app/api/gifts
```

Ou acesse diretamente no navegador.

---

## 🎯 Próximos Passos

Se tudo estiver configurado:

1. **Personalize o conteúdo**
   - Edite os dados do casal no Supabase
   - Adicione fotos reais
   - Atualize data e local

2. **Configure pagamento (opcional)**
   - Adicione chave PIX no Supabase
   - Configure Mercado Pago (se necessário)

3. **Teste completo**
   - Faça um RSVP de teste
   - Reserve um presente
   - Envie uma mensagem de contato

4. **Compartilhe!**
   - Envie o link para os convidados
   - https://weending.vercel.app

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs na Vercel: Dashboard > Functions
2. Verifique os logs no Supabase: Logs > Postgres
3. Confira o guia completo: `SUPABASE-SETUP.md`
4. Execute o script: `./vercel-supabase-integration.sh`
