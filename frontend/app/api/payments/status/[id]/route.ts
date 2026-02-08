import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentStatus, mapPaymentStatus } from '@/lib/mercadopago'
import { decrypt } from '@/lib/crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Busca a contribuição
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: { gift: true }
    })

    if (!contribution) {
      return NextResponse.json(
        { error: 'Contribuição não encontrada' },
        { status: 404 }
      )
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
      const event = await prisma.event.findFirst()
      const mpConfig = (event?.mpConfig as any) || {}
      const accessToken = mpConfig.accessToken 
        ? decrypt(mpConfig.accessToken)
        : undefined

      if (accessToken) {
        const mpPayment = await getPaymentStatus(contribution.gatewayId, accessToken)
        const newStatus = mapPaymentStatus(mpPayment.status || 'pending')

        // Atualiza se o status mudou
        if (newStatus !== contribution.paymentStatus) {
          await prisma.contribution.update({
            where: { id: contribution.id },
            data: {
              paymentStatus: newStatus,
              gatewayResponse: mpPayment as any,
            }
          })

          // Se foi aprovado, verifica se o presente foi totalmente arrecadado
          if (newStatus === 'approved') {
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
