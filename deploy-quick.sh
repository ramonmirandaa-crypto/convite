#!/bin/bash

# =============================================================================
# DEPLOY RÁPIDO - CONVITE DE CASAMENTO
# =============================================================================
# Script simplificado para deploy rápido na Vercel
# Uso: ./deploy-quick.sh
# =============================================================================

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 DEPLOY RÁPIDO - CONVITE DE CASAMENTO${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar diretório
if [ ! -d "frontend" ]; then
    echo "❌ Diretório frontend não encontrado"
    exit 1
fi

cd frontend

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Instalando Vercel CLI...${NC}"
    npm install -g vercel
fi

# Verificar login
echo -e "${BLUE}Verificando login na Vercel...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Faça login na Vercel:${NC}"
    vercel login
fi

echo -e "${GREEN}✓ Logado como: $(vercel whoami)${NC}"
echo ""

# Perguntar tipo de deploy
echo "Tipo de deploy:"
echo "  1) Preview (padrão)"
echo "  2) Production"
echo ""
read -p "Escolha (1 ou 2): " choice

if [ "$choice" = "2" ]; then
    echo -e "${BLUE}Iniciando deploy de PRODUÇÃO...${NC}"
    vercel --prod
else
    echo -e "${BLUE}Iniciando deploy de PREVIEW...${NC}"
    vercel
fi

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ DEPLOY CONCLUÍDO!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
