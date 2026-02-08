#!/bin/bash

# =============================================================================
# SCRIPT DE DEPLOY - CONVITE DE CASAMENTO
# =============================================================================
# Este script automatiza o deploy do aplicativo na Vercel
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variáveis
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# =============================================================================
# FUNÇÕES UTILITÁRIAS
# =============================================================================

print_header() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# =============================================================================
# VERIFICAÇÃO DE PRÉ-REQUISITOS
# =============================================================================

check_prerequisites() {
    print_header "VERIFICANDO PRÉ-REQUISITOS"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado"
        echo "  Instale o Node.js: https://nodejs.org/ (versão 18+)"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versão 18+ é necessário (encontrado: $(node --version))"
        exit 1
    fi
    print_success "Node.js $(node --version)"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm não está instalado"
        exit 1
    fi
    print_success "npm $(npm --version)"
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_error "Git não está instalado"
        exit 1
    fi
    print_success "Git $(git --version | cut -d' ' -f3)"
    
    # Verificar Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI não encontrado"
        print_step "Instalando Vercel CLI..."
        npm install -g vercel
        print_success "Vercel CLI instalado"
    else
        print_success "Vercel CLI $(vercel --version)"
    fi
    
    # Verificar diretório frontend
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Diretório frontend não encontrado em: $FRONTEND_DIR"
        exit 1
    fi
    print_success "Diretório do projeto encontrado"
}

# =============================================================================
# CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE
# =============================================================================

setup_environment() {
    print_header "CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE"
    
    print_info "Vamos configurar as variáveis de ambiente necessárias"
    echo ""
    
    # Verificar se já existe .env.local
    ENV_FILE="$FRONTEND_DIR/.env.local"
    
    if [ -f "$ENV_FILE" ]; then
        print_warning "Arquivo .env.local já existe"
        read -p "Deseja sobrescrever? (s/N): " overwrite
        if [[ ! "$overwrite" =~ ^[Ss]$ ]]; then
            print_info "Usando configurações existentes"
            return
        fi
    fi
    
    echo ""
    print_step "Configurando variáveis de ambiente..."
    echo ""
    
    # DATABASE_URL
    echo -e "${YELLOW}1. BANCO DE DADOS (PostgreSQL)${NC}"
    echo "   Opções: Supabase (recomendado), Neon, ou outro PostgreSQL"
    echo "   - Supabase: https://supabase.com"
    echo "   - Neon: https://neon.tech"
    echo ""
    read -p "DATABASE_URL (postgresql://...): " DATABASE_URL
    
    while [[ -z "$DATABASE_URL" || ! "$DATABASE_URL" =~ ^postgresql:// ]]; do
        print_error "URL inválida. Deve começar com 'postgresql://'"
        read -p "DATABASE_URL (postgresql://...): " DATABASE_URL
    done
    
    # ENCRYPTION_KEY
    echo ""
    print_step "Gerando ENCRYPTION_KEY..."
    if command -v openssl &> /dev/null; then
        ENCRYPTION_KEY=$(openssl rand -base64 32)
        print_success "Chave gerada automaticamente"
    else
        read -p "ENCRYPTION_KEY (ou pressione Enter para usar uma padrão): " ENCRYPTION_KEY
        if [ -z "$ENCRYPTION_KEY" ]; then
            ENCRYPTION_KEY="sua-chave-secreta-de-32-caracteres-minimo!!"
            print_warning "Usando chave padrão (não recomendado para produção)"
        fi
    fi
    
    # ADMIN_USER
    echo ""
    read -p "ADMIN_USER (padrão: admin): " ADMIN_USER
    ADMIN_USER=${ADMIN_USER:-admin}
    
    # ADMIN_PASSWORD
    echo ""
    read -s -p "ADMIN_PASSWORD: " ADMIN_PASSWORD
    echo ""
    while [ ${#ADMIN_PASSWORD} -lt 6 ]; do
        print_error "Senha deve ter pelo menos 6 caracteres"
        read -s -p "ADMIN_PASSWORD: " ADMIN_PASSWORD
        echo ""
    done
    
    # Salvar arquivo
    cat > "$ENV_FILE" << EOF
# Banco de Dados
DATABASE_URL=$DATABASE_URL

# Segurança
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Admin
ADMIN_USER=$ADMIN_USER
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Configurações Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    
    print_success "Arquivo .env.local criado em: $ENV_FILE"
    print_warning "⚠️  Este arquivo contém informações sensíveis - não commit!"
}

# =============================================================================
# INSTALAÇÃO DE DEPENDÊNCIAS
# =============================================================================

install_dependencies() {
    print_header "INSTALANDO DEPENDÊNCIAS"
    
    cd "$FRONTEND_DIR"
    
    if [ -d "node_modules" ]; then
        print_warning "node_modules já existe"
        read -p "Deseja reinstalar? (s/N): " reinstall
        if [[ "$reinstall" =~ ^[Ss]$ ]]; then
            print_step "Removendo node_modules..."
            rm -rf node_modules package-lock.json
        else
            print_info "Pulando instalação"
            return
        fi
    fi
    
    print_step "Instalando dependências..."
    npm install
    
    print_success "Dependências instaladas"
}

# =============================================================================
# CONFIGURAÇÃO DO BANCO DE DADOS
# =============================================================================

setup_database() {
    print_header "CONFIGURANDO BANCO DE DADOS"
    
    cd "$FRONTEND_DIR"
    
    print_step "Gerando cliente Prisma..."
    npx prisma generate
    print_success "Cliente Prisma gerado"
    
    print_step "Executando migrations..."
    if npx prisma migrate deploy 2>/dev/null; then
        print_success "Migrations executadas"
    else
        print_warning "Não foi possível executar migrations automaticamente"
        print_info "Execute manualmente: npx prisma migrate dev --name init"
    fi
    
    print_step "Verificando seed..."
    read -p "Deseja popular o banco com dados iniciais? (S/n): " do_seed
    if [[ ! "$do_seed" =~ ^[Nn]$ ]]; then
        npx prisma db seed || print_warning "Seed falhou ou já foi executado"
    fi
}

# =============================================================================
# BUILD LOCAL
# =============================================================================

local_build() {
    print_header "BUILD LOCAL"
    
    cd "$FRONTEND_DIR"
    
    print_step "Executando build local..."
    if npm run build; then
        print_success "Build local bem-sucedido!"
    else
        print_error "Build local falhou"
        print_info "Corrija os erros antes de continuar o deploy"
        exit 1
    fi
}

# =============================================================================
# DEPLOY NA VERCEL
# =============================================================================

deploy_vercel() {
    print_header "DEPLOY NA VERCEL"
    
    cd "$FRONTEND_DIR"
    
    # Verificar login
    print_step "Verificando login na Vercel..."
    if ! vercel whoami &> /dev/null; then
        print_warning "Não está logado na Vercel"
        print_step "Iniciando login..."
        vercel login
    fi
    
    print_success "Logado na Vercel como: $(vercel whoami)"
    
    # Perguntar tipo de deploy
    echo ""
    print_info "Opções de deploy:"
    echo "  1) Deploy de pré-visualização (preview)"
    echo "  2) Deploy de produção (production)"
    echo ""
    read -p "Escolha (1 ou 2): " deploy_type
    
    print_step "Iniciando deploy..."
    
    if [ "$deploy_type" = "2" ]; then
        vercel --prod
    else
        vercel
    fi
    
    print_success "Deploy iniciado!"
    
    # Capturar URL do deploy
    DEPLOY_URL=$(vercel --version &> /dev/null && vercel ls 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
    if [ -n "$DEPLOY_URL" ]; then
        print_info "URL do deploy: $DEPLOY_URL"
    fi
}

# =============================================================================
# CONFIGURAR VARIÁVEIS NA VERCEL
# =============================================================================

setup_vercel_env() {
    print_header "CONFIGURANDO VARIÁVEIS NA VERCEL"
    
    cd "$FRONTEND_DIR"
    
    print_info "As variáveis de ambiente precisam ser configuradas no dashboard da Vercel"
    echo ""
    print_step "Abrindo dashboard da Vercel..."
    
    # Tentar abrir o projeto
    vercel --version &> /dev/null && vercel open &> /dev/null || true
    
    echo ""
    print_info "Para configurar as variáveis:"
    echo "  1. Acesse o dashboard do projeto na Vercel"
    echo "  2. Vá em Settings > Environment Variables"
    echo "  3. Adicione as seguintes variáveis:"
    echo ""
    
    # Ler do .env.local
    ENV_FILE="$FRONTEND_DIR/.env.local"
    if [ -f "$ENV_FILE" ]; then
        echo -e "${CYAN}Variáveis do arquivo .env.local:${NC}"
        cat "$ENV_FILE" | grep -v "^#" | grep -v "^$" | while read line; do
            KEY=$(echo "$line" | cut -d'=' -f1)
            echo "     - $KEY"
        done
    fi
    
    echo ""
    print_warning "Após adicionar as variáveis, faça um redeploy:"
    echo "  cd frontend && vercel --prod"
}

# =============================================================================
# VERIFICAÇÃO PÓS-DEPLOY
# =============================================================================

post_deploy_check() {
    print_header "VERIFICAÇÃO PÓS-DEPLOY"
    
    print_info "Verificações recomendadas após o deploy:"
    echo ""
    echo "  1. Acesse a URL do deploy"
    echo "  2. Teste a página inicial"
    echo "  3. Teste a API de health check: /api/health"
    echo "  4. Teste a API de evento: /api/event"
    echo "  5. Teste o formulário de RSVP"
    echo "  6. Acesse o painel admin: /admin"
    echo ""
    
    read -p "Deseja abrir o site no navegador? (S/n): " open_browser
    if [[ ! "$open_browser" =~ ^[Nn]$ ]]; then
        vercel open &> /dev/null || print_warning "Não foi possível abrir automaticamente"
    fi
}

# =============================================================================
# MENU PRINCIPAL
# =============================================================================

show_menu() {
    print_header "🚀 SCRIPT DE DEPLOY - CONVITE DE CASAMENTO"
    
    echo "Escolha uma opção:"
    echo ""
    echo "  1) Deploy completo (recomendado para primeira vez)"
    echo "  2) Apenas instalar dependências"
    echo "  3) Apenas configurar variáveis de ambiente"
    echo "  4) Apenas executar migrations"
    echo "  5) Apenas build local"
    echo "  6) Apenas deploy na Vercel"
    echo "  7) Verificar status"
    echo "  8) Sair"
    echo ""
}

full_deploy() {
    check_prerequisites
    setup_environment
    install_dependencies
    setup_database
    local_build
    deploy_vercel
    setup_vercel_env
    post_deploy_check
}

show_status() {
    print_header "STATUS DO PROJETO"
    
    echo -e "${CYAN}Estrutura:${NC}"
    echo "  Root: $PROJECT_ROOT"
    echo "  Frontend: $FRONTEND_DIR"
    echo ""
    
    echo -e "${CYAN}Arquivos de configuração:${NC}"
    [ -f "$FRONTEND_DIR/.env.local" ] && print_success ".env.local existe" || print_warning ".env.local não encontrado"
    [ -f "$FRONTEND_DIR/package.json" ] && print_success "package.json existe" || print_error "package.json não encontrado"
    [ -d "$FRONTEND_DIR/node_modules" ] && print_success "node_modules existe" || print_warning "node_modules não instalado"
    echo ""
    
    echo -e "${CYAN}Ferramentas:${NC}"
    command -v node &> /dev/null && print_success "Node.js: $(node --version)" || print_error "Node.js não instalado"
    command -v npm &> /dev/null && print_success "npm: $(npm --version)" || print_error "npm não instalado"
    command -v vercel &> /dev/null && print_success "Vercel CLI: $(vercel --version)" || print_warning "Vercel CLI não instalado"
    echo ""
    
    if command -v git &> /dev/null; then
        echo -e "${CYAN}Git:${NC}"
        echo "  Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
        echo "  Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
        echo "  Status: $(git status --porcelain 2>/dev/null | wc -l) arquivos modificados"
        echo ""
    fi
    
    if [ -f "$FRONTEND_DIR/.env.local" ]; then
        echo -e "${CYAN}Variáveis configuradas:${NC}"
        grep -v "^#" "$FRONTEND_DIR/.env.local" | grep -v "^$" | cut -d'=' -f1 | while read var; do
            echo "  ✓ $var"
        done
    fi
}

# =============================================================================
# EXECUÇÃO PRINCIPAL
# =============================================================================

main() {
    # Se passou argumento, executa diretamente
    case "$1" in
        "full"|"completo")
            full_deploy
            exit 0
            ;;
        "status")
            show_status
            exit 0
            ;;
        "build")
            check_prerequisites
            install_dependencies
            local_build
            exit 0
            ;;
        "deploy")
            deploy_vercel
            exit 0
            ;;
    esac
    
    # Menu interativo
    while true; do
        show_menu
        read -p "Opção: " option
        
        case $option in
            1)
                full_deploy
                break
                ;;
            2)
                check_prerequisites
                install_dependencies
                break
                ;;
            3)
                setup_environment
                break
                ;;
            4)
                setup_database
                break
                ;;
            5)
                check_prerequisites
                install_dependencies
                local_build
                break
                ;;
            6)
                deploy_vercel
                break
                ;;
            7)
                show_status
                ;;
            8)
                echo "Saindo..."
                exit 0
                ;;
            *)
                print_error "Opção inválida"
                ;;
        esac
    done
    
    print_header "DEPLOY CONCLUÍDO! 🎉"
    print_info "Seu convite de casamento está pronto!"
}

# Executar
main "$@"
