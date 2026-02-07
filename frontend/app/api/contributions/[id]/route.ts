import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/contributions/:id - Buscar contribuição específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        gift: true,
        guest: true
      }
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribuição não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(contribution)
  } catch (error) {
    console.error('Erro ao buscar contribuição:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar contribuição' },
      { status: 500 }
    )
  }
}
