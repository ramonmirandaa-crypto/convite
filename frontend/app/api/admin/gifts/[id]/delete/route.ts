import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const isVercel = process.env.VERCEL === '1'

// Helper para pegar o ID da URL
function getIdFromUrl(request: NextRequest): string | null {
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/')
  // URL: /api/admin/gifts/[id]/delete
  return pathParts[pathParts.length - 2] || null
}

export async function POST(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!
  
  const id = getIdFromUrl(request)
  if (!id) {
    return NextResponse.json({ error: 'ID do presente não fornecido' }, { status: 400 })
  }

  try {
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('gifts')
        .delete()
        .eq('id', id)
        .select('id')

      if (error) throw error
      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'Presente não encontrado' },
          { status: 404 }
        )
      }
    } else {
      await prisma.gift.delete({
        where: { id: id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao excluir presente:', error)

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir presente', details: error?.message },
      { status: 500 }
    )
  }
}
