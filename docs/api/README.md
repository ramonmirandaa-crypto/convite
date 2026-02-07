# Documentação da API

## Visão Geral

Esta API foi desenvolvida para gerenciar o sistema de convite de casamento, incluindo confirmações de presença (RSVP), lista de presentes e mensagens de contato.

## Base URL

```
http://localhost:3001/api
```

## Endpoints

### RSVP (Confirmação de Presença)

#### Listar todas as confirmações
```
GET /api/rsvp
```

#### Criar nova confirmação
```
POST /api/rsvp
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "guests": 2,
  "dietary": "Vegetariano",
  "message": "Estamos muito felizes!"
}
```

#### Buscar confirmação específica
```
GET /api/rsvp/:id
```

#### Atualizar confirmação
```
PUT /api/rsvp/:id
```

#### Deletar confirmação
```
DELETE /api/rsvp/:id
```

### Presentes

#### Listar todos os presentes
```
GET /api/gifts
```

#### Reservar presente
```
POST /api/gifts/:id/reserve
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria@email.com"
}
```

#### Buscar presente específico
```
GET /api/gifts/:id
```

### Contato

#### Enviar mensagem
```
POST /api/contact
Content-Type: application/json

{
  "name": "Pedro Costa",
  "email": "pedro@email.com",
  "subject": "Dúvida sobre o local",
  "message": "Gostaria de saber se há estacionamento..."
}
```

#### Listar todas as mensagens (admin)
```
GET /api/contact
```

#### Buscar mensagem específica
```
GET /api/contact/:id
```

## Respostas

### Sucesso (200-299)
```json
{
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

### Erro (400-499)
```json
{
  "error": "Mensagem de erro"
}
```

### Erro do Servidor (500)
```json
{
  "error": "Algo deu errado!"
}
```

## Health Check

```
GET /health
```

Retorna o status da API.