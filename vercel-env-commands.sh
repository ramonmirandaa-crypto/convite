#!/bin/bash

# Script para configurar variáveis de ambiente na Vercel
# Preencha os valores abaixo e execute o script

# ============================================
# PREENCHA AQUI SUAS CREDENCIAIS DO SUPABASE
# ============================================

# URL do projeto Supabase (ex: https://xxxxx.supabase.co)
SUPABASE_URL=""

# Chave anônima (pública) - começa com eyJ...
SUPABASE_ANON_KEY=""

# Chave de serviço (secreta) - começa com eyJ...
SUPABASE_SERVICE_ROLE_KEY=""

# ============================================
# NÃO ALTERE A PARTIR DAQUI
# ============================================

# Verifica se as variáveis foram preenchidas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ ERRO: Preencha as variáveis no início do script!"
    echo ""
    echo "Edite o arquivo e preencha:"
    echo "  SUPABASE_URL"
    echo "  SUPABASE_ANON_KEY"
    echo "  SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    exit 1
fi

echo "🚀 Configurando variáveis na Vercel..."
echo ""

# Função para adicionar variável
add_var() {
    local name=$1
    local value=$2
    echo "→ $name"
    echo "$value" | npx vercel env add "$name" production
}

# Adiciona as variáveis
add_var "SUPABASE_URL" "$SUPABASE_URL"
add_var "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
add_var "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
add_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"

# Service role key é sensível
echo "→ SUPABASE_SERVICE_ROLE_KEY (secreta)"
echo "$SUPABASE_SERVICE_ROLE_KEY" | npx vercel env add "SUPABASE_SERVICE_ROLE_KEY" production --sensitive

echo ""
echo "✅ Variáveis configuradas!"
echo ""
echo "Agora faça o redeploy:"
echo "  npx vercel --prod"
