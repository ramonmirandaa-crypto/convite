import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/adminAuth'
import { z } from 'zod'

const updateEventSchema = z.object({
  coupleNames: z.string().min(2).max(200).optional(),
  date: z.string().datetime().optional(),
  venue: z.string().min(2).max(300).optional(),
  venueMapsUrl: z.string().url().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
})

// GET /api/event - Buscar dados do evento (público)
export async function GET() {
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
      return NextResponse.json(
        { error: 'Nenhum evento configurado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}

// PUT /api/event - Atualizar dados do evento (admin)
export async function PUT(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const body = await request.json()
    const parsed = updateEventSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const event = await prisma.event.findFirst()
    if (!event) {
      return NextResponse.json(
        { error: 'Nenhum evento configurado' },
        { status: 404 }
      )
    }

    const data: any = { ...parsed.data }
    if (data.date) {
      data.date = new Date(data.date)
    }

    const updated = await prisma.event.update({
      where: { id: event.id },
      data,
    })

    return NextResponse.json({
      message: 'Evento atualizado com sucesso',
      event: updated
    })
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}
