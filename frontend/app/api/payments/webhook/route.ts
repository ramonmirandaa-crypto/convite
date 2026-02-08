import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentStatus, processWebhook, mapPaymentStatus } from '@/lib/mercadopago'
import { decrypt } from '@/lib/crypto'
import { sendPaymentConfirmationEmail, sendNewContributionNotification } from '@/lib/email'

// POST - Receber notificações do Mercado Pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Webhook recebido:', JSON.stringify(body, null, 2))

    // Processa a notificação
    const notification = processWebhook(body)

    if (notification.type !== 'payment' || !notification.paymentId) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notificação recebida mas não é de pagamento' 
      })
    }

    const paymentId = notification.paymentId

    // Busca a contribuição pelo gatewayId
    const contribution = await prisma.contribution.findFirst({
      where: { gatewayId: paymentId },
      include: { 
        gift: true,
        guest: true
      }
    })

    if (!contribution) {
      console.log(`Contribuição não encontrada para paymentId: ${paymentId}`)
      return NextResponse.json({ 
        success: true, 
        message: 'Pagamento não encontrado no sistema' 
      })
    }

    // Se já está aprovado, não processa novamente
    if (contribution.paymentStatus === 'approved') {
      return NextResponse.json({ 
        success: true, 
        message: 'Pagamento já processado' 
      })
    }

    // Busca dados atualizados do pagamento no MP
    let mpPayment: any
    try {
      // Busca configurações do evento para obter access token
      const event = await prisma.event.findFirst()
      const mpConfig = (event?.mpConfig as any) || {}
      const accessToken = mpConfig.accessToken 
        ? decrypt(mpConfig.accessToken)
        : undefined

      mpPayment = await getPaymentStatus(paymentId, accessToken)
    } catch (error) {
      console.log('Não foi possível consultar status no MP, usando dados do webhook')
      mpPayment = body.data || body
    }

    // Mapeia o status
    const newStatus = mapPaymentStatus(mpPayment.status || 'pending')

    // Atualiza a contribuição
    const updatedContribution = await prisma.contribution.update({
      where: { id: contribution.id },
      data: {
        paymentStatus: newStatus,
        gatewayResponse: mpPayment as any,
      }
    })

    // Se foi aprovado, executa ações adicionais
    if (newStatus === 'approved') {
      // 1. Verifica se o presente foi totalmente arrecadado
      const gift = await prisma.gift.findUnique({
        where: { id: contribution.giftId },
        include: {
          contributions: {
            where: { paymentStatus: 'approved' }
          }
        }
      })

      if (gift) {
        const totalReceived = gift.contributions.reduce((sum, c) => {
          return sum + Number(c.amount)
        }, 0)

        if (totalReceived >= Number(gift.totalValue)) {
          await prisma.gift.update({
            where: { id: gift.id },
            data: { status: 'fulfilled' }
          })
          console.log(`Presente ${gift.id} totalmente arrecadado!`)
        }
      }

      // 2. Envia email de confirmação para o contribuinte
      try {
        await sendPaymentConfirmationEmail(
          contribution.payerEmail,
          contribution.payerName,
          contribution.gift.title,
          Number(contribution.amount),
          contribution.paymentMethod
        )
        console.log(`Email de confirmação enviado para ${contribution.payerEmail}`)
      } catch (emailError) {
        console.error('Erro ao enviar email de confirmação:', emailError)
        // Não falha o webhook se o email não for enviado
      }

      // 3. Envia notificação para os noivos
      try {
        await sendNewContributionNotification(
          contribution.gift.title,
          contribution.payerName,
          Number(contribution.amount),
          contribution.isAnonymous
        )
      } catch (emailError) {
        console.error('Erro ao enviar notificação:', emailError)
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
