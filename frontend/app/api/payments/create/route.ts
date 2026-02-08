import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPixPayment, createCardPayment, mapPaymentStatus } from '@/lib/mercadopago'
import { encrypt } from '@/lib/crypto'
import { z } from 'zod'

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

// Validar CPF
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '')
  
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(10, 11))) return false

  return true
}

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

    // Verifica se o presente existe
    const gift = await prisma.gift.findUnique({
      where: { id: data.giftId },
      include: {
        event: true,
        contributions: {
          where: { paymentStatus: 'approved' }
        }
      }
    })

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      )
    }

    // Calcula valor restante
    const totalReceived = gift.contributions.reduce((sum, c) => {
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
    const mpConfig = (gift.event.mpConfig as any) || {}
    const accessToken = mpConfig.accessToken 
      ? await import('@/lib/crypto').then(m => m.decrypt(mpConfig.accessToken))
      : undefined

    // Cria registro da contribuição no banco
    const contribution = await prisma.contribution.create({
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

      mpResult = await createCardPayment({
        amount: data.amount,
        description: `Contribuição para ${gift.title} - Casamento`,
        payerEmail: data.payerEmail,
        payerName: data.payerName,
        payerCPF: data.payerCPF,
        token: data.cardToken,
        installments: data.installments || 1,
        paymentMethodId: data.paymentMethodId || 'visa',
        issuerId: data.issuerId,
        externalReference: contribution.id,
      }, accessToken)
    }

    // Atualiza contribuição com ID do MP
    await prisma.contribution.update({
      where: { id: contribution.id },
      data: {
        gatewayId: String(mpResult.id),
        gatewayResponse: mpResult as any,
        paymentStatus: mapPaymentStatus(mpResult.status || 'pending'),
      }
    })

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
