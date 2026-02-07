import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRSVPSchema, updateRSVPSchema } from '@/lib/validation'
import { randomUUID } from 'crypto'
import { adminAuth } from '@/lib/adminAuth'

// GET /api/rsvp - Listar todos os convidados (admin)
export async function GET(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

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
    return NextResponse.json(guests)
  } catch (error) {
    console.error('Erro ao buscar convidados:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar convidados' },
      { status: 500 }
    )
  }
}

// POST /api/rsvp - Criar novo convidado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createRSVPSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
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

    return NextResponse.json({
      message: 'Confirmação registrada com sucesso',
      guest,
      qrCodeUrl: `/api/rsvp/qr/${qrCodeToken}`
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar convidado:', error)
    return NextResponse.json(
      { error: 'Erro ao criar confirmação' },
      { status: 500 }
    )
  }
}
