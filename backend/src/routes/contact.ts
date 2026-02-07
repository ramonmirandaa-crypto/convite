import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { createContactSchema } from '../lib/validation'
import { adminAuth } from '../lib/adminAuth'

const router = Router()

// POST /api/contact - Enviar mensagem de contato (público)
router.post('/', async (req, res) => {
  try {
    const parsed = createContactSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message })
    }

    const contact = await prisma.contactMessage.create({
      data: parsed.data
    })

    res.status(201).json({ message: 'Mensagem enviada com sucesso', contact })
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error)
    res.status(500).json({ error: 'Erro ao enviar mensagem' })
  }
})

// GET /api/contact - Listar todas as mensagens (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json({ messages })
  } catch (error) {
    console.error('Erro ao listar mensagens:', error)
    res.status(500).json({ error: 'Erro ao listar mensagens' })
  }
})

// GET /api/contact/:id - Buscar mensagem específica (admin)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const contact = await prisma.contactMessage.findUnique({ where: { id } })

    if (!contact) {
      return res.status(404).json({ error: 'Mensagem não encontrada' })
    }

    res.json({ contact })
  } catch (error) {
    console.error('Erro ao buscar mensagem:', error)
    res.status(500).json({ error: 'Erro ao buscar mensagem' })
  }
})

export default router
