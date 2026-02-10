import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// GET - Estatísticas básicas do dashboard
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let totalGuests = 0
    let confirmedGuests = 0
    let totalGifts = 0
    let fulfilledGifts = 0
    let contributions = 0
    let messages = 0
    let totalCollected = 0

    if (isVercel) {
      // Usa Supabase
      const { count: tg, error: tgError } = await getSupabaseAdmin().from('guests').select('*', { count: 'exact', head: true })
      if (!tgError) totalGuests = tg || 0

      const { count: cg, error: cgError } = await getSupabaseAdmin().from('guests').select('*', { count: 'exact', head: true }).eq('confirmed', true)
      if (!cgError) confirmedGuests = cg || 0

      const { count: tgi, error: tgiError } = await getSupabaseAdmin().from('gifts').select('*', { count: 'exact', head: true })
      if (!tgiError) totalGifts = tgi || 0

      const { count: fg, error: fgError } = await getSupabaseAdmin().from('gifts').select('*', { count: 'exact', head: true }).eq('status', 'fulfilled')
      if (!fgError) fulfilledGifts = fg || 0

      const { count: c, error: cError } = await getSupabaseAdmin().from('contributions').select('*', { count: 'exact', head: true }).eq('paymentStatus', 'approved')
      if (!cError) contributions = c || 0

      const { count: m, error: mError } = await getSupabaseAdmin().from('contact_messages').select('*', { count: 'exact', head: true }).eq('read', false)
      if (!mError) messages = m || 0

      const { data: contribData, error: contribError } = await getSupabaseAdmin()
        .from('contributions')
        .select('amount')
        .eq('paymentStatus', 'approved')
      if (!contribError && contribData) {
        totalCollected = contribData.reduce((sum: number, c: any) => sum + Number(c.amount), 0)
      }
    } else {
      // Usa Prisma
      const [
        tg,
        cg,
        tgi,
        fg,
        c,
        m
      ] = await Promise.all([
        prisma.guest.count().catch(() => 0),
        prisma.guest.count({ where: { confirmed: true } }).catch(() => 0),
        prisma.gift.count().catch(() => 0),
        prisma.gift.count({ where: { status: 'fulfilled' } }).catch(() => 0),
        prisma.contribution.count({ where: { paymentStatus: 'approved' } }).catch(() => 0),
        prisma.contactMessage.count({ where: { read: false } }).catch(() => 0)
      ])

      totalGuests = tg
      confirmedGuests = cg
      totalGifts = tgi
      fulfilledGifts = fg
      contributions = c
      messages = m

      const totalAgg = await prisma.contribution.aggregate({
        where: { paymentStatus: 'approved' },
        _sum: { amount: true }
      }).catch(() => ({ _sum: { amount: 0 } }))

      totalCollected = Number(totalAgg._sum.amount) || 0
    }

    return NextResponse.json({
      totalGuests,
      confirmedGuests,
      totalGifts,
      fulfilledGifts,
      contributions,
      totalCollected,
      messages
    })

  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    
    // Retorna dados vazios em caso de erro, mas não quebra a página
    return NextResponse.json({
      totalGuests: 0,
      confirmedGuests: 0,
      totalGifts: 0,
      fulfilledGifts: 0,
      contributions: 0,
      totalCollected: 0,
      messages: 0,
      error: 'Erro ao conectar com o banco de dados'
    }, { status: 200 }) // Retorna 200 para não quebrar o frontend
  }
}
