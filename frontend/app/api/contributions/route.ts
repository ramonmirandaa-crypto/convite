import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { createContributionSchema } from '@/lib/validation'
import { encrypt } from '@/lib/crypto'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// GET /api/contributions - Listar todas as contribuições (admin)
export async function GET(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { searchParams } = new URL(request.url)
    const giftId = searchParams.get('giftId')
    const guestId = searchParams.get('guestId')
    const status = searchParams.get('status')

    let query = supabase.from('contributions').select('*, gift(*), guest(*)')
    
    if (giftId) query = query.eq('giftId', giftId)
    if (guestId) query = query.eq('guestId', guestId)
    if (status) query = query.eq('paymentStatus', status)

    let contributions
    if (isVercel) {
      const { data, error } = await query.order('createdAt', { ascending: false })
      if (error) throw error
      contributions = data || []
    } else {
      const where: any = {}
      if (giftId) where.giftId = giftId
      if (guestId) where.guestId = guestId
      if (status) where.paymentStatus = status

      contributions = await prisma.contribution.findMany({
        where,
        include: {
          gift: true,
          guest: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(contributions)
  } catch (error: any) {
    console.error('Erro ao buscar contribuições:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar contribuições', details: error?.message },
      { status: 500 }
    )
  }
}

// POST /api/contributions - Criar nova contribuição
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createContributionSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const {
      giftId, guestId, amount, message, isAnonymous,
      payerName, payerEmail, payerCPF, payerPhone,
      paymentMethod, installments
    } = parsed.data

    // Valida CPF (algoritmo módulo 11)
    if (!isValidCPF(payerCPF)) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      )
    }

    // Verifica se o presente existe
    let gift
    if (isVercel) {
      const { data, error } = await supabase
        .from('gifts')
        .select('*, contributions(*)')
        .eq('id', giftId)
        .single()
      if (error) throw error
      gift = data
    } else {
      gift = await prisma.gift.findUnique({
        where: { id: giftId },
        include: {
          contributions: {
            where: { paymentStatus: 'approved' }
          }
        }
      })
    }

    if (!gift) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      )
    }

    const contributions = gift.contributions || []
    const approvedContributions = contributions.filter((c: any) => c.paymentStatus === 'approved')
    const totalReceived = approvedContributions.reduce((sum: number, c: any) => {
      return sum + Number(c.amount)
    }, 0)

    const remaining = Number(gift.totalValue) - totalReceived

    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'Presente já foi totalmente arrecadado' },
        { status: 400 }
      )
    }

    // Encripta CPF antes de salvar (LGPD)
    const encryptedCPF = encrypt(payerCPF.replace(/[^\d]/g, ''))

    let contribution
    if (isVercel) {
      const { data, error } = await supabase
        .from('contributions')
        .insert({
          giftId,
          guestId: guestId || null,
          amount,
          message: message || null,
          isAnonymous,
          payerName,
          payerEmail,
          payerCPF: encryptedCPF,
          payerPhone: payerPhone || null,
          paymentMethod,
          paymentStatus: 'pending',
          gatewayId: `pending_${Date.now()}`,
          installments
        })
        .select()
        .single()
      if (error) throw error
      contribution = data
    } else {
      contribution = await prisma.contribution.create({
        data: {
          giftId,
          guestId: guestId || null,
          amount,
          message: message || null,
          isAnonymous,
          payerName,
          payerEmail,
          payerCPF: encryptedCPF,
          payerPhone: payerPhone || null,
          paymentMethod,
          paymentStatus: 'pending',
          gatewayId: `pending_${Date.now()}`,
          installments
        }
      })
    }

    return NextResponse.json({
      message: 'Contribuição criada com sucesso',
      contribution,
      mockPayment: {
        pixCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000',
        pixQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIXCODE',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar contribuição:', error)
    return NextResponse.json(
      { error: 'Erro ao criar contribuição', details: error?.message },
      { status: 500 }
    )
  }
}

// Validação de CPF (módulo 11)
function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '')

  if (cpf.length !== 11) return false
  if (/(\d)\1{10}$/.test(cpf)) return false

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
