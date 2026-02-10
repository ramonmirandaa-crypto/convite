import { z } from 'zod'

// Helpers
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/
const phoneRegex = /^[\d\s()+-]{8,20}$/

// RSVP
export const createRSVPSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(phoneRegex, 'Telefone inválido').optional(),
  guestCount: z.number().int().min(0).max(10).default(1),
  dietaryRestrictions: z.string().max(500).optional(),
  suggestedSong: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
  eventId: z.string().uuid().optional(),
})

export const updateRSVPSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(phoneRegex).nullable().optional(),
  guestCount: z.number().int().min(0).max(10).optional(),
  dietaryRestrictions: z.string().max(500).nullable().optional(),
  suggestedSong: z.string().max(200).nullable().optional(),
  confirmed: z.boolean().optional(),
})

// Gifts
export const createGiftSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres').max(200),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  totalValue: z.number().positive('Valor deve ser positivo'),
  quotaTotal: z.number().int().min(1, 'Quantidade de cotas deve ser pelo menos 1').max(10000).optional(),
  eventId: z.string().uuid().optional(),
})

export const updateGiftSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  totalValue: z.number().positive().optional(),
  quotaTotal: z.number().int().min(1).max(10000).optional(),
  status: z.enum(['available', 'fulfilled', 'hidden']).optional(),
})

// Contributions
export const createContributionSchema = z.object({
  giftId: z.string().uuid('ID do presente inválido'),
  guestId: z.string().uuid().optional(),
  amount: z.number().positive('Valor deve ser positivo'),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  payerName: z.string().min(2, 'Nome do pagador obrigatório').max(200),
  payerEmail: z.string().email('Email do pagador inválido'),
  payerCPF: z.string().regex(cpfRegex, 'CPF inválido'),
  payerPhone: z.string().regex(phoneRegex).optional(),
  paymentMethod: z.enum(['pix', 'credit_card', 'boleto']).default('pix'),
  installments: z.number().int().min(1).max(12).default(1),
})

// Contact
export const createContactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200),
  email: z.string().email('Email inválido'),
  subject: z.string().min(2, 'Assunto deve ter pelo menos 2 caracteres').max(200),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(2000),
})

// Reserve gift
export const reserveGiftSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
})
