import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { createGiftSchema, updateGiftSchema, reserveGiftSchema } from '../lib/validation'
import { adminAuth } from '../lib/adminAuth'

const router = Router()

// GET /api/gifts - Listar todos os presentes (público)
router.get('/', async (req, res) => {
  try {
    const { eventId } = req.query

    const where = eventId ? { eventId: String(eventId) } : {}

    const gifts = await prisma.gift.findMany({
      where,
      include: {
        contributions: {
          where: {
            paymentStatus: 'approved'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const giftsWithProgress = gifts.map(gift => {
      const totalReceived = gift.contributions.reduce((sum, c) => {
        return sum + Number(c.amount)
      }, 0)

      const { contributions, ...giftData } = gift
      return {
        ...giftData,
        totalReceived,
        progress: Math.min(100, (totalReceived / Number(gift.totalValue)) * 100),
        remaining: Math.max(0, Number(gift.totalValue) - totalReceived)
      }
    })

    res.json({ gifts: giftsWithProgress })
  } catch (error) {
    console.error('Erro ao buscar presentes:', error)
    res.status(500).json({ error: 'Erro ao buscar presentes' })
  }
})

// POST /api/gifts - Criar novo presente (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const parsed = createGiftSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message })
    }

    const { title, description, imageUrl, totalValue, eventId } = parsed.data

    let targetEventId = eventId
    if (!targetEventId) {
      const existingEvent = await prisma.event.findFirst()
      if (!existingEvent) {
        return res.status(400).json({ error: 'Nenhum evento encontrado. Crie um evento primeiro.' })
      }
      targetEventId = existingEvent.id
    }

    const gift = await prisma.gift.create({
      data: {
        eventId: targetEventId,
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        totalValue: new Decimal(String(totalValue)),
        status: 'available'
      }
    })

    res.status(201).json({ message: 'Presente criado com sucesso', gift })
  } catch (error) {
    console.error('Erro ao criar presente:', error)
    res.status(500).json({ error: 'Erro ao criar presente' })
  }
})

// GET /api/gifts/:id - Buscar presente específico (público)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const gift = await prisma.gift.findUnique({
      where: { id },
      include: {
        contributions: {
          where: {
            paymentStatus: 'approved'
          },
          include: {
            guest: true
          }
        }
      }
    })

    if (!gift) {
      return res.status(404).json({ error: 'Presente não encontrado' })
    }

    const totalReceived = gift.contributions.reduce((sum, c) => {
      return sum + Number(c.amount)
    }, 0)

    res.json({
      ...gift,
      totalReceived,
      progress: Math.min(100, (totalReceived / Number(gift.totalValue)) * 100),
      remaining: Math.max(0, Number(gift.totalValue) - totalReceived)
    })
  } catch (error) {
    console.error('Erro ao buscar presente:', error)
    res.status(500).json({ error: 'Erro ao buscar presente' })
  }
})

// POST /api/gifts/:id/reserve - Reservar presente
router.post('/:id/reserve', async (req, res) => {
  try {
    const { id } = req.params
    const parsed = reserveGiftSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message })
    }

    const { name, email } = parsed.data

    const gift = await prisma.gift.findUnique({
      where: { id }
    })

    if (!gift) {
      return res.status(404).json({ error: 'Presente não encontrado' })
    }

    if (gift.status === 'fulfilled') {
      return res.status(400).json({ error: 'Presente já foi totalmente arrecadado' })
    }

    await prisma.gift.update({
      where: { id },
      data: { status: 'hidden' }
    })

    res.json({
      message: 'Presente reservado com sucesso',
      reservation: {
        giftId: id,
        name,
        email,
        reservedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Erro ao reservar presente:', error)
    res.status(500).json({ error: 'Erro ao reservar presente' })
  }
})

// PUT /api/gifts/:id - Atualizar presente (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const parsed = updateGiftSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message })
    }

    const data: any = { ...parsed.data }
    if (data.totalValue) {
      data.totalValue = new Decimal(String(data.totalValue))
    }

    const gift = await prisma.gift.update({
      where: { id },
      data
    })

    res.json({ message: 'Presente atualizado com sucesso', gift })
  } catch (error) {
    console.error('Erro ao atualizar presente:', error)
    res.status(500).json({ error: 'Erro ao atualizar presente' })
  }
})

// DELETE /api/gifts/:id - Deletar presente (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    await prisma.gift.delete({
      where: { id }
    })
    res.json({ message: 'Presente deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar presente:', error)
    res.status(500).json({ error: 'Erro ao deletar presente' })
  }
})

export default router
