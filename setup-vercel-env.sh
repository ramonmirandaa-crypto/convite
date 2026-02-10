#!/bin/bash

# Script para configurar variáveis de ambiente do Supabase na Vercel
# Uso: ./setup-vercel-env.sh

set -e

echo "🚀 Configuração de variáveis de ambiente na Vercel"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica se está logado na Vercel
if ! npx vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Você não está logado na Vercel.${NC}"
    echo ""
    echo "Por favor, execute primeiro:"
    echo "  npx vercel login"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Logado na Vercel como:${NC} $(npx vercel whoami)"
echo ""

# Verifica se tem projeto vinculado
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}⚠️  Projeto não vinculado à Vercel.${NC}"
    echo ""
    echo "Execute para vincular:"
    echo "  npx vercel link"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Projeto vinculado à Vercel${NC}"
echo ""

# Função para adicionar variável
add_env_var() {
    local name=$1
    local value=$2
    local is_secret=$3
    
    echo -n "Configurando $name... "
    
    if [ "$is_secret" = "true" ]; then
        echo "$value" | npx vercel env add "$name" production --sensitive &> /dev/null
    else
        echo "$value" | npx vercel env add "$name" production &> /dev/null
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  (pode já existir)${NC}"
    fi
}

echo "📝 Informe as credenciais do Supabase"
echo "====================================="
echo ""
echo "Você encontra essas informações em:"
echo "https://app.supabase.com → Seu projeto → Project Settings (⚙️) → API"
echo ""

# Solicita as credenciais
read -p "SUPABASE_URL (ex: https://xxxxx.supabase.co): " SUPABASE_URL
read -p "SUPABASE_ANON_KEY (começa com eyJ...): " SUPABASE_ANON_KEY
read -s -p "SUPABASE_SERVICE_ROLE_KEY (secreta, começa com eyJ...): " SUPABASE_SERVICE_ROLE_KEY
echo ""

# Validação básica
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo ""
    echo -e "${RED}❌ Todas as credenciais são obrigatórias!${NC}"
    exit 1
fi

echo ""
echo "🚀 Configurando variáveis na Vercel..."
echo "======================================"
echo ""

# Adiciona as variáveis
add_env_var "SUPABASE_URL" "$SUPABASE_URL" "false"
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "false"
add_env_var "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "false"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "false"
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "true"

echo ""
echo -e "${GREEN}✅ Variáveis configuradas com sucesso!${NC}"
echo ""
echo "🔄 Agora você precisa fazer um redeploy para aplicar as mudanças:"
echo ""
echo "  npx vercel --prod"
echo ""
echo "Ou acesse o painel da Vercel e clique em 'Redeploy'."
echo ""
