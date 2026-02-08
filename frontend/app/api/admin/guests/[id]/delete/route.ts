import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/adminAuth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    await prisma.guest.delete({
      where: { id: params.id }
    }).catch(() => null)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir convidado:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir convidado' },
      { status: 500 }
    )
  }
}
