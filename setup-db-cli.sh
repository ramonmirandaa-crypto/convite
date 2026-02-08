#!/bin/bash

echo "🗄️  Setup do Banco de Dados via CLI"
echo "===================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute do diretório frontend/"
    exit 1
fi

echo "ℹ️  As variáveis de ambiente já foram sincronizadas pela integração Vercel+Supabase"
echo ""

# Perguntar se quer usar variáveis locais ou da Vercel
echo "Como deseja configurar?"
echo "1) Usar variáveis da integração Vercel (recomendado)"
echo "2) Inserir URLs manualmente"
read -p "Opção (1 ou 2): " opcao

if [ "$opcao" = "1" ]; then
    echo ""
    echo "📥 Obtendo variáveis do projeto Vercel..."
    echo "(Isso requer que você tenha permissão no projeto)"
    echo ""
    
    # Tentar puxar variáveis da Vercel
    vercel env pull .env.local 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Variáveis obtidas com sucesso!"
        mv .env.local .env
    else
        echo "⚠️  Não foi possível obter automaticamente"
        echo "Vamos configurar manualmente..."
        opcao="2"
    fi
fi

if [ "$opcao" = "2" ]; then
    echo ""
    echo "📋 Por favor, insira as informações do Supabase:"
    echo "(Encontrado em: Supabase Dashboard > Settings > Database > Connection string)"
    echo ""
    
    read -p "POSTGRES_PRISMA_URL (com pooling): " prisma_url
    read -p "POSTGRES_URL_NON_POOLING (direta): " non_pooling_url
    
    echo "POSTGRES_PRISMA_URL=$prisma_url" > .env
    echo "POSTGRES_URL_NON_POOLING=$non_pooling_url" >> .env
    echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env
    echo "ADMIN_USER=admin" >> .env
    echo "ADMIN_PASSWORD=admin123" >> .env
fi

echo ""
echo "🔧 Instalando dependências..."
npm install

echo ""
echo "🚀 Executando migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations aplicadas!"
    echo ""
    
    read -p "Deseja executar o seed (criar dados iniciais)? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo ""
        echo "🌱 Executando seed..."
        npx prisma db seed
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Seed concluído!"
        else
            echo ""
            echo "⚠️  Seed falhou, mas migrations estão OK"
            echo "Você pode inserir dados manualmente depois"
        fi
    fi
    
    echo ""
    echo "🎉 Banco de dados configurado!"
    echo ""
    echo "Testando conexão..."
    npx prisma db pull --print > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Conexão com banco: OK"
    else
        echo "⚠️  Verifique se as URLs estão corretas"
    fi
    
else
    echo ""
    echo "❌ Erro ao executar migrations"
    echo ""
    echo "Possíveis causas:"
    echo "1. URL incorreta"
    echo "2. IP não liberado no Supabase (Network Restrictions)"
    echo "3. Banco não existe ou usuário sem permissão"
    echo ""
    echo "Tente via SQL Editor no Supabase como alternativa"
fi

echo ""
echo "===================================="
echo "📊 Próximos passos:"
echo "1. Redeploy na Vercel:"
echo "   vercel --prod"
echo ""
echo "2. Testar APIs:"
echo "   https://weending.vercel.app/api/health"
echo "   https://weending.vercel.app/api/event"
echo "   https://weending.vercel.app/api/gifts"
echo ""

# Limpar
rm -f .env
