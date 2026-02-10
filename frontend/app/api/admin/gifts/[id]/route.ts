import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'
import { updateGiftSchema } from '@/lib/validation'

const isVercel = process.env.VERCEL === '1'

function toCents(value: number): number {
  return Math.round((Number(value) || 0) * 100)
}

// GET - Buscar presente (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { id } = await params
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('gifts')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
      }

      return NextResponse.json({ gift: data })
    }

    const gift = await prisma.gift.findUnique({ where: { id: id } })
    if (!gift) {
      return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ gift })
  } catch (error: any) {
    console.error('Error fetching gift:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar presente', details: error?.message },
      { status: 500 }
    )
  }
}

// PUT - Atualizar presente (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { id } = await params
    const body = await request.json()
    const normalized = {
      ...body,
      totalValue: body?.totalValue !== undefined ? Number(body.totalValue) : undefined,
      quotaTotal: body?.quotaTotal !== undefined ? Number(body.quotaTotal) : undefined,
    }

    const parsed = updateGiftSchema.safeParse(normalized)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Busca gift atual para validar totalValue/quotaTotal final
    let currentGift: any
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('gifts')
        .select('id,totalValue,quotaTotal')
        .eq('id', id)
        .single()
      if (error || !data) {
        return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
      }
      currentGift = data
    } else {
      currentGift = await prisma.gift.findUnique({
        where: { id: id },
        select: { id: true, totalValue: true, quotaTotal: true },
      })
      if (!currentGift) {
        return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
      }
    }

    const nextTotalValue =
      parsed.data.totalValue !== undefined
        ? parsed.data.totalValue
        : Number(currentGift.totalValue)

    const nextQuotaTotal =
      parsed.data.quotaTotal !== undefined
        ? parsed.data.quotaTotal
        : Number(currentGift.quotaTotal || 1)

    if (nextQuotaTotal < 1) {
      return NextResponse.json({ error: 'Quantidade de cotas inválida' }, { status: 400 })
    }

    const totalCents = toCents(nextTotalValue)
    if (totalCents % nextQuotaTotal !== 0) {
      return NextResponse.json(
        { error: 'Valor total deve ser divisível pela quantidade de cotas (em centavos). Ajuste o valor ou as cotas.' },
        { status: 400 }
      )
    }

    const updateData: any = { ...parsed.data }

    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('gifts')
        .update({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ message: 'Presente atualizado com sucesso', gift: data })
    }

    const gift = await prisma.gift.update({
      where: { id: id },
      data: updateData,
    })

    return NextResponse.json({ message: 'Presente atualizado com sucesso', gift })
  } catch (error: any) {
    console.error('Error updating gift:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar presente', details: error?.message },
      { status: 500 }
    )
  }
}
