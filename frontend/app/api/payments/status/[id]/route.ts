import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getPaymentStatus, mapPaymentStatus } from '@/lib/mercadopago'
import { decrypt } from '@/lib/crypto'

const isVercel = process.env.VERCEL === '1'

function getSupabaseServerClient() {
  // Sempre use service role para rotas server-side (evita problemas com RLS).
  return getSupabaseAdmin()
}

function resolveAccessToken(mpConfig: any): string | undefined {
  const token = mpConfig?.accessToken
  if (!token || typeof token !== 'string') return undefined
  if (token.includes(':')) {
    try {
      return decrypt(token)
    } catch {
      return undefined
    }
  }
  return token
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Busca a contribuição
    let contribution: any
    
    if (isVercel) {
      const sb = getSupabaseServerClient()
      const { data: contribData, error: contribError } = await sb
        .from('contributions')
        .select('*, gift:gifts(*)')
        .eq('id', id)
        .single()
      
      if (contribError || !contribData) {
        return NextResponse.json(
          { error: 'Contribuição não encontrada' },
          { status: 404 }
        )
      }
      contribution = contribData
    } else {
      contribution = await prisma.contribution.findUnique({
        where: { id },
        include: { gift: true }
      })

      if (!contribution) {
        return NextResponse.json(
          { error: 'Contribuição não encontrada' },
          { status: 404 }
        )
      }
    }

    async function recalcGiftStatus(giftId: string) {
      try {
        if (isVercel) {
          const sb = getSupabaseServerClient()
          const { data: gift, error: giftError } = await sb
            .from('gifts')
            .select('id,totalValue,status')
            .eq('id', giftId)
            .single()
          if (giftError || !gift) return

          const { data: contribs, error: contribError } = await sb
            .from('contributions')
            .select('amount')
            .eq('giftId', giftId)
            .eq('paymentStatus', 'approved')
          if (contribError) return

          const totalReceived = (contribs || []).reduce((sum: number, c: any) => sum + Number(c.amount), 0)
          const shouldBeFulfilled = totalReceived >= Number(gift.totalValue)
          const nextStatus = shouldBeFulfilled ? 'fulfilled' : (gift.status === 'hidden' ? 'hidden' : 'available')
          if (nextStatus !== gift.status) {
            await sb.from('gifts').update({ status: nextStatus, updatedAt: new Date().toISOString() }).eq('id', giftId)
          }
        } else {
          const gift = await prisma.gift.findUnique({
            where: { id: giftId },
            include: { contributions: { where: { paymentStatus: 'approved' } } }
          })
          if (!gift) return
          const totalReceived = (gift.contributions || []).reduce((sum, c) => sum + Number(c.amount), 0)
          const shouldBeFulfilled = totalReceived >= Number(gift.totalValue)
          const nextStatus = shouldBeFulfilled ? 'fulfilled' : (gift.status === 'hidden' ? 'hidden' : 'available')
          if (nextStatus !== gift.status) {
            await prisma.gift.update({ where: { id: giftId }, data: { status: nextStatus } })
          }
        }
      } catch (e) {
        console.error('[Payment Status] Falha ao recalcular status do presente:', e)
      }
    }

    // Se não tem gatewayId ainda, retorna status pendente
    if (!contribution.gatewayId || contribution.gatewayId.startsWith('pending_')) {
      return NextResponse.json({
        contribution,
        status: 'pending',
      })
    }

    // Busca dados atualizados no Mercado Pago
    try {
      let mpConfig: any = {}
      
      if (isVercel) {
        const sb = getSupabaseServerClient()
        const { data: eventData } = await sb.from('events').select('mpConfig').single()
        mpConfig = eventData?.mpConfig || {}
      } else {
        const event = await prisma.event.findFirst()
        mpConfig = (event?.mpConfig as any) || {}
      }
      
      const accessToken =
        resolveAccessToken(mpConfig) ||
        process.env.MERCADOPAGO_ACCESS_TOKEN ||
        process.env.MP_ACCESS_TOKEN

      if (accessToken) {
        const mpPayment = await getPaymentStatus(contribution.gatewayId, accessToken)
        const newStatus = mapPaymentStatus(mpPayment.status || 'pending')

        // Atualiza se o status mudou
        if (newStatus !== contribution.paymentStatus) {
          if (isVercel) {
            const sb = getSupabaseServerClient()
            await sb
              .from('contributions')
              .update({
                paymentStatus: newStatus,
                gatewayResponse: mpPayment as any,
                updatedAt: new Date().toISOString(),
              })
              .eq('id', contribution.id)
          } else {
            await prisma.contribution.update({
              where: { id: contribution.id },
              data: {
                paymentStatus: newStatus,
                gatewayResponse: mpPayment as any,
              }
            })
          }

          await recalcGiftStatus(contribution.giftId)

          return NextResponse.json({
            contribution: {
              ...contribution,
              paymentStatus: newStatus,
            },
            status: newStatus,
            payment: mpPayment,
          })
        }

        return NextResponse.json({
          contribution,
          status: contribution.paymentStatus,
          payment: mpPayment,
        })
      }
    } catch (error) {
      console.log('Não foi possível consultar status no MP:', error)
    }

    // Retorna dados locais se não conseguiu consultar MP
    return NextResponse.json({
      contribution,
      status: contribution.paymentStatus,
    })

  } catch (error: any) {
    console.error('Erro ao buscar status:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar status' },
      { status: 500 }
    )
  }
}
