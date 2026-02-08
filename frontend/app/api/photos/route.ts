import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

const isVercel = process.env.VERCEL === '1'

// GET /api/photos - Buscar fotos ativas (público)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    let photos

    if (isVercel) {
      // Usa Supabase na Vercel
      let query = supabase
        .from('photos')
        .select('*')
        .eq('isActive', true)
        .order('order', { ascending: true })
        .order('createdAt', { ascending: false })
        .limit(limit)

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query
      if (error) throw error
      photos = data || []
    } else {
      // Usa Prisma localmente
      const where: any = { isActive: true }
      if (category && category !== 'all') {
        where.category = category
      }

      photos = await prisma.photo.findMany({
        where,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        take: limit
      })
    }

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Erro ao buscar fotos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar fotos', photos: [] },
      { status: 500 }
    )
  }
}
