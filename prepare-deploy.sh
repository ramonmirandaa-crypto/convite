#!/bin/bash

# Script para preparar o ambiente antes do deploy

echo "══════════════════════════════════════════════════════════"
echo "  🔧 PREPARAÇÃO PARA DEPLOY"
echo "══════════════════════════════════════════════════════════"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd /root/convite/frontend

# Verificar se as variáveis de ambiente estão configuradas
echo "Verificando variáveis de ambiente..."

if [ -z "$POSTGRES_PRISMA_URL" ]; then
    echo -e "${RED}❌ POSTGRES_PRISMA_URL não está configurada${NC}"
    echo "Por favor, configure no arquivo .env.local ou exporte a variável:"
    echo "export POSTGRES_PRISMA_URL='postgresql://postgres:SENHA@db.ldnsqfhvoktggurghbrz.supabase.co:5432/postgres?schema=public'"
    exit 1
fi

echo -e "${GREEN}✓ POSTGRES_PRISMA_URL configurada${NC}"

# Instalar dependências
echo ""
echo "Instalando dependências..."
npm install

# Gerar Prisma Client
echo ""
echo "Gerando Prisma Client..."
npx prisma generate

# Rodar migrações
echo ""
echo "Rodando migrações do banco de dados..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrações aplicadas com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao aplicar migrações${NC}"
    echo "Verifique se o banco de dados está acessível."
    exit 1
fi

# Testar build local
echo ""
echo "Testando build local..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build local bem-sucedido${NC}"
else
    echo -e "${RED}❌ Erro no build local${NC}"
    echo "Corrija os erros antes de fazer o deploy."
    exit 1
fi

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Ambiente preparado com sucesso!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Agora você pode fazer o deploy com:"
echo "  ./deploy-quick.sh"
echo ""
