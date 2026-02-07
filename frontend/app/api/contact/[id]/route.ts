import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/adminAuth'

// GET /api/contact/:id - Buscar mensagem específica (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { id } = params
    const contact = await prisma.contactMessage.findUnique({ where: { id } })

    if (!contact) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Erro ao buscar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mensagem' },
      { status: 500 }
    )
  }
}
