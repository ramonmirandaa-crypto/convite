import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const isVercel = process.env.VERCEL === '1'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('guests')
        .delete()
        .eq('id', params.id)
        .select('id')

      if (error) throw error
      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'Convidado não encontrado' },
          { status: 404 }
        )
      }
    } else {
      await prisma.guest.delete({
        where: { id: params.id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao excluir convidado:', error)

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Convidado não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir convidado', details: error?.message },
      { status: 500 }
    )
  }
}
