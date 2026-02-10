import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { isValidCPF } from '@/lib/cpf'
import { createPixPayment, createCardPayment, mapPaymentStatus } from '@/lib/mercadopago'
import { decrypt } from '@/lib/crypto'

function toCents(value: number): number {
  return Math.round((Number(value) || 0) * 100)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { giftId, amount, quotaQuantity, payerName, payerEmail, payerCPF, payerPhone, message, isAnonymous, paymentMethod, cardToken, installments, paymentMethodId, issuerId } = body

    const normalizedPaymentMethod = paymentMethod === 'card' ? 'credit_card' : paymentMethod
    if (normalizedPaymentMethod !== 'pix' && normalizedPaymentMethod !== 'credit_card') {
      return NextResponse.json({ error: 'Método de pagamento inválido' }, { status: 400 })
    }
    
    // Valida CPF
    if (!isValidCPF(payerCPF)) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
    }
    
    // Cria cliente Supabase
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !key) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }
    
    const sb = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Busca o gift
    const { data: gift, error: giftError } = await sb
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single()
    
    if (giftError || !gift) {
      return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
    }

    const totalCents = toCents(Number(gift.totalValue))
    const quotaTotalRaw = Number((gift as any).quotaTotal || 1)
    const quotaTotal = Number.isFinite(quotaTotalRaw) && quotaTotalRaw >= 1 ? Math.floor(quotaTotalRaw) : 1
    const quotaValueCents = quotaTotal > 0 ? (totalCents / quotaTotal) : totalCents
    const quotasConfigOk = quotaTotal > 0 && totalCents > 0 && totalCents % quotaTotal === 0
    
    // Busca evento
    const { data: event, error: eventError } = await sb
      .from('events')
      .select('mpConfig')
      .single()
    
    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 })
    }
    
    // Busca contribuições aprovadas
    const { data: contributions } = await sb
      .from('contributions')
      .select('amount')
      .eq('giftId', giftId)
      .eq('paymentStatus', 'approved')
    
    const totalReceivedCents = (contributions || []).reduce((sum: number, c: any) => sum + toCents(Number(c.amount)), 0)
    const remainingCents = totalCents - totalReceivedCents
    
    if (remainingCents <= 0) {
      return NextResponse.json({ error: 'Presente já foi totalmente arrecadado' }, { status: 400 })
    }

    let amountCents: number
    if (quotaQuantity !== undefined && quotaQuantity !== null && String(quotaQuantity).trim() !== '') {
      if (!quotasConfigOk) {
        return NextResponse.json(
          { error: 'Cotas inválidas para este presente. Ajuste o valor total e o total de cotas no painel admin.' },
          { status: 400 }
        )
      }
      const q = Math.floor(Number(quotaQuantity))
      if (!Number.isFinite(q) || q < 1) {
        return NextResponse.json({ error: 'Quantidade de cotas inválida' }, { status: 400 })
      }
      const remainingQuotas = Math.floor(remainingCents / quotaValueCents)
      if (q > remainingQuotas) {
        return NextResponse.json(
          { error: `Quantidade de cotas excede o restante. Disponíveis: ${remainingQuotas}.` },
          { status: 400 }
        )
      }
      amountCents = q * quotaValueCents
    } else {
      amountCents = toCents(Number(amount))
      if (!Number.isFinite(amountCents) || amountCents <= 0) {
        return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
      }
      // Se o presente usa cotas, o valor deve ser múltiplo da cota.
      if (quotaTotal > 1 && quotasConfigOk && amountCents % quotaValueCents !== 0 && amountCents !== remainingCents) {
        return NextResponse.json(
          { error: 'Valor deve ser múltiplo da cota. Selecione o número de cotas.' },
          { status: 400 }
        )
      }
    }

    if (amountCents > remainingCents) {
      return NextResponse.json(
        { error: `Valor excede o restante de R$ ${(remainingCents / 100).toFixed(2)}` },
        { status: 400 }
      )
    }

    const finalAmount = amountCents / 100

    // Regras do cartão de crédito:
    // - mínimo R$ 100,00
    // - parcelas no máximo 3x
    // - mínimo R$ 80,00 por parcela
    const isCard = normalizedPaymentMethod === 'credit_card'
    const installmentsNum = Math.floor(Number(installments || 1))
    if (isCard) {
      if (amountCents < 10000) {
        return NextResponse.json(
          { error: 'Pagamento com cartão disponível apenas para valores a partir de R$ 100,00.' },
          { status: 400 }
        )
      }
      if (!Number.isFinite(installmentsNum) || installmentsNum < 1) {
        return NextResponse.json({ error: 'Número de parcelas inválido' }, { status: 400 })
      }
      if (installmentsNum > 3) {
        return NextResponse.json({ error: 'Parcelamento máximo permitido: 3x.' }, { status: 400 })
      }
      if (Math.floor(amountCents / installmentsNum) < 8000) {
        return NextResponse.json(
          { error: 'Valor mínimo por parcela: R$ 80,00.' },
          { status: 400 }
        )
      }
    }
    
    // Busca configurações do Mercado Pago
    // Prioridade: 1) Variável de ambiente, 2) Banco de dados
    let accessToken: string | undefined = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      const mpConfig = (event?.mpConfig as any) || {}
      if (mpConfig.accessToken) {
        try {
          accessToken = decrypt(mpConfig.accessToken)
        } catch (e) {
          console.error('Erro ao descriptografar access token:', e)
        }
      }
    }
    
    // Cria contribuição no banco
    const contributionId = randomUUID()
    const { data: contribution, error: insertError } = await sb
      .from('contributions')
      .insert({
        id: contributionId,
        giftId: giftId,
        amount: finalAmount,
        payerName: payerName,
        payerEmail: payerEmail,
        payerCPF: payerCPF.replace(/\D/g, ''),
        payerPhone: payerPhone || null,
        message: message || null,
        isAnonymous: isAnonymous || false,
        paymentMethod: normalizedPaymentMethod,
        paymentStatus: 'pending',
        gatewayId: `pending_${Date.now()}`,
        installments: installmentsNum || 1,
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    
    // Se não tem configuração do MP, retorna erro claro
    if (!accessToken) {
      // Limpa a contribuição pendente criada acima
      await sb.from('contributions').delete().eq('id', contributionId)
      return NextResponse.json(
        { error: 'Mercado Pago não configurado. Configure o access token no painel admin ou nas variáveis de ambiente.' },
        { status: 503 }
      )
    }
    
    // Tenta criar pagamento no Mercado Pago
    try {
      let mpResult: any
      
      if (normalizedPaymentMethod === 'pix') {
        mpResult = await createPixPayment({
          amount: finalAmount,
          description: `Contribuição para ${gift.title} - Casamento`,
          payerEmail: payerEmail,
          payerName: payerName,
          payerCPF: payerCPF,
          externalReference: contribution.id,
        }, accessToken)
      } else {
        if (!cardToken || !paymentMethodId) {
          return NextResponse.json({ error: 'Dados do cartão incompletos' }, { status: 400 })
        }
        
        mpResult = await createCardPayment({
          amount: finalAmount,
          description: `Contribuição para ${gift.title} - Casamento`,
          payerEmail: payerEmail,
          payerName: payerName,
          payerCPF: payerCPF,
          token: cardToken,
          installments: installments || 1,
          paymentMethodId: paymentMethodId,
          issuerId: issuerId,
          externalReference: contribution.id,
        }, accessToken)
      }
      
      // Atualiza contribuição com ID do MP
      const { error: updateError } = await sb
        .from('contributions')
        .update({
          gatewayId: String(mpResult.id),
          gatewayResponse: mpResult as any,
          paymentStatus: mapPaymentStatus(mpResult.status || 'pending'),
          updatedAt: new Date().toISOString(),
        })
        .eq('id', contribution.id)
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
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
      if (normalizedPaymentMethod === 'pix' && mpResult.point_of_interaction?.transaction_data) {
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
      
    } catch (mpError: any) {
      console.error('Erro no Mercado Pago:', mpError)

      // Extrai detalhes do erro do MP para diagnóstico
      const errorDetail =
        mpError.cause?.message ||
        mpError.message ||
        'Erro desconhecido'
      const mpApiMessage =
        mpError.apiResponse?.body?.message ||
        mpError.cause?.apiResponse?.body?.message ||
        ''

      // Atualiza contribuição como rejeitada para não ficar pendente eternamente
      await sb
        .from('contributions')
        .update({
          paymentStatus: 'rejected',
          gatewayResponse: { error: errorDetail, apiMessage: mpApiMessage } as any,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', contribution.id)

      // Monta mensagem amigável mas com detalhes do MP
      let userMessage: string
      if (errorDetail.includes('NEXT_PUBLIC_APP_URL') || errorDetail.includes('notification_url')) {
        userMessage = 'Configuração do servidor incompleta (URL do webhook). Contate o administrador.'
      } else if (errorDetail.includes('invalid') || mpApiMessage.includes('invalid')) {
        userMessage = 'Dados de pagamento inválidos. Verifique as informações e tente novamente.'
      } else {
        userMessage = `Erro ao processar pagamento: ${mpApiMessage || errorDetail}`.slice(0, 200)
      }

      return NextResponse.json(
        { error: userMessage },
        { status: 502 }
      )
    }
    
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}
