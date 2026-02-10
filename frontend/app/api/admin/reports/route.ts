import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// Evita otimização estática/caches inesperados em GET.
export const dynamic = 'force-dynamic'

// GET - Relatório de contribuições
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let contributions: any[] = []
    let giftsById: Record<string, any> = {}

    if (isVercel) {
      // Evita dependência de relacionamentos embutidos (que podem falhar se o schema cache do Supabase estiver desatualizado).
      // Fazemos o join em memória a partir da lista de presentes.
      const { data: gifts, error: giftsError } = await getSupabaseAdmin()
        .from('gifts')
        .select('id, title, totalValue, quotaTotal, status')
      if (giftsError) throw giftsError

      giftsById = Object.fromEntries((gifts || []).map((g: any) => [String(g.id), g]))

      const { data, error } = await getSupabaseAdmin()
        .from('contributions')
        .select('*')
        .order('createdAt', { ascending: false })
      if (error) throw error
      contributions = data || []
    } else {
      const localContributions = await prisma.contribution.findMany({
        include: {
          gift: { select: { id: true, title: true, totalValue: true, quotaTotal: true, status: true } },
          guest: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      contributions = localContributions as any[]
      giftsById = Object.fromEntries(
        (localContributions || [])
          .map((c: any) => c.gift)
          .filter(Boolean)
          .map((g: any) => [String(g.id), g])
      )
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
      giftStats: {} as Record<string, { giftId: string; title: string; total: number; count: number }>,
    }

    const giftSummaries: Record<string, {
      giftId: string
      title: string
      totalValue: number
      quotaTotal: number
      status: string
      approvedTotal: number
      approvedCount: number
      pendingTotal: number
      pendingCount: number
      rejectedTotal: number
      rejectedCount: number
      lastContributionAt: string | null
    }> = {}

    for (const c of contributions) {
      const amount = Number(c.amount)
      const giftId = String(c.giftId)
      const gift = giftsById[giftId] || c.gift || null
      const giftTitle = (gift?.title as string) || 'Presente não encontrado'
      const giftTotalValue = Number(gift?.totalValue || 0)
      const giftQuotaTotal = Math.max(1, Math.floor(Number(gift?.quotaTotal || 1)))
      const giftStatus = String(gift?.status || 'unknown')

      if (!giftSummaries[giftId]) {
        giftSummaries[giftId] = {
          giftId,
          title: giftTitle,
          totalValue: Number.isFinite(giftTotalValue) ? giftTotalValue : 0,
          quotaTotal: Number.isFinite(giftQuotaTotal) ? giftQuotaTotal : 1,
          status: giftStatus,
          approvedTotal: 0,
          approvedCount: 0,
          pendingTotal: 0,
          pendingCount: 0,
          rejectedTotal: 0,
          rejectedCount: 0,
          lastContributionAt: null,
        }
      }
      const createdAtIso = new Date(c.createdAt).toISOString()
      giftSummaries[giftId].lastContributionAt = giftSummaries[giftId].lastContributionAt
        ? (giftSummaries[giftId].lastContributionAt! > createdAtIso ? giftSummaries[giftId].lastContributionAt : createdAtIso)
        : createdAtIso
      
      // Totais por status
      if (c.paymentStatus === 'approved') {
        stats.totalCollected += amount
        stats.approvedContributions++
        giftSummaries[giftId].approvedTotal += amount
        giftSummaries[giftId].approvedCount++
        
        // Totais por método
        if (c.paymentMethod === 'pix') {
          stats.pixTotal += amount
        } else {
          stats.cardTotal += amount
        }
      } else if (c.paymentStatus === 'pending') {
        stats.pendingContributions++
        giftSummaries[giftId].pendingTotal += amount
        giftSummaries[giftId].pendingCount++
      } else if (c.paymentStatus === 'rejected') {
        giftSummaries[giftId].rejectedTotal += amount
        giftSummaries[giftId].rejectedCount++
      }

      // Contribuições por mês
      if (c.paymentStatus === 'approved') {
        const month = new Date(c.createdAt).toISOString().slice(0, 7) // YYYY-MM
        stats.contributionsByMonth[month] = (stats.contributionsByMonth[month] || 0) + amount
      }

      // Estatísticas por presente
      if (c.paymentStatus === 'approved') {
        if (!stats.giftStats[giftId]) {
          stats.giftStats[giftId] = {
            giftId,
            title: giftTitle,
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
      giftTitle: (giftsById[String(c.giftId)]?.title as string) || c.gift?.title || 'Presente não encontrado',
      amount: c.amount,
      payerName: c.payerName,
      payerEmail: c.payerEmail,
      paymentMethod: c.paymentMethod,
      paymentStatus: c.paymentStatus,
      createdAt: new Date(c.createdAt).toISOString(),
      isAnonymous: c.isAnonymous
    }))

    const gifts = Object.values(giftSummaries)
      .map((g) => {
        const remaining = Math.max(0, Number(g.totalValue) - Number(g.approvedTotal))
        const progress = g.totalValue > 0 ? Math.min(100, (Number(g.approvedTotal) / Number(g.totalValue)) * 100) : 0
        return {
          ...g,
          remaining,
          progress,
        }
      })
      .sort((a, b) => (b.approvedTotal - a.approvedTotal) || (b.pendingTotal - a.pendingTotal))

    const response = NextResponse.json({
      contributions: formattedContributions,
      gifts,
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
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response

  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório', details: error?.message },
      { status: 500 }
    )
  }
}
