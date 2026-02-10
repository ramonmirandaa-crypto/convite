import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateGiftSchema } from '@/lib/validation'
import { adminAuth } from '@/lib/adminAuth'

// GET /api/gifts/:id - Buscar presente específico (público)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const gift = await prisma.gift.findUnique({
      where: { id },
      include: {
        contributions: {
          where: {
            paymentStatus: 'approved'
          },
          include: {
            guest: true
          }
        }
      }
    })

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      )
    }

    const totalReceived = gift.contributions.reduce((sum, c) => {
      return sum + Number(c.amount)
    }, 0)

    return NextResponse.json({
      ...gift,
      totalReceived,
      progress: Math.min(100, (totalReceived / Number(gift.totalValue)) * 100),
      remaining: Math.max(0, Number(gift.totalValue) - totalReceived)
    })
  } catch (error) {
    console.error('Erro ao buscar presente:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar presente' },
      { status: 500 }
    )
  }
}

// PUT /api/gifts/:id - Atualizar presente (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateGiftSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data: any = { ...parsed.data }
    if (data.totalValue) {
      data.totalValue = data.totalValue
    }

    const gift = await prisma.gift.update({
      where: { id },
      data
    })

    return NextResponse.json({ message: 'Presente atualizado com sucesso', gift })
  } catch (error) {
    console.error('Erro ao atualizar presente:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar presente' },
      { status: 500 }
    )
  }
}

// DELETE /api/gifts/:id - Deletar presente (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { id } = await params
    await prisma.gift.delete({
      where: { id }
    })
    return NextResponse.json({ message: 'Presente deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar presente:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar presente' },
      { status: 500 }
    )
  }
}
