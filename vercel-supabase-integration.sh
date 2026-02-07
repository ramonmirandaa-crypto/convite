#!/bin/bash

echo "🚀 Script de Integração Vercel + Supabase"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script do diretório frontend/"
    exit 1
fi

echo "📋 Passos para configurar a integração:"
echo ""

echo "1️⃣  Criar projeto no Supabase:"
echo "   → https://supabase.com"
echo "   → New Project → Nomeie o projeto"
echo "   → Defina uma senha segura"
echo ""

echo "2️⃣  Obter Connection String:"
echo "   → Project Settings > Database > Connection string"
echo "   → Selecione 'URI' e copie"
echo ""

echo "3️⃣  Configurar variáveis na Vercel:"
echo "   → https://vercel.com/dashboard > Seu Projeto"
echo "   → Settings > Environment Variables"
echo ""

# Gerar chave de encriptação
ENCRYPTION_KEY=$(openssl rand -base64 32)

echo "4️⃣  Variáveis necessárias:"
echo ""
echo "   DATABASE_URL=postgresql://postgres:SENHA@db.xxx.supabase.co:5432/postgres"
echo "   ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "   ADMIN_USER=admin"
echo "   ADMIN_PASSWORD=sua-senha-admin"
echo ""

read -p "Pressione ENTER quando tiver configurado as variáveis na Vercel..."

echo ""
echo "5️⃣  Testando conexão com o banco..."

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
    echo "   ⚠️  DATABASE_URL não encontrada nas variáveis de ambiente"
    echo "   Digite a DATABASE_URL para testar:"
    read DATABASE_URL
fi

# Criar .env temporário
echo "DATABASE_URL=$DATABASE_URL" > .env

# Testar conexão
echo "   Executando migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations aplicadas com sucesso!"
    echo ""
    
    read -p "Deseja executar o seed (criar dados padrão)? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        npx prisma db seed
        if [ $? -eq 0 ]; then
            echo "✅ Seed executado com sucesso!"
        else
            echo "❌ Erro ao executar seed"
        fi
    fi
    
    echo ""
    echo "🎉 Integração configurada!"
    echo ""
    echo "Próximos passos:"
    echo "1. Faça redeploy na Vercel:"
    echo "   https://vercel.com/dashboard"
    echo ""
    echo "2. Teste as APIs:"
    echo "   https://weending.vercel.app/api/health"
    echo "   https://weending.vercel.app/api/event"
    echo ""
else
    echo ""
    echo "❌ Erro ao conectar com o banco"
    echo "Verifique:"
    echo "- Se a senha está correta"
    echo "- Se o projeto Supabase está ativo"
    echo "- Se o IP está liberado no Supabase"
fi

# Limpar .env temporário
rm -f .env

echo ""
echo "=========================================="
echo "📖 Guia completo: SUPABASE-SETUP.md"
