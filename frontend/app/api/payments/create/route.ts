import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createPixPayment, createCardPayment, mapPaymentStatus } from '@/lib/mercadopago'
import { encrypt, decrypt } from '@/lib/crypto'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { isValidCPF } from '@/lib/cpf'

const isVercel = process.env.VERCEL === '1'

function getSupabaseServerClient() {
  // Prefer service role para rotas server-side (evita problemas com RLS).
  return process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabase
}

// Schema de validação
const paymentSchema = z.object({
  giftId: z.string().uuid(),
  amount: z.number().positive(),
  payerName: z.string().min(2),
  payerEmail: z.string().email(),
  payerCPF: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido'),
  payerPhone: z.string().optional(),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  paymentMethod: z.enum(['pix', 'credit_card']),
  // Campos específicos para cartão
  cardToken: z.string().optional(),
  installments: z.number().min(1).max(12).optional(),
  paymentMethodId: z.string().optional(),
  issuerId: z.string().optional(),
})


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Valida dados
    const parsed = paymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Valida CPF
    if (!isValidCPF(data.payerCPF)) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      )
    }

    // Verifica se o presente existe e busca configurações
    let gift: any
    let event: any
    let contributions: any[] = []
    
    if (isVercel) {
      // Usa Supabase na Vercel
      const sb = getSupabaseServerClient()

      const { data: giftData, error: giftError } = await sb
        .from('gifts')
        .select('*')
        .eq('id', data.giftId)
        .single()
      
      if (giftError || !giftData) {
        return NextResponse.json(
          { error: 'Presente não encontrado' },
          { status: 404 }
        )
      }
      gift = giftData

      // Busca evento para configurações do MP
      const { data: eventData, error: eventError } = await sb
        .from('events')
        .select('mpConfig')
        .single()
      
      if (eventError) throw eventError
      event = eventData

      // Busca contribuições aprovadas
      const { data: contribData, error: contribError } = await sb
        .from('contributions')
        .select('amount')
        .eq('giftId', data.giftId)
        .eq('paymentStatus', 'approved')
      
      if (!contribError && contribData) {
        contributions = contribData
      }
    } else {
      // Usa Prisma localmente
      const giftData = await prisma.gift.findUnique({
        where: { id: data.giftId },
        include: {
          event: true,
          contributions: {
            where: { paymentStatus: 'approved' }
          }
        }
      })

      if (!giftData) {
        return NextResponse.json(
          { error: 'Presente não encontrado' },
          { status: 404 }
        )
      }
      gift = giftData
      event = giftData.event
      contributions = giftData.contributions
    }

    // Calcula valor restante
    const totalReceived = contributions.reduce((sum: number, c: any) => {
      return sum + Number(c.amount)
    }, 0)
    const remaining = Number(gift.totalValue) - totalReceived

    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'Presente já foi totalmente arrecadado' },
        { status: 400 }
      )
    }

    if (data.amount > remaining) {
      return NextResponse.json(
        { error: `Valor excede o restante de R$ ${remaining.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Busca configurações do Mercado Pago
    const mpConfig = (event?.mpConfig as any) || {}
    let accessToken: string | undefined
    
    if (mpConfig.accessToken) {
      try {
        accessToken = decrypt(mpConfig.accessToken)
      } catch (e) {
        console.error('Erro ao descriptografar access token:', e)
        accessToken = undefined
      }
    }

    // Cria registro da contribuição no banco
    let contribution: any
    
    if (isVercel) {
      const sb = getSupabaseServerClient()
      const contributionId = randomUUID()

      const { data: contribData, error: contribError } = await sb
        .from('contributions')
        .insert({
          id: contributionId,
          giftId: data.giftId,
          amount: data.amount,
          payerName: data.payerName,
          payerEmail: data.payerEmail,
          payerCPF: encrypt(data.payerCPF.replace(/\D/g, '')),
          payerPhone: data.payerPhone || null,
          message: data.message || null,
          isAnonymous: data.isAnonymous,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'pending',
          gatewayId: `pending_${Date.now()}`,
          installments: data.installments || 1,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (contribError) throw contribError
      contribution = contribData
    } else {
      contribution = await prisma.contribution.create({
        data: {
          giftId: data.giftId,
          amount: data.amount,
          payerName: data.payerName,
          payerEmail: data.payerEmail,
          payerCPF: encrypt(data.payerCPF.replace(/\D/g, '')),
          payerPhone: data.payerPhone || null,
          message: data.message || null,
          isAnonymous: data.isAnonymous,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'pending',
          gatewayId: `pending_${Date.now()}`,
          installments: data.installments || 1,
        }
      })
    }

    // Se não tem configuração do MP, retorna mock (modo desenvolvimento)
    if (!accessToken) {
      return NextResponse.json({
        success: true,
        contribution,
        mock: true,
        message: 'Modo de desenvolvimento - Mercado Pago não configurado',
        pixCode: data.paymentMethod === 'pix' ? '00020126580014BR.GOV.BCB.PIX0136casamento.raianaeraphael@email.com5204000053039865406100.005802BR5913Raiana e Raphael6009SAO PAULO62140510ABC123DEF6304' : null,
        pixQrCode: data.paymentMethod === 'pix' ? 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PIXCODE' : null,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      })
    }

    // Cria pagamento no Mercado Pago
    let mpResult: any
    
    if (data.paymentMethod === 'pix') {
      mpResult = await createPixPayment({
        amount: data.amount,
        description: `Contribuição para ${gift.title} - Casamento`,
        payerEmail: data.payerEmail,
        payerName: data.payerName,
        payerCPF: data.payerCPF,
        externalReference: contribution.id,
      }, accessToken)
    } else {
      // Cartão
      if (!data.cardToken) {
        return NextResponse.json(
          { error: 'Token do cartão é obrigatório' },
          { status: 400 }
        )
      }
      if (!data.paymentMethodId) {
        return NextResponse.json(
          { error: 'paymentMethodId é obrigatório para pagamento com cartão' },
          { status: 400 }
        )
      }

      mpResult = await createCardPayment({
        amount: data.amount,
        description: `Contribuição para ${gift.title} - Casamento`,
        payerEmail: data.payerEmail,
        payerName: data.payerName,
        payerCPF: data.payerCPF,
        token: data.cardToken,
        installments: data.installments || 1,
        paymentMethodId: data.paymentMethodId,
        issuerId: data.issuerId,
        externalReference: contribution.id,
      }, accessToken)
    }

    // Atualiza contribuição com ID do MP
    if (isVercel) {
      const sb = getSupabaseServerClient()
      const { error: updateError } = await sb
        .from('contributions')
        .update({
          gatewayId: String(mpResult.id),
          gatewayResponse: mpResult as any,
          paymentStatus: mapPaymentStatus(mpResult.status || 'pending'),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', contribution.id)
      
      if (updateError) throw updateError
    } else {
      await prisma.contribution.update({
        where: { id: contribution.id },
        data: {
          gatewayId: String(mpResult.id),
          gatewayResponse: mpResult as any,
          paymentStatus: mapPaymentStatus(mpResult.status || 'pending'),
        }
      })
    }

    // Retorna dados do pagamento
    const response: any = {
      success: true,
      contribution: {
        ...contribution,
        gatewayId: String(mpResult.id),
      },
      payment: {
        id: mpResult.id,
        status: mpResult.status,
        statusDetail: mpResult.status_detail,
      },
    }

    // Adiciona dados específicos do PIX
    if (data.paymentMethod === 'pix' && mpResult.point_of_interaction?.transaction_data) {
      const pixData = mpResult.point_of_interaction.transaction_data
      response.pix = {
        qrCode: pixData.qr_code,
        qrCodeBase64: pixData.qr_code_base64,
        copyPasteCode: pixData.qr_code,
        ticketUrl: pixData.ticket_url,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error)
    
    // Verifica se é erro do Mercado Pago
    if (error.message?.includes('Access token')) {
      return NextResponse.json(
        { error: 'Mercado Pago não configurado. Configure o access token nas configurações.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}
