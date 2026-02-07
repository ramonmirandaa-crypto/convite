# Requisitos do Sistema de Convite de Casamento

## Visão Geral

Sistema digital para gerenciar convites de casamento, incluindo confirmações de presença, lista de presentes e galeria de fotos.

## Requisitos Funcionais

### 1. Página Inicial
- [x] Apresentação do casal
- [x] Informações básicas do evento (data, horário, local)
- [x] Navegação para outras seções
- [x] Design responsivo

### 2. Seção de Boas-vindas
- [x] Mensagem de boas-vindas
- [x] Detalhes do evento
- [x] Informações sobre a cerimônia e recepção
- [x] Mapa ou instruções de localização

### 3. Sistema de RSVP (Confirmação de Presença)
- [x] Formulário de confirmação
- [x] Campos: nome, email, telefone, número de acompanhantes
- [x] Campo opcional para restrições alimentares
- [x] Campo opcional para mensagem aos noivos
- [x] Validação de campos obrigatórios
- [x] Confirmação visual após envio

### 4. Lista de Presentes
- [x] Exibição de presentes disponíveis
- [x] Status de cada presente (disponível/reservado)
- [x] Sistema de reserva de presentes
- [x] Informações sobre quem reservou cada presente
- [x] Preço dos presentes

### 5. Galeria de Fotos
- [x] Exibição de fotos do casal
- [x] Categorias de fotos (ensaio, noivado, família, etc.)
- [x] Visualização em grid responsivo
- [x] Descrições para cada foto

### 6. Contato
- [x] Formulário de contato
- [x] Campos: nome, email, assunto, mensagem
- [x] Validação de campos
- [x] Confirmação de envio

## Requisitos Não-Funcionais

### Performance
- Tempo de carregamento < 3 segundos
- Otimização de imagens
- Lazy loading para galeria

### Segurança
- Validação de entrada de dados
- Proteção contra CSRF
- HTTPS em produção

### Usabilidade
- Interface intuitiva
- Navegação clara
- Feedback visual para ações
- Design responsivo (mobile-first)

### Acessibilidade
- Contraste adequado de cores
- Navegação por teclado
- Tags ARIA apropriadas
- Texto alternativo para imagens

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 com App Router
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

### Deploy
- **Frontend**: Vercel
- **Backend**: Railway ou similar

## Estrutura de Dados

### RSVP
- id (auto-incremento)
- nome (string, obrigatório)
- email (string, obrigatório)
- telefone (string, obrigatório)
- acompanhantes (int, padrão: 1)
- restricoes_alimentares (string, opcional)
- mensagem (string, opcional)
- data_criacao (datetime)
- data_atualizacao (datetime)

### Presente
- id (auto-incremento)
- nome (string, obrigatório)
- preco (string, obrigatório)
- status (string, padrão: "Disponível")
- reservado_por (string, opcional)
- data_reserva (datetime, opcional)
- data_criacao (datetime)
- data_atualizacao (datetime)

### Contato
- id (auto-incremento)
- nome (string, obrigatório)
- email (string, obrigatório)
- assunto (string, obrigatório)
- mensagem (string, obrigatório)
- data_criacao (datetime)

## Cronograma de Desenvolvimento

### Fase 1: Estrutura Básica
- [x] Configuração do projeto Next.js
- [x] Configuração do projeto Express
- [x] Estrutura de diretórios
- [x] Configuração do banco de dados

### Fase 2: Frontend
- [x] Página inicial
- [x] Página de boas-vindas
- [x] Formulário de RSVP
- [x] Lista de presentes
- [x] Galeria de fotos
- [x] Formulário de contato

### Fase 3: Backend
- [x] API de RSVP
- [x] API de Presentes
- [x] API de Contato
- [ ] Integração com banco de dados
- [ ] Validação de dados

### Fase 4: Integração
- [ ] Conexão frontend-backend
- [ ] Tratamento de erros
- [ ] Loading states
- [ ] Testes

### Fase 5: Deploy
- [ ] Configuração de ambiente de produção
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Configuração de domínio
- [ ] Monitoramento

## Considerações Futuras

- Sistema de autenticação para admin
- Dashboard administrativo
- Envio de emails automáticos
- Integração com redes sociais
- Sistema de lembretes
- Exportação de dados (PDF, Excel)
- Multi-idioma
- Temas personalizáveis