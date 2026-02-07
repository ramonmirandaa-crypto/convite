import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/contributions/webhook - Webhook do gateway de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gatewayId, status } = body

    const contribution = await prisma.contribution.findFirst({
      where: { gatewayId },
      include: { gift: true }
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribuição não encontrada' },
        { status: 404 }
      )
    }

    const updatedContribution = await prisma.contribution.update({
      where: { id: contribution.id },
      data: {
        paymentStatus: status,
        gatewayResponse: body
      }
    })

    // Se aprovado, verifica se o presente foi totalmente arrecadado
    if (status === 'approved') {
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
        }
      }
    }

    return NextResponse.json({
      message: 'Webhook processado com sucesso',
      contribution: updatedContribution
    })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
