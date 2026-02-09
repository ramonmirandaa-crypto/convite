import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// Forçar rota dinâmica - usa request.url
export const dynamic = 'force-dynamic'

// GET /api/contributions - Listar todas as contribuições (admin)
export async function GET(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { searchParams } = new URL(request.url)
    const giftId = searchParams.get('giftId')
    const guestId = searchParams.get('guestId')
    const status = searchParams.get('status')

    let query = supabase.from('contributions').select('*, gift(*), guest(*)')

    if (giftId) query = query.eq('giftId', giftId)
    if (guestId) query = query.eq('guestId', guestId)
    if (status) query = query.eq('paymentStatus', status)

    let contributions
    if (isVercel) {
      const { data, error } = await query.order('createdAt', { ascending: false })
      if (error) throw error
      contributions = data || []
    } else {
      const where: any = {}
      if (giftId) where.giftId = giftId
      if (guestId) where.guestId = guestId
      if (status) where.paymentStatus = status

      contributions = await prisma.contribution.findMany({
        where,
        include: {
          gift: true,
          guest: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(contributions)
  } catch (error: any) {
    console.error('Erro ao buscar contribuições:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar contribuições', details: error?.message },
      { status: 500 }
    )
  }
}
