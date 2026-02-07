import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { randomUUID } from 'crypto'
import { createRSVPSchema, updateRSVPSchema } from '../lib/validation'
import { adminAuth } from '../lib/adminAuth'
import { sendRSVPConfirmation } from '../lib/email'

const router = Router()

// GET /api/rsvp - Listar todos os convidados (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const guests = await prisma.guest.findMany({
      include: {
        event: true,
        contributions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    res.json(guests)
  } catch (error) {
    console.error('Erro ao buscar convidados:', error)
    res.status(500).json({ error: 'Erro ao buscar convidados' })
  }
})

// POST /api/rsvp - Criar novo convidado
router.post('/', async (req, res) => {
  try {
    const parsed = createRSVPSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message })
    }

    const { name, email, phone, guestCount, dietaryRestrictions, suggestedSong, eventId } = parsed.data

    // Se não houver eventId, busca o primeiro evento ou cria um padrão
    let targetEventId = eventId
    if (!targetEventId) {
      const existingEvent = await prisma.event.findFirst()
      if (existingEvent) {
        targetEventId = existingEvent.id
      } else {
        const newEvent = await prisma.event.create({
          data: {
            coupleNames: 'Casal',
            date: new Date('2025-06-22'),
            venue: 'Local do Evento'
          }
        })
        targetEventId = newEvent.id
      }
    }

    const qrCodeToken = randomUUID()

    const guest = await prisma.guest.create({
      data: {
        eventId: targetEventId,
        name,
        email,
        phone: phone || null,
        guestCount,
        dietaryRestrictions: dietaryRestrictions || null,
        suggestedSong: suggestedSong || null,
        qrCodeToken,
        confirmed: true
      }
    })

    // Envia email de confirmação (não bloqueia a resposta)
    sendRSVPConfirmation(email, name).catch(err =>
      console.error('Erro ao enviar email RSVP:', err)
    )

    res.status(201).json({
      message: 'Confirmação registrada com sucesso',
      guest,
      qrCodeUrl: `/api/rsvp/qr/${qrCodeToken}`
    })
  } catch (error) {
    console.error('Erro ao criar convidado:', error)
    res.status(500).json({ error: 'Erro ao criar confirmação' })
  }
})

// GET /api/rsvp/:id - Buscar convidado específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        event: true,
        contributions: {
          include: {
            gift: true
          }
        }
      }
    })

    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' })
    }

    res.json(guest)
  } catch (error) {
    console.error('Erro ao buscar convidado:', error)
    res.status(500).json({ error: 'Erro ao buscar convidado' })
  }
})

// GET /api/rsvp/qr/:token - Validar QR Code
router.get('/qr/:token', async (req, res) => {
  try {
    const { token } = req.params
    const guest = await prisma.guest.findUnique({
      where: { qrCodeToken: token },
      include: {
        event: true
      }
    })

    if (!guest) {
      return res.status(404).json({ error: 'QR Code inválido' })
    }

    res.json({
      valid: true,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        guestCount: guest.guestCount,
        confirmed: guest.confirmed
      }
    })
  } catch (error) {
    console.error('Erro ao validar QR Code:', error)
    res.status(500).json({ error: 'Erro ao validar QR Code' })
  }
})

// PUT /api/rsvp/:id - Atualizar convidado (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const parsed = updateRSVPSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message })
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: parsed.data
    })

    res.json({ message: 'Convidado atualizado com sucesso', guest })
  } catch (error) {
    console.error('Erro ao atualizar convidado:', error)
    res.status(500).json({ error: 'Erro ao atualizar convidado' })
  }
})

// DELETE /api/rsvp/:id - Deletar convidado (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    await prisma.guest.delete({
      where: { id }
    })
    res.json({ message: 'Convidado deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar convidado:', error)
    res.status(500).json({ error: 'Erro ao deletar convidado' })
  }
})

export default router
