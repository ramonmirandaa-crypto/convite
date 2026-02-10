import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'
import { createGiftSchema } from '@/lib/validation'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const isVercel = process.env.VERCEL === '1'

const adminCreateGiftSchema = createGiftSchema.extend({
  status: z.enum(['available', 'hidden']).optional(),
})

function toCents(value: number): number {
  return Math.round((Number(value) || 0) * 100)
}

// GET - Lista todos os presentes
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let gifts
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('gifts')
        .select('*, contributions(amount,paymentStatus)')
        .order('createdAt', { ascending: false })
      if (error) throw error
      gifts = (data || []).map((gift: any) => {
        const contributions = gift.contributions || []
        const approved = contributions.filter((c: any) => c?.paymentStatus === 'approved')
        const totalReceived = approved.reduce((sum: number, c: any) => sum + Number(c.amount), 0)

        const { contributions: _, ...giftData } = gift
        return {
          ...giftData,
          totalReceived,
          progress: Math.min(100, (totalReceived / Number(gift.totalValue)) * 100),
          remaining: Math.max(0, Number(gift.totalValue) - totalReceived),
          _count: { contributions: contributions.length }
        }
      })
    } else {
      gifts = await prisma.gift.findMany({
        include: {
          _count: {
            select: { contributions: true }
          },
          contributions: {
            where: { paymentStatus: 'approved' },
            select: { amount: true }
          },
        },
        orderBy: { createdAt: 'desc' }
      })

      gifts = (gifts || []).map((gift: any) => {
        const approvedContributions = gift.contributions || []
        const totalReceived = approvedContributions.reduce((sum: number, c: any) => sum + Number(c.amount), 0)

        const { contributions: _, ...giftData } = gift
        return {
          ...giftData,
          totalReceived,
          progress: Math.min(100, (totalReceived / Number(gift.totalValue)) * 100),
          remaining: Math.max(0, Number(gift.totalValue) - totalReceived),
        }
      })
    }

    return NextResponse.json({ gifts })
  } catch (error: any) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar presentes', details: error?.message, gifts: [] },
      { status: 500 }
    )
  }
}

// POST - Cria um presente (admin)
export async function POST(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const body = await request.json()
    const normalized = {
      ...body,
      description: body?.description || undefined,
      imageUrl: body?.imageUrl || undefined,
      eventId: body?.eventId || undefined,
      quotaTotal: body?.quotaTotal !== undefined ? Number(body.quotaTotal) : undefined,
    }

    const parsed = adminCreateGiftSchema.safeParse(normalized)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, description, imageUrl, totalValue, eventId, status } = parsed.data
    const quotaTotal = parsed.data.quotaTotal ?? 1

    const totalCents = toCents(totalValue)
    if (quotaTotal < 1) {
      return NextResponse.json({ error: 'Quantidade de cotas inválida' }, { status: 400 })
    }
    if (totalCents % quotaTotal !== 0) {
      return NextResponse.json(
        { error: 'Valor total deve ser divisível pela quantidade de cotas (em centavos). Ajuste o valor ou as cotas.' },
        { status: 400 }
      )
    }

    // Define eventId alvo (se não vier no body, usa o primeiro evento)
    let targetEventId = eventId
    if (!targetEventId) {
      if (isVercel) {
        const { data, error } = await getSupabaseAdmin().from('events').select('id').single()
        if (error || !data?.id) {
          return NextResponse.json(
            { error: 'Nenhum evento encontrado. Crie um evento primeiro.' },
            { status: 400 }
          )
        }
        targetEventId = data.id
      } else {
        const existingEvent = await prisma.event.findFirst()
        if (!existingEvent) {
          return NextResponse.json(
            { error: 'Nenhum evento encontrado. Crie um evento primeiro.' },
            { status: 400 }
          )
        }
        targetEventId = existingEvent.id
      }
    }

    if (!targetEventId) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 400 }
      )
    }

    let gift: any
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('gifts')
        .insert({
          id: randomUUID(),
          eventId: targetEventId,
          title,
          description: description || null,
          imageUrl: imageUrl || null,
          totalValue,
          quotaTotal,
          status: status || 'available',
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      gift = data
    } else {
      gift = await prisma.gift.create({
        data: {
          eventId: targetEventId,
          title,
          description: description || null,
          imageUrl: imageUrl || null,
          totalValue,
          quotaTotal,
          status: status || 'available',
        }
      })
    }

    return NextResponse.json(
      { message: 'Presente criado com sucesso', gift },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating gift:', error)
    return NextResponse.json(
      { error: 'Erro ao criar presente', details: error?.message },
      { status: 500 }
    )
  }
}
