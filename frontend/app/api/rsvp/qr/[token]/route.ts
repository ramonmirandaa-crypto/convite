import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/rsvp/qr/:token - Validar QR Code
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const guest = await prisma.guest.findUnique({
      where: { qrCodeToken: token },
      include: {
        event: true
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'QR Code inválido' },
        { status: 404 }
      )
    }

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Erro ao validar QR Code' },
      { status: 500 }
    )
  }
}
