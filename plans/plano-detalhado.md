# Plano Detalhado: Sistema de Convite de Casamento com Pagamentos Brasileiros

## 📋 Visão Geral

Sistema web completo, robusto e escalável para convite de casamento com processamento real de pagamentos via PIX e cartão de crédito brasileiro. Este sistema será usado em **produção real**, processando valores reais de presentes de casamento.

**Data do Evento:** 22/06/2025

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Arquitetura

```mermaid
graph TB
    subgraph "Frontend - Next.js 14"
        A[Landing Page]
        B[RSVP Form]
        C[Gift List]
        D[Admin Dashboard]
        E[Payment Checkout]
    end

    subgraph "Backend - API Routes"
        F[API Routes]
        G[Webhooks]
        H[Auth Middleware]
    end

    subgraph "Services"
        I[PostgreSQL]
        J[Mercado Pago]
        K[Resend Email]
        L[Cloudinary]
        M[Google Maps]
        N[OpenWeather]
    end

    A --> F
    B --> F
    C --> F
    D --> F
    E --> F

    F --> I
    F --> J
    F --> K
    F --> L
    F --> M
    F --> N

    G --> F
    J --> G

    D --> H
    H --> F
```

### Stack Tecnológico

| Componente | Tecnologia | Versão |
|------------|-----------|--------|
| **Frontend** | Next.js 14 (App Router) | 14.0.0+ |
| **Linguagem** | TypeScript | 5.2+ |
| **Estilização** | Tailwind CSS | 3.4+ |
| **Animações** | Framer Motion | 10.16+ |
| **Formulários** | React Hook Form | 7.48+ |
| **Validação** | Zod | 3.22+ |
| **Data/Hora** | date-fns | 2.30+ |
| **QR Code** | qrcode.react | 3.1+ |
| **Pagamentos** | MercadoPago.js | SDK |
| **Autenticação** | NextAuth.js | 4.24+ |
| **Email** | Resend.com | SDK |
| **Storage** | Cloudinary | SDK |
| **Imagens** | Sharp | 0.33+ |
| **Backend** | Express | 4.18+ |
| **ORM** | Prisma | 5.7+ |
| **Banco de Dados** | PostgreSQL | 15+ |
| **Deploy** | Vercel Pro | - |

---

## 🎨 Design System

### Paleta de Cores

```mermaid
graph LR
    A[Dourado<br/>#D4AF37] --> B[Rosê<br/>#C9A9A6]
    B --> C[Off-white<br/>#FAF9F6]
    C --> D[Grafite<br/>#2C2C2C]
```

| Cor | Hex | Uso |
|-----|-----|-----|
| Dourado | `#D4AF37` | Acentos, botões primários, destaques |
| Rosê | `#C9A9A6` | Secundário, backgrounds suaves |
| Off-white | `#FAF9F6` | Background principal |
| Grafite | `#2C2C2C` | Texto principal, elementos escuros |

### Tipografia

| Elemento | Fonte | Peso | Tamanho |
|----------|-------|------|---------|
| Títulos H1 | Playfair Display | 700 | 3.5rem |
| Títulos H2 | Playfair Display | 600 | 2.5rem |
| Títulos H3 | Playfair Display | 500 | 1.75rem |
| Corpo | Inter | 400 | 1rem |
| Botões | Inter | 600 | 1rem |
| Labels | Inter | 500 | 0.875rem |

---

## 🗄️ Banco de Dados

### Schema Prisma Completo

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Event {
  id            String   @id @default(uuid())
  coupleNames   String
  date          DateTime
  venue         String
  venueMapsUrl  String?
  description   String?  @db.Text
  pixKey        String?  // Encriptada
  pixKeyType    String?  // CPF, EMAIL, PHONE, RANDOM
  mpConfig      Json?    // Configs Mercado Pago
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  gifts         Gift[]
  guests        Guest[]
  contributions Contribution[]

  @@map("events")
}

model Guest {
  id                   String   @id @default(uuid())
  eventId              String
  name                 String
  email                String
  phone                String?
  confirmed            Boolean  @default(false)
  guestCount           Int      @default(1)
  dietaryRestrictions  String?
  suggestedSong        String?
  qrCodeToken          String   @unique
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  event                Event    @relation(fields: [eventId], references: [id])
  contributions        Contribution[]

  @@map("guests")
}

model Gift {
  id          String   @id @default(uuid())
  eventId     String
  title       String
  description String?
  imageUrl    String?
  totalValue  Decimal  @db.Decimal(10, 2)
  status      String   @default("available") // available, fulfilled, hidden
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  event       Event    @relation(fields: [eventId], references: [id])
  contributions Contribution[]

  @@map("gifts")
}

model Contribution {
  id                String   @id @default(uuid())
  giftId            String
  guestId           String?
  amount            Decimal  @db.Decimal(10, 2)
  message           String?
  isAnonymous       Boolean  @default(false)

  // Dados do pagador (LGPD)
  payerName         String
  payerEmail        String
  payerCPF          String   // Hash ou encriptado
  payerPhone        String?

  // Gateway info
  paymentMethod     String   // pix, credit_card, boleto
  paymentStatus     String   @default("pending") // pending, approved, cancelled, refunded
  gatewayId         String   // ID externo (MP)
  gatewayResponse   Json?    // Log resposta API

  // Parcelamento
  installments       Int      @default(1)
  installmentAmount  Decimal? @db.Decimal(10, 2)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  gift              Gift     @relation(fields: [giftId], references: [id])
  guest             Guest?   @relation(fields: [guestId], references: [id])

  @@map("contributions")
}
```

---

## 💳 Fluxo de Pagamentos

### Fluxo PIX Dinâmico

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend
    participant MP as Mercado Pago
    participant DB as Banco de Dados
    participant E as Email Service

    U->>F: Seleciona presente e valor
    F->>F: Valida CPF (módulo 11)
    F->>B: POST /api/payments/pix
    B->>MP: Cria Payment PIX
    MP-->>B: QR Code + Copia e Cola
    B->>DB: Salva Contribution (pending)
    B-->>F: Retorna QR Code
    F->>U: Exibe QR Code + Countdown 30min
    U->>MP: Realiza pagamento PIX
    MP->>B: Webhook payment.approved
    B->>DB: Atualiza Contribution (approved)
    B->>DB: Incrementa valor arrecadado
    B->>E: Envia email confirmação
    E->>U: Email com comprovante
```

### Fluxo Cartão Parcelado

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend
    participant MP as Mercado Pago
    participant DB as Banco de Dados
    participant E as Email Service

    U->>F: Preenche dados cartão
    F->>F: MercadoPago.js tokeniza cartão
    F->>B: POST /api/payments/card
    B->>B: Valida CPF (módulo 11)
    B->>MP: Cria Payment com token
    MP-->>B: Status + 3DS (se necessário)
    alt Valor > R$ 200
        B-->>F: Redireciona para 3DS
        U->>MP: Autenticação 3DS
        MP->>B: Webhook payment.approved
    else Valor <= R$ 200
        MP-->>B: payment.approved
    end
    B->>DB: Atualiza Contribution (approved)
    B->>DB: Incrementa valor arrecadado
    B->>E: Envia email confirmação
    E->>U: Email com comprovante
```

---

## 📱 Estrutura de Páginas

### Página Pública (Convidados)

```mermaid
graph TB
    A[Landing Page] --> B[Hero Section]
    A --> C[Nossa História]
    A --> D[Galeria]
    A --> E[Informações]
    A --> F[RSVP]
    A --> G[Presentes]
    A --> H[Contato]

    B --> B1[Contador Regressivo]
    B --> B2[Parallax]
    B --> B3[Partículas/Pétalas]

    C --> C1[Timeline Vertical]
    C --> C2[Animações Framer Motion]

    D --> D1[Lazy Loading]
    D --> D2[Lightbox]

    E --> E1[Google Maps]
    E --> E2[Previsão Tempo]
    E --> E3[Dress Code]

    F --> F1[Formulário RSVP]
    F --> F2[Preferências Alimentares]
    F --> F3[Sugestão Música]
    F --> F4[QR Code]

    G --> G1[Grid Presentes]
    G --> G2[Sistema Cotas]
    G --> G3[Carrinho]
    G --> G4[Checkout PIX]
    G --> G5[Checkout Cartão]

    H --> H1[Formulário Contato]
```

### Área Administrativa (Noivos)

```mermaid
graph TB
    A[Admin Dashboard] --> B[Dashboard]
    A --> C[Convidados]
    A --> D[Presentes]
    A --> E[Financeiro]
    A --> F[Configurações]

    B --> B1[Total Arrecadado]
    B --> B2[Gráfico PIX vs Cartão]
    B --> B3[Taxa Conversão]
    B --> B4[Presentes Populares]

    C --> C1[Tabela Convidados]
    C --> C2[Filtros]
    C --> C3[Exportação Excel/CSV]
    C --> C4[Scanner QR Code]

    D --> D1[CRUD Presentes]
    D --> D2[Status Entregue/Esgotado]
    D --> D3[Ocultar Itens]

    E --> E1[Configurar Chave PIX]
    E --> E2[Transações Pendentes]
    E --> E3[Estorno Manual]

    F --> F1[Configurações Evento]
    F --> F2[Notificações]
    F --> F3[Log Atividades]
```

---

## 🔐 Segurança e LGPD

### Medidas de Segurança

```mermaid
graph TB
    A[Segurança] --> B[HTTPS/HSTS]
    A --> C[Criptografia AES-256]
    A --> D[Rate Limiting]
    A --> E[Validação Zod]
    A --> F[Proteção CSRF]
    A --> G[Sanitização XSS]
    A --> H[Webhook Signature]

    C --> C1[CPF]
    C --> C2[Chave PIX]
    C --> C3[Telefone]

    D --> D1[5 tentativas/10min]
    D --> D2[Por IP]

    E --> E1[Inputs Formulário]
    E --> E2[CPF Módulo 11]
    E --> E3[Email]

    H --> H1[Validar Secret]
    H --> H2[Verificar Payload]
```

### Compliance LGPD

- ✅ Checkbox explícito de consentimento
- ✅ Criptografia de dados sensíveis
- ✅ Anonimização automática (90 dias após evento)
- ✅ Política de privacidade
- ✅ Termos de uso
- ✅ Direito ao esquecimento
- ✅ Log de acesso a dados

---

## 🚀 Fluxo de Desenvolvimento

### Fases do Projeto

```mermaid
gantt
    title Cronograma de Desenvolvimento
    dateFormat  YYYY-MM-DD
    section Fase 1
    Configuração Inicial           :a1, 2025-01-29, 3d
    Infraestrutura                 :a2, after a1, 2d
    section Fase 2
    Banco de Dados                 :b1, after a2, 3d
    Schema Prisma                  :b2, after b1, 2d
    section Fase 3
    Landing Page                   :c1, after b2, 5d
    Design System                  :c2, after c1, 2d
    section Fase 4
    Sistema RSVP                   :d1, after c2, 4d
    QR Code                        :d2, after d1, 2d
    section Fase 5
    Lista Presentes                :e1, after d2, 5d
    Pagamentos PIX                 :e2, after e1, 3d
    Pagamentos Cartão              :e3, after e2, 4d
    section Fase 6
    Área Admin                     :f1, after e3, 6d
    Dashboard                      :f2, after f1, 3d
    section Fase 7
    Segurança                      :g1, after f2, 3d
    LGPD                           :g2, after g1, 2d
    section Fase 8
    Integrações                    :h1, after g2, 4d
    Webhooks                       :h2, after h1, 2d
    section Fase 9
    Testes                         :i1, after h2, 5d
    QA                             :i2, after i1, 3d
    section Fase 10
    Deploy                         :j1, after i2, 3d
    Produção                       :j2, after j1, 2d
    section Fase 11
    Documentação                   :k1, after j2, 3d
```

---

## 📊 Variáveis de Ambiente

### Frontend (.env.local)

```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_MP_INSTALLMENTS=6

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key

# OpenWeather
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-api-key
```

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx
MP_WEBHOOK_SECRET=random_string_para_validar_payload

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Cloudinary
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Telegram (opcional)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

---

## 🎯 MVP Mínimo (Priorização)

Se necessário priorizar, manter nesta ordem:

1. ✅ Landing page estática bonita
2. ✅ RSVP com email confirmação
3. ✅ Lista de presentes visual
4. ✅ Pagamento PIX (obrigatório para Brasil)
5. ✅ Área admin básica (ver presentes e confirmados)
6. ⏳ Cartão parcelado (fase 2 se necessário)
7. ⏳ Sistema de cotas parciais (fase 2 se necessário)

---

## 📝 Checklist de Entrega

### Antes do Deploy

- [ ] Fluxo PIX completo em sandbox (pagar e receber webhook)
- [ ] Cartão de teste recusado (validar erro amigável)
- [ ] Teste de carga: 50 requisições simultâneas na lista de presentes
- [ ] Validação CPF (testar CPF inválido é bloqueado)
- [ ] Teste mobile (iPhone SE, iPhone 14, Android médio)
- [ ] Teste de expiração de PIX (esperar ou forçar status cancelled)
- [ ] Todas as validações de formulário testadas
- [ ] Responsividade em diferentes tamanhos de tela
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Testes de segurança (OWASP Top 10)

### Documentação

- [ ] README completo (setup local, env vars, deploy)
- [ ] Scripts de migration Prisma
- [ ] Collection Insomnia/Postman para testar APIs
- [ ] "Como usar o painel admin" (para os noivos)
- [ ] "Como trocar fotos e textos"
- [ ] "Taxas dos gateways" (transparência)
- [ ] "Checklist dia do evento" (como fazer check-in com QR Code)

---

## 💡 Notas Importantes

1. **Fallback PIX Estático:** O sistema deve ter fallback para PIX estático apenas se o gateway falhar (mostrar QR Code estático dos noivos como último recurso, mas registrar manualmente depois).

2. **Mobile-First:** 90% do acesso será mobile, priorizar experiência mobile suave.

3. **Confirmações Instantâneas:** Priorizar confirmações instantâneas via webhook.

4. **Soft Descriptor:** Configurar "PRESENTE CASAMENTO" para aparecer na fatura.

5. **Rate Limiting:** Implementar rate limiting rigoroso para prevenir abuso.

6. **LGPD:** Todos os dados pessoais devem ser criptografados e anonimizados após 90 dias.

---

## 📞 Suporte e Manutenção

### Monitoramento

- Vercel Analytics
- Vercel Speed Insights
- Logs de erro (Sentry ou similar)
- Monitoramento de uptime (UptimeRobot ou similar)

### Backup

- Backup automático daily do PostgreSQL
- Retenção de 30 dias
- Backup manual antes de alterações críticas

### Atualizações

- Atualizar dependências mensalmente
- Revisar segurança trimestralmente
- Testar atualizações em staging antes de produção

---

**Última Atualização:** 29/01/2025
**Versão:** 1.0.0
**Status:** Planejamento
