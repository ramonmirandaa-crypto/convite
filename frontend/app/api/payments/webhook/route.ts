import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getPaymentStatus, processWebhook, mapPaymentStatus } from '@/lib/mercadopago'
import { decrypt } from '@/lib/crypto'
import { sendPaymentConfirmationEmail, sendNewContributionNotification } from '@/lib/email'
import { verifyWebhookSignature } from '@/lib/webhook-signature'

const isVercel = process.env.VERCEL === '1'
const logInfo = process.env.NODE_ENV !== 'production'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

function getSupabaseServerClient() {
  // Sempre use service role para rotas server-side (evita problemas com RLS).
  return getSupabaseAdmin()
}

function resolveSecret(mpConfig: any): string | undefined {
  const secret = mpConfig?.webhookSecret
  if (!secret || typeof secret !== 'string') return undefined
  if (secret.includes(':')) {
    try { return decrypt(secret) } catch { return undefined }
  }
  return secret
}

function resolveAccessToken(mpConfig: any): string | undefined {
  const token = mpConfig?.accessToken
  if (!token || typeof token !== 'string') return undefined

  // Se estiver criptografado (iv:tag:ciphertext), descriptografa.
  if (token.includes(':')) {
    try {
      return decrypt(token)
    } catch {
      return undefined
    }
  }

  // Legado: texto plano.
  return token
}

// POST - Receber notificações do Mercado Pago
export async function POST(request: NextRequest) {
  try {
    // Valida assinatura HMAC do Mercado Pago (se secret configurado)
    const webhookSecret = await getWebhookSecret()
    if (webhookSecret) {
      const sig = verifyWebhookSignature(request, webhookSecret)
      if (!sig.valid) {
        if (logInfo) console.log('[MP Webhook] Signature rejected:', sig.reason)
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    } else if (logInfo) {
      console.log('[MP Webhook] Webhook secret not configured, skipping signature validation')
    }

    const body = await request.json()

    // Processa a notificação
    const notification = processWebhook(body)

    if (notification.type !== 'payment' || !notification.paymentId) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notificação recebida mas não é de pagamento' 
      })
    }

    const paymentId = notification.paymentId
    if (logInfo) console.log('[MP Webhook] paymentId:', paymentId)

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
        console.error('[MP Webhook] Falha ao recalcular status do presente:', e)
      }
    }

    // Busca a contribuição pelo gatewayId
    let contribution: any
    
    if (isVercel) {
      const sb = getSupabaseServerClient()
      const { data: contribData, error: contribError } = await sb
        .from('contributions')
        .select('*, gift:gifts(*), guest:guests(*)')
        .eq('gatewayId', paymentId)
        .single()
      
      if (contribError || !contribData) {
        if (logInfo) console.log(`Contribuição não encontrada para paymentId: ${paymentId}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Pagamento não encontrado no sistema' 
        })
      }
      contribution = contribData
    } else {
      contribution = await prisma.contribution.findFirst({
        where: { gatewayId: paymentId },
        include: { 
          gift: true,
          guest: true
        }
      })

      if (!contribution) {
        if (logInfo) console.log(`Contribuição não encontrada para paymentId: ${paymentId}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Pagamento não encontrado no sistema' 
        })
      }
    }

    // Busca dados atualizados do pagamento no MP
    let mpPayment: any
    // Busca configurações do evento para obter access token
    let mpConfig: any = {}
    if (isVercel) {
      const sb = getSupabaseServerClient()
      const { data: eventData, error: eventError } = await sb.from('events').select('mpConfig').single()
      if (eventError) throw eventError
      mpConfig = eventData?.mpConfig || {}
    } else {
      const event = await prisma.event.findFirst()
      mpConfig = (event?.mpConfig as any) || {}
    }

    const accessToken = resolveAccessToken(mpConfig)
    if (!accessToken && !process.env.MERCADOPAGO_ACCESS_TOKEN && !process.env.MP_ACCESS_TOKEN) {
      // Sem token, nao temos como validar status com seguranca.
      return NextResponse.json(
        { error: 'Mercado Pago nao configurado (access token ausente)' },
        { status: 500 }
      )
    }

    try {
      mpPayment = await getPaymentStatus(paymentId, accessToken)
    } catch (error) {
      console.error('[MP Webhook] Falha ao consultar pagamento no Mercado Pago:', error)
      // Retorna 500 para o MP tentar novamente depois.
      return NextResponse.json(
        { error: 'Nao foi possivel consultar o status no Mercado Pago' },
        { status: 500 }
      )
    }

    // Mapeia o status
    const newStatus = mapPaymentStatus(mpPayment.status || 'pending')

    // Idempotencia: se nao mudou, nao faz nada.
    if (newStatus === contribution.paymentStatus) {
      return NextResponse.json({ success: true, message: 'Status inalterado' })
    }

    // Atualiza a contribuição
    let updatedContribution: any
    
    if (isVercel) {
      const sb = getSupabaseServerClient()
      const { data: updatedData, error: updateError } = await sb
        .from('contributions')
        .update({
          paymentStatus: newStatus,
          gatewayResponse: mpPayment as any,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', contribution.id)
        .select()
        .single()
      
      if (updateError) throw updateError
      updatedContribution = updatedData
    } else {
      updatedContribution = await prisma.contribution.update({
        where: { id: contribution.id },
        data: {
          paymentStatus: newStatus,
          gatewayResponse: mpPayment as any,
        }
      })
    }

    // Recalcula status do presente sempre que status mudar (aprovado/refundado/cancelado).
    await recalcGiftStatus(contribution.giftId)

    // Se transicionou para aprovado, executa ações adicionais (uma vez).
    if (newStatus === 'approved' && contribution.paymentStatus !== 'approved') {
      // 1) Envia email de confirmação para o contribuinte
      try {
        await sendPaymentConfirmationEmail(
          contribution.payerEmail,
          contribution.payerName,
          contribution.gift.title,
          Number(contribution.amount),
          contribution.paymentMethod
        )
        if (logInfo) console.log(`[MP Webhook] Email de confirmação enviado para ${contribution.payerEmail}`)
      } catch (emailError) {
        console.error('[MP Webhook] Erro ao enviar email de confirmação:', emailError)
      }

      // 2) Notifica os noivos
      try {
        await sendNewContributionNotification(
          contribution.gift.title,
          contribution.payerName,
          Number(contribution.amount),
          contribution.isAnonymous
        )
      } catch (emailError) {
        console.error('[MP Webhook] Erro ao enviar notificação:', emailError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processado com sucesso',
      contribution: updatedContribution
    })

  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}

// Busca o webhook secret do evento (mpConfig.webhookSecret) ou env var
async function getWebhookSecret(): Promise<string | undefined> {
  const envSecret = process.env.MP_WEBHOOK_SECRET
  if (envSecret) return envSecret

  try {
    let mpConfig: any = {}
    if (isVercel) {
      const sb = getSupabaseServerClient()
      const { data } = await sb.from('events').select('mpConfig').single()
      mpConfig = data?.mpConfig || {}
    } else {
      const event = await prisma.event.findFirst()
      mpConfig = (event?.mpConfig as any) || {}
    }
    return resolveSecret(mpConfig)
  } catch {
    return undefined
  }
}

// GET - Verificação de webhook (para configuração no MP)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Mercado Pago às vezes envia GET para verificar a URL
  const challenge = searchParams.get('challenge')
  if (challenge) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ 
    status: 'Webhook endpoint ativo',
    url: '/api/payments/webhook'
  })
}
