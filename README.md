# Sistema de Convite de Casamento

Sistema digital completo para gerenciar convites de casamento, incluindo confirmações de presença (RSVP), lista de presentes e galeria de fotos.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

Este sistema foi desenvolvido para facilitar o gerenciamento de convites de casamento, permitindo que os convidados confirmem presença, escolham presentes da lista e visualizem fotos do casal de forma digital e interativa.

## ✨ Funcionalidades

### Frontend
- ✅ Página inicial com navegação intuitiva
- ✅ Seção de boas-vindas com detalhes do evento
- ✅ Formulário de confirmação de presença (RSVP)
- ✅ Lista de presentes interativa com sistema de reserva
- ✅ Galeria de fotos responsiva
- ✅ Formulário de contato
- ✅ Design responsivo (mobile-first)
- ✅ Interface moderna e elegante

### Backend
- ✅ API RESTful completa
- ✅ Endpoints para RSVP, presentes e contato
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ Health check

### Banco de Dados
- ✅ Schema Prisma configurado
- ✅ Modelos para RSVP, Presentes e Contato
- ✅ Migrations preparadas

## 🛠 Tecnologias

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Fontes**: Inter (Google Fonts)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Linguagem**: TypeScript
- **ORM**: Prisma

### Banco de Dados
- **SGBD**: PostgreSQL
- **ORM**: Prisma

## 📁 Estrutura do Projeto

```
/root/convite/
├── frontend/                    # Aplicação Next.js
│   ├── app/                     # App Router
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Página inicial
│   │   ├── globals.css         # Estilos globais
│   │   ├── welcome/            # Seção de boas-vindas
│   │   ├── rsvp/               # Confirmação de presença
│   │   ├── gifts/              # Lista de presentes
│   │   ├── gallery/            # Galeria de fotos
│   │   └── contact/            # Contato
│   ├── components/              # Componentes reutilizáveis
│   ├── lib/                    # Utilitários e helpers
│   ├── public/                 # Arquivos estáticos
│   ├── types/                  # Definições TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── next.config.js
│
├── backend/                     # API Express
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── routes/             # Rotas da API
│   │   │   ├── rsvp.ts
│   │   │   ├── gifts.ts
│   │   │   └── contact.ts
│   │   ├── controllers/        # Controladores
│   │   ├── models/             # Modelos de dados
│   │   ├── middleware/         # Middleware
│   │   └── config/             # Configurações
│   ├── tests/                  # Testes
│   ├── package.json
│   └── tsconfig.json
│
├── database/                    # Configurações do banco
│   ├── config/
│   │   ├── schema.prisma       # Schema Prisma
│   │   └── .env.example        # Exemplo de variáveis de ambiente
│   ├── migrations/             # Migrations
│   └── seeds/                  # Seeds
│
├── docs/                        # Documentação
│   ├── api/                    # Documentação da API
│   ├── design/                 # Design system
│   └── requirements/           # Requisitos do projeto
│
├── assets/                      # Arquivos estáticos
│   ├── images/                 # Imagens
│   ├── fonts/                  # Fontes
│   └── icons/                  # Ícones
│
├── scripts/                     # Scripts de automação
├── config/                      # Configurações do projeto
└── README.md                    # Este arquivo
```

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- npm ou yarn

### 1. Clonar o repositório

```bash
git clone <repository-url>
cd convite
```

### 2. Instalar dependências do Frontend

```bash
cd frontend
npm install
```

### 3. Instalar dependências do Backend

```bash
cd ../backend
npm install
```

### 4. Configurar Banco de Dados

```bash
cd ../database/config
cp .env.example .env
# Editar .env com suas credenciais do PostgreSQL
```

### 5. Executar Migrations

```bash
cd ../..
npx prisma migrate dev --name init
npx prisma generate
```

## 💻 Desenvolvimento

### Iniciar Frontend

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### Iniciar Backend

```bash
cd backend
npm run dev
```

O backend estará disponível em `http://localhost:3001`

### Executar em modo desenvolvimento (ambos)

Abra dois terminais e execute:

**Terminal 1 (Frontend):**
```bash
cd frontend
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev
```

## 📦 Deploy

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Railway)

```bash
cd backend
npm run build
railway up
```

### Banco de Dados

Configure as variáveis de ambiente no serviço de hosting:

```env
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

## 📚 Documentação

- [Documentação da API](./docs/api/README.md)
- [Design System](./docs/design/README.md)
- [Requisitos do Projeto](./docs/requirements/README.md)

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- Seu Nome - Desenvolvimento inicial

## 🙏 Agradecimentos

- Next.js team pelo excelente framework
- Tailwind CSS pela estilização intuitiva
- Prisma pelo ORM poderoso

---

Desenvolvido com ❤️ para casamentos especiais