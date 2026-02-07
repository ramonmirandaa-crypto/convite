import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateRSVPSchema } from '@/lib/validation'
import { adminAuth } from '@/lib/adminAuth'

// GET /api/rsvp/:id - Buscar convidado específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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
      return NextResponse.json(
        { error: 'Convidado não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(guest)
  } catch (error) {
    console.error('Erro ao buscar convidado:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar convidado' },
      { status: 500 }
    )
  }
}

// PUT /api/rsvp/:id - Atualizar convidado (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { id } = params
    const body = await request.json()
    const parsed = updateRSVPSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: parsed.data
    })

    return NextResponse.json({ message: 'Convidado atualizado com sucesso', guest })
  } catch (error) {
    console.error('Erro ao atualizar convidado:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar convidado' },
      { status: 500 }
    )
  }
}

// DELETE /api/rsvp/:id - Deletar convidado (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { id } = params
    await prisma.guest.delete({
      where: { id }
    })
    return NextResponse.json({ message: 'Convidado deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar convidado:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar convidado' },
      { status: 500 }
    )
  }
}
