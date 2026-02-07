import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { adminAuth } from '../lib/adminAuth'
import { z } from 'zod'

const router = Router()

const updateEventSchema = z.object({
  coupleNames: z.string().min(2).max(200).optional(),
  date: z.string().datetime().optional(),
  venue: z.string().min(2).max(300).optional(),
  venueMapsUrl: z.string().url().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
})

// GET /api/event - Buscar dados do evento (público)
router.get('/', async (req, res) => {
  try {
    const event = await prisma.event.findFirst({
      include: {
        _count: {
          select: {
            guests: true,
            gifts: true,
          }
        }
      }
    })

    if (!event) {
      return res.status(404).json({ error: 'Nenhum evento configurado' })
    }

    res.json({
      id: event.id,
      coupleNames: event.coupleNames,
      date: event.date,
      venue: event.venue,
      venueMapsUrl: event.venueMapsUrl,
      description: event.description,
      guestCount: event._count.guests,
      giftCount: event._count.gifts,
    })
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    res.status(500).json({ error: 'Erro ao buscar evento' })
  }
})

// PUT /api/event - Atualizar dados do evento (admin)
router.put('/', adminAuth, async (req, res) => {
  try {
    const parsed = updateEventSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message })
    }

    const event = await prisma.event.findFirst()
    if (!event) {
      return res.status(404).json({ error: 'Nenhum evento configurado' })
    }

    const data: any = { ...parsed.data }
    if (data.date) {
      data.date = new Date(data.date)
    }

    const updated = await prisma.event.update({
      where: { id: event.id },
      data,
    })

    res.json({ message: 'Evento atualizado com sucesso', event: updated })
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    res.status(500).json({ error: 'Erro ao atualizar evento' })
  }
})

export default router
