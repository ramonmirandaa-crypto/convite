import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// GET - Relatório de contribuições
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let contributions
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('contributions')
        .select('*, gift:gifts(title), guest:guests(name, email)')
        .order('createdAt', { ascending: false })
      if (error) throw error
      contributions = data || []
    } else {
      contributions = await prisma.contribution.findMany({
        include: {
          gift: { select: { title: true } },
          guest: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    // Calcula estatísticas
    const stats = {
      totalCollected: 0,
      totalContributions: contributions.length,
      approvedContributions: 0,
      pendingContributions: 0,
      averageContribution: 0,
      pixTotal: 0,
      cardTotal: 0,
      contributionsByMonth: {} as Record<string, number>,
      giftStats: {} as Record<string, { title: string; total: number; count: number }>
    }

    for (const c of contributions) {
      const amount = Number(c.amount)
      
      // Totais por status
      if (c.paymentStatus === 'approved') {
        stats.totalCollected += amount
        stats.approvedContributions++
        
        // Totais por método
        if (c.paymentMethod === 'pix') {
          stats.pixTotal += amount
        } else {
          stats.cardTotal += amount
        }
      } else if (c.paymentStatus === 'pending') {
        stats.pendingContributions++
      }

      // Contribuições por mês
      if (c.paymentStatus === 'approved') {
        const month = new Date(c.createdAt).toISOString().slice(0, 7) // YYYY-MM
        stats.contributionsByMonth[month] = (stats.contributionsByMonth[month] || 0) + amount
      }

      // Estatísticas por presente
      if (c.paymentStatus === 'approved') {
        const giftId = c.giftId
        if (!stats.giftStats[giftId]) {
          stats.giftStats[giftId] = {
            title: c.gift?.title || 'Presente não encontrado',
            total: 0,
            count: 0
          }
        }
        stats.giftStats[giftId].total += amount
        stats.giftStats[giftId].count++
      }
    }

    // Calcula média
    if (stats.approvedContributions > 0) {
      stats.averageContribution = stats.totalCollected / stats.approvedContributions
    }

    // Converte para array e ordena
    const contributionsByMonth = Object.entries(stats.contributionsByMonth)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => b.month.localeCompare(a.month))

    const topGifts = Object.values(stats.giftStats)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 5)

    // Formata contribuições para o frontend
    const formattedContributions = contributions.map((c: any) => ({
      id: c.id,
      giftId: c.giftId,
      giftTitle: c.gift?.title || 'Presente não encontrado',
      amount: c.amount,
      payerName: c.payerName,
      payerEmail: c.payerEmail,
      paymentMethod: c.paymentMethod,
      paymentStatus: c.paymentStatus,
      createdAt: new Date(c.createdAt).toISOString(),
      isAnonymous: c.isAnonymous
    }))

    return NextResponse.json({
      contributions: formattedContributions,
      stats: {
        totalCollected: stats.totalCollected,
        totalContributions: stats.totalContributions,
        approvedContributions: stats.approvedContributions,
        pendingContributions: stats.pendingContributions,
        averageContribution: stats.averageContribution,
        pixTotal: stats.pixTotal,
        cardTotal: stats.cardTotal,
        contributionsByMonth,
        topGifts
      }
    })

  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório', details: error?.message },
      { status: 500 }
    )
  }
}
