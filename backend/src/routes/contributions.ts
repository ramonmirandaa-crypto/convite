import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { createContributionSchema } from '../lib/validation'
import { encrypt } from '../lib/crypto'
import { adminAuth } from '../lib/adminAuth'
import { sendContributionConfirmation } from '../lib/email'

const router = Router()

// GET /api/contributions - Listar todas as contribuições (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { giftId, guestId, status } = req.query

    const where: any = {}
    if (giftId) where.giftId = String(giftId)
    if (guestId) where.guestId = String(guestId)
    if (status) where.paymentStatus = String(status)

    const contributions = await prisma.contribution.findMany({
      where,
      include: {
        gift: true,
        guest: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(contributions)
  } catch (error) {
    console.error('Erro ao buscar contribuições:', error)
    res.status(500).json({ error: 'Erro ao buscar contribuições' })
  }
})

// POST /api/contributions - Criar nova contribuição (iniciar pagamento)
router.post('/', async (req, res) => {
  try {
    const parsed = createContributionSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message })
    }

    const {
      giftId, guestId, amount, message, isAnonymous,
      payerName, payerEmail, payerCPF, payerPhone,
      paymentMethod, installments
    } = parsed.data

    // Valida CPF (algoritmo módulo 11)
    if (!isValidCPF(payerCPF)) {
      return res.status(400).json({ error: 'CPF inválido' })
    }

    // Verifica se o presente existe
    const gift = await prisma.gift.findUnique({
      where: { id: giftId },
      include: {
        contributions: {
          where: { paymentStatus: 'approved' }
        }
      }
    })

    if (!gift) {
      return res.status(404).json({ error: 'Presente não encontrado' })
    }

    const totalReceived = gift.contributions.reduce((sum, c) => {
      return sum + Number(c.amount)
    }, 0)

    const remaining = Number(gift.totalValue) - totalReceived

    if (remaining <= 0) {
      return res.status(400).json({ error: 'Presente já foi totalmente arrecadado' })
    }

    // Encripta CPF antes de salvar (LGPD)
    const encryptedCPF = encrypt(payerCPF.replace(/[^\d]/g, ''))

    const contribution = await prisma.contribution.create({
      data: {
        giftId,
        guestId: guestId || null,
        amount: new Decimal(String(amount)),
        message: message || null,
        isAnonymous,
        payerName,
        payerEmail,
        payerCPF: encryptedCPF,
        payerPhone: payerPhone || null,
        paymentMethod,
        paymentStatus: 'pending',
        gatewayId: `pending_${Date.now()}`,
        installments
      }
    })

    // TODO: Integração com Mercado Pago aqui
    res.status(201).json({
      message: 'Contribuição criada com sucesso',
      contribution,
      mockPayment: {
        pixCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000',
        pixQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIXCODE',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    })
  } catch (error) {
    console.error('Erro ao criar contribuição:', error)
    res.status(500).json({ error: 'Erro ao criar contribuição' })
  }
})

// GET /api/contributions/:id - Buscar contribuição específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        gift: true,
        guest: true
      }
    })

    if (!contribution) {
      return res.status(404).json({ error: 'Contribuição não encontrada' })
    }

    res.json(contribution)
  } catch (error) {
    console.error('Erro ao buscar contribuição:', error)
    res.status(500).json({ error: 'Erro ao buscar contribuição' })
  }
})

// POST /api/contributions/webhook - Webhook do gateway de pagamento
router.post('/webhook', async (req, res) => {
  try {
    const { gatewayId, status } = req.body

    const contribution = await prisma.contribution.findFirst({
      where: { gatewayId },
      include: { gift: true }
    })

    if (!contribution) {
      return res.status(404).json({ error: 'Contribuição não encontrada' })
    }

    const updatedContribution = await prisma.contribution.update({
      where: { id: contribution.id },
      data: {
        paymentStatus: status,
        gatewayResponse: req.body
      }
    })

    // Se aprovado, envia email e verifica se o presente foi totalmente arrecadado
    if (status === 'approved') {
      sendContributionConfirmation(
        contribution.payerEmail,
        contribution.payerName,
        contribution.gift.title,
        Number(contribution.amount)
      ).catch(err => console.error('Erro ao enviar email contribuição:', err))

      const gift = await prisma.gift.findUnique({
        where: { id: contribution.giftId },
        include: {
          contributions: {
            where: { paymentStatus: 'approved' }
          }
        }
      })

      if (gift) {
        const totalReceived = gift.contributions.reduce((sum, c) => {
          return sum + Number(c.amount)
        }, 0)

        if (totalReceived >= Number(gift.totalValue)) {
          await prisma.gift.update({
            where: { id: gift.id },
            data: { status: 'fulfilled' }
          })
        }
      }
    }

    res.json({ message: 'Webhook processado com sucesso', contribution: updatedContribution })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    res.status(500).json({ error: 'Erro ao processar webhook' })
  }
})

// Validação de CPF (módulo 11)
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '')

  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(10, 11))) return false

  return true
}

export default router
