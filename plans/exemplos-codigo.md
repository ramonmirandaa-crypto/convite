# Exemplos de Código - Sistema de Convite de Casamento

Este documento contém exemplos de código para os componentes mais importantes do sistema.

---

## 📦 Package.json - Frontend

```json
{
  "name": "convite-casamento-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.7.1",
    "next-auth": "^4.24.5",
    "framer-motion": "^10.16.16",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "date-fns": "^2.30.0",
    "qrcode.react": "^3.1.0",
    "mercadopago": "^1.5.16",
    "resend": "^3.0.0",
    "cloudinary": "^1.41.0",
    "sharp": "^0.33.1",
    "lucide-react": "^0.303.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "react-hot-toast": "^2.4.1",
    "react-image-lightbox": "^5.1.4",
    "react-countdown": "^2.3.5",
    "react-qr-reader": "^3.1.0",
    "recharts": "^2.10.3",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "prisma": "^5.7.1",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4"
  }
}
```

---

## 🎨 Tailwind Config

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FEF9E7',
          100: '#FDF0D0',
          200: '#FBE1A5',
          300: '#F8D07A',
          400: '#F5C14F',
          500: '#D4AF37', // Primary gold
          600: '#A88A2B',
          700: '#7C651F',
          800: '#504013',
          900: '#241B07',
        },
        rose: {
          50: '#FDF5F5',
          100: '#FBE9E9',
          200: '#F7D3D3',
          300: '#F3BEBE',
          400: '#EFA8A8',
          500: '#C9A9A6', // Primary rose
          600: '#A38783',
          700: '#7D655F',
          800: '#57443C',
          900: '#312319',
        },
        offwhite: {
          50: '#FFFFFF',
          100: '#FAF9F6', // Primary off-white
          200: '#F5F3ED',
          300: '#EFEDE4',
          400: '#E9E7DB',
          500: '#E3E0D2',
          600: '#B5B2A8',
          700: '#87847D',
          800: '#5A5853',
          900: '#2C2B28',
        },
        graphite: {
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#B9B9B9',
          400: '#A2A2A2',
          500: '#8B8B8B',
          600: '#6F6F6F',
          700: '#535353',
          800: '#363636',
          900: '#2C2C2C', // Primary graphite
        },
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'petal-fall': 'petalFall 10s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        petalFall: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 🔐 Validação CPF (Módulo 11)

```typescript
// lib/cpf.ts

export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanedCPF = cpf.replace(/\D/g, '')

  // Verifica se tem 11 dígitos
  if (cleanedCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanedCPF)) return false

  // Calcula primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanedCPF[i]) * (10 - i)
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  if (digit1 !== parseInt(cleanedCPF[9])) return false

  // Calcula segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanedCPF[i]) * (11 - i)
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  return digit2 === parseInt(cleanedCPF[10])
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
```

---

## 🔒 Criptografia AES-256

```typescript
// lib/encryption.ts

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH

function getKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    process.env.ENCRYPTION_KEY || '',
    salt,
    100000,
    32,
    'sha256'
  )
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = getKey(salt)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64')
}

export function decrypt(encryptedText: string): string {
  const buffer = Buffer.from(encryptedText, 'base64')

  const salt = buffer.subarray(0, SALT_LENGTH)
  const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION)
  const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION)
  const encrypted = buffer.subarray(ENCRYPTED_POSITION)

  const key = getKey(salt)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return decipher.update(encrypted) + decipher.final('utf8')
}
```

---

## ✅ Schema Zod - RSVP

```typescript
// lib/validations.ts

import { z } from 'zod'

export const rsvpSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos'),
  guestCount: z
    .number()
    .min(1, 'Pelo menos 1 convidado')
    .max(10, 'Máximo 10 convidados'),
  dietaryRestrictions: z.enum(['none', 'vegetarian', 'vegan', 'celiac', 'allergies']),
  allergies: z.string().optional(),
  suggestedSong: z.string().max(200, 'Máximo 200 caracteres').optional(),
})

export const paymentSchema = z.object({
  giftId: z.string().uuid(),
  amount: z
    .number()
    .min(50, 'Valor mínimo é R$ 50,00')
    .max(10000, 'Valor máximo é R$ 10.000,00'),
  paymentMethod: z.enum(['pix', 'credit_card', 'boleto']),
  payerName: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  payerEmail: z.string().email('Email inválido'),
  payerCPF: z
    .string()
    .length(11, 'CPF deve ter 11 dígitos')
    .refine((cpf) => validateCPF(cpf), 'CPF inválido'),
  payerPhone: z.string().optional(),
  message: z.string().max(140, 'Máximo 140 caracteres').optional(),
  isAnonymous: z.boolean().default(false),
  installments: z.number().min(1).max(12).default(1),
  lgpdConsent: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de uso',
  }),
})

export const cardPaymentSchema = paymentSchema.extend({
  cardNumber: z
    .string()
    .length(16, 'Número do cartão deve ter 16 dígitos'),
  cardHolderName: z
    .string()
    .min(3, 'Nome no cartão deve ter pelo menos 3 caracteres'),
  expirationMonth: z
    .number()
    .min(1, 'Mês inválido')
    .max(12, 'Mês inválido'),
  expirationYear: z
    .number()
    .min(new Date().getFullYear(), 'Ano inválido')
    .max(new Date().getFullYear() + 20, 'Ano inválido'),
  securityCode: z
    .string()
    .length(3, 'CVV deve ter 3 dígitos'),
})
```

---

## 💳 Mercado Pago - PIX

```typescript
// lib/mercadopago.ts

import mercadopago from 'mercadopago'

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
})

export interface CreatePixPaymentParams {
  transactionAmount: number
  description: string
  payer: {
    email: string
    firstName: string
    lastName: string
    identification: {
      type: string
      number: string
    }
  }
}

export async function createPixPayment(
  params: CreatePixPaymentParams
): Promise<{
  qrCode: string
  qrCodeBase64: string
  ticketUrl: string
  paymentId: string
}> {
  try {
    const payment = await mercadopago.payment.create({
      transaction_amount: params.transactionAmount,
      description: params.description,
      payment_method_id: 'pix',
      payer: params.payer,
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })

    const { qr_code, qr_code_base64, ticket_url } =
      payment.point_of_interaction.transaction_data

    return {
      qrCode: qr_code,
      qrCodeBase64: qr_code_base64,
      ticketUrl: ticket_url,
      paymentId: payment.id.toString(),
    }
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error)
    throw new Error('Erro ao criar pagamento PIX')
  }
}

export async function getPaymentStatus(paymentId: string) {
  try {
    const payment = await mercadopago.payment.get(paymentId)
    return {
      status: payment.status,
      statusDetail: payment.status_detail,
      dateApproved: payment.date_approved,
    }
  } catch (error) {
    console.error('Erro ao buscar status do pagamento:', error)
    throw new Error('Erro ao buscar status do pagamento')
  }
}

export async function calculateInstallments(
  amount: number,
  paymentMethodId: string
) {
  try {
    const response = await mercadopago.payment_methods.listAll({
      payment_method_id: paymentMethodId,
    })

    const paymentMethod = response.results[0]
    const maxInstallments = paymentMethod.max_installments || 12
    const interestFreeInstallments = paymentMethod.installments?.[0]?.max_allowed || 6

    const installments = []
    for (let i = 1; i <= maxInstallments; i++) {
      const isInterestFree = i <= interestFreeInstallments
      const installmentAmount = isInterestFree
        ? amount / i
        : amount * (1 + 0.0199 * i) / i

      installments.push({
        number: i,
        amount: installmentAmount,
        totalAmount: installmentAmount * i,
        interestRate: isInterestFree ? 0 : 1.99,
        isInterestFree,
      })
    }

    return installments
  } catch (error) {
    console.error('Erro ao calcular parcelas:', error)
    throw new Error('Erro ao calcular parcelas')
  }
}
```

---

## 📧 Resend - Email

```typescript
// lib/resend.ts

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRSVPConfirmation(
  email: string,
  name: string,
  qrCode: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@casamento.com',
      to: email,
      subject: 'Confirmação de Presença - Casamento',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmação de Presença</title>
            <style>
              body { font-family: 'Inter', sans-serif; background-color: #FAF9F6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .qr-code { text-align: center; margin: 30px 0; }
              .qr-code img { max-width: 250px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="color: #D4AF37;">Casamento</h1>
                <p style="color: #C9A9A6;">22 de Junho de 2025</p>
              </div>
              <div class="content">
                <h2>Olá, ${name}!</h2>
                <p>Sua presença foi confirmada com sucesso!</p>
                <p>Apresente o QR Code abaixo no dia do evento para check-in:</p>
                <div class="qr-code">
                  <img src="${qrCode}" alt="QR Code de Check-in">
                </div>
                <p style="font-size: 12px; color: #666;">
                  Este QR Code é pessoal e intransferível.
                </p>
              </div>
              <div class="footer">
                <p>Estamos ansiosos para celebrar com você!</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao enviar email de confirmação RSVP:', error)
    throw new Error('Erro ao enviar email de confirmação')
  }
}

export async function sendPaymentConfirmation(
  email: string,
  name: string,
  amount: number,
  giftTitle: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@casamento.com',
      to: email,
      subject: 'Pagamento Confirmado - Casamento',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pagamento Confirmado</title>
            <style>
              body { font-family: 'Inter', sans-serif; background-color: #FAF9F6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .amount { font-size: 24px; color: #D4AF37; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <h2 style="color: #D4AF37;">Pagamento Confirmado!</h2>
                <p>Olá, ${name}!</p>
                <p>Seu pagamento foi confirmado com sucesso.</p>
                <p><strong>Presente:</strong> ${giftTitle}</p>
                <p><strong>Valor:</strong> <span class="amount">R$ ${amount.toFixed(2)}</span></p>
                <p>Muito obrigado pelo seu presente! Estamos muito gratos.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao enviar email de confirmação de pagamento:', error)
    throw new Error('Erro ao enviar email de confirmação')
  }
}
```

---

## 🎯 Componente - Countdown Timer

```typescript
// components/sections/countdown.tsx

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CountdownProps {
  targetDate: Date
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg"
    >
      <span className="text-4xl md:text-6xl font-bold text-gold-500 font-playfair">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-sm md:text-base text-graphite-600 mt-2">{label}</span>
    </motion.div>
  )

  return (
    <div className="flex gap-4 md:gap-8 justify-center items-center">
      <TimeBlock value={timeLeft.days} label="Dias" />
      <TimeBlock value={timeLeft.hours} label="Horas" />
      <TimeBlock value={timeLeft.minutes} label="Minutos" />
      <TimeBlock value={timeLeft.seconds} label="Segundos" />
    </div>
  )
}
```

---

## 💳 Componente - PIX QR Code

```typescript
// components/payments/pix-qr-code.tsx

'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

interface PixQrCodeProps {
  qrCode: string
  expiresAt: Date
  onExpire: () => void
}

export default function PixQrCode({ qrCode, expiresAt, onExpire }: PixQrCodeProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutos em segundos

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = expiresAt.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        onExpire()
        return
      }

      setTimeLeft(Math.floor(distance / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpire])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-playfair text-gold-500 mb-2">
          Escaneie o QR Code
        </h3>
        <p className="text-graphite-600">
          Use o app do seu banco para pagar
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-lg shadow-inner">
          <QRCodeSVG
            value={qrCode}
            size={250}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-graphite-600">Expira em:</span>
          <span className="text-lg font-bold text-rose-500">
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / (30 * 60)) * 100}%` }}
            transition={{ duration: 1 }}
            className="bg-rose-500 h-2 rounded-full"
          />
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="w-full bg-gold-500 hover:bg-gold-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            Copiar Código PIX
          </>
        )}
      </button>

      <p className="text-xs text-graphite-500 text-center mt-4">
        O pagamento será confirmado automaticamente após a aprovação.
      </p>
    </motion.div>
  )
}
```

---

## 📊 Componente - Gift Card

```typescript
// components/gifts/gift-card.tsx

'use client'

import { motion } from 'framer-motion'
import { Gift, Users, TrendingUp } from 'lucide-react'
import Image from 'next/image'

interface GiftCardProps {
  id: string
  title: string
  description?: string
  imageUrl?: string
  totalValue: number
  raisedAmount: number
  status: 'available' | 'fulfilled' | 'hidden'
  onClick: () => void
}

export default function GiftCard({
  id,
  title,
  description,
  imageUrl,
  totalValue,
  raisedAmount,
  status,
  onClick,
}: GiftCardProps) {
  const progress = (raisedAmount / totalValue) * 100
  const remaining = totalValue - raisedAmount

  if (status === 'hidden') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer ${
        status === 'fulfilled' ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
          {status === 'fulfilled' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Esgotado</span>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-playfair text-graphite-900 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-graphite-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-graphite-600">Arrecadado</span>
            <span className="font-semibold text-gold-500">
              R$ {raisedAmount.toFixed(2)}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gold-500 h-2 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-graphite-600">Faltam</span>
            <span className="font-semibold text-rose-500">
              R$ {remaining.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1 text-graphite-600">
              <TrendingUp className="w-4 h-4" />
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1 text-graphite-600">
              <Users className="w-4 h-4" />
              <span>Contribuições</span>
            </div>
          </div>
        </div>

        <button
          className={`w-full mt-4 py-3 px-6 rounded-lg font-semibold transition-colors ${
            status === 'fulfilled'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gold-500 hover:bg-gold-600 text-white'
          }`}
          disabled={status === 'fulfilled'}
        >
          {status === 'fulfilled' ? 'Esgotado' : 'Contribuir'}
        </button>
      </div>
    </motion.div>
  )
}
```

---

## 📝 API Route - Criar Pagamento PIX

```typescript
// app/api/payments/pix/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPixPayment } from '@/lib/mercadopago'
import { paymentSchema } from '@/lib/validations'
import { encrypt } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados
    const validatedData = paymentSchema.parse(body)

    // Buscar presente
    const gift = await prisma.gift.findUnique({
      where: { id: validatedData.giftId },
    })

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      )
    }

    if (gift.status !== 'available') {
      return NextResponse.json(
        { error: 'Presente não disponível' },
        { status: 400 }
      )
    }

    // Criar pagamento PIX
    const pixPayment = await createPixPayment({
      transactionAmount: validatedData.amount,
      description: `Presente: ${gift.title}`,
      payer: {
        email: validatedData.payerEmail,
        firstName: validatedData.payerName.split(' ')[0],
        lastName: validatedData.payerName.split(' ').slice(1).join(' '),
        identification: {
          type: 'CPF',
          number: validatedData.payerCPF,
        },
      },
    })

    // Criar contribution no banco
    const contribution = await prisma.contribution.create({
      data: {
        giftId: validatedData.giftId,
        amount: validatedData.amount,
        message: validatedData.message,
        isAnonymous: validatedData.isAnonymous,
        payerName: validatedData.payerName,
        payerEmail: validatedData.payerEmail,
        payerCPF: encrypt(validatedData.payerCPF),
        payerPhone: validatedData.payerPhone,
        paymentMethod: 'pix',
        paymentStatus: 'pending',
        gatewayId: pixPayment.paymentId,
        installments: 1,
      },
    })

    return NextResponse.json({
      contributionId: contribution.id,
      qrCode: pixPayment.qrCode,
      qrCodeBase64: pixPayment.qrCodeBase64,
      ticketUrl: pixPayment.ticketUrl,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    )
  }
}
```

---

## 🪝 API Route - Webhook Mercado Pago

```typescript
// app/api/webhooks/mercadopago/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentConfirmation } from '@/lib/resend'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')

    // Validar assinatura do webhook
    const expectedSignature = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      )
    }

    const data = JSON.parse(body)

    // Processar apenas eventos de pagamento
    if (data.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = data.data.id

    // Buscar detalhes do pagamento
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    )

    const payment = await response.json()

    // Buscar contribution pelo gatewayId
    const contribution = await prisma.contribution.findFirst({
      where: { gatewayId: paymentId.toString() },
      include: { gift: true },
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribuição não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar status da contribution
    const updatedContribution = await prisma.contribution.update({
      where: { id: contribution.id },
      data: {
        paymentStatus: payment.status,
        gatewayResponse: payment,
        updatedAt: new Date(),
      },
    })

    // Se pagamento aprovado, enviar email de confirmação
    if (payment.status === 'approved') {
      await sendPaymentConfirmation(
        contribution.payerEmail,
        contribution.payerName,
        Number(contribution.amount),
        contribution.gift.title
      )

      // Verificar se o presente foi totalmente arrecadado
      const totalRaised = await prisma.contribution.aggregate({
        where: {
          giftId: contribution.giftId,
          paymentStatus: 'approved',
        },
        _sum: { amount: true },
      })

      if (totalRaised._sum.amount && totalRaised._sum.amount >= contribution.gift.totalValue) {
        await prisma.gift.update({
          where: { id: contribution.giftId },
          data: { status: 'fulfilled' },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
```

---

**Última Atualização:** 29/01/2025
**Versão:** 1.0.0
