import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createGiftSchema } from '@/lib/validation'
import { adminAuth } from '@/lib/adminAuth'

// GET /api/gifts - Listar todos os presentes (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    const where = eventId ? { eventId } : {}

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

    return NextResponse.json({ gifts: giftsWithProgress })
  } catch (error) {
    console.error('Erro ao buscar presentes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar presentes' },
      { status: 500 }
    )
  }
}

// POST /api/gifts - Criar novo presente (admin)
export async function POST(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const body = await request.json()
    const parsed = createGiftSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, description, imageUrl, totalValue, eventId } = parsed.data

    let targetEventId = eventId
    if (!targetEventId) {
      const existingEvent = await prisma.event.findFirst()
      if (!existingEvent) {
        return NextResponse.json(
          { error: 'Nenhum evento encontrado. Crie um evento primeiro.' },
          { status: 400 }
        )
      }
      targetEventId = existingEvent.id
    }

    const gift = await prisma.gift.create({
      data: {
        eventId: targetEventId,
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        totalValue,
        status: 'available'
      }
    })

    return NextResponse.json(
      { message: 'Presente criado com sucesso', gift },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar presente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar presente' },
      { status: 500 }
    )
  }
}
