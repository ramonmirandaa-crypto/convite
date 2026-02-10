import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reserveGiftSchema } from '@/lib/validation'

// POST /api/gifts/:id/reserve - Reservar presente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = reserveGiftSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email } = parsed.data

    const gift = await prisma.gift.findUnique({
      where: { id }
    })

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      )
    }

    if (gift.status === 'fulfilled') {
      return NextResponse.json(
        { error: 'Presente já foi totalmente arrecadado' },
        { status: 400 }
      )
    }

    await prisma.gift.update({
      where: { id },
      data: { status: 'hidden' }
    })

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Erro ao reservar presente' },
      { status: 500 }
    )
  }
}
