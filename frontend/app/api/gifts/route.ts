import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { createGiftSchema } from '@/lib/validation'
import { adminAuth } from '@/lib/adminAuth'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'

const isVercel = process.env.VERCEL === '1'

// Forçar rota dinâmica - usa request.url
export const dynamic = 'force-dynamic'

function toCents(value: number): number {
  return Math.round((Number(value) || 0) * 100)
}

// GET /api/gifts - Listar todos os presentes (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    let gifts
    if (isVercel) {
      // Usa Supabase
      let query = supabase
        .from('gifts')
        .select('*, contributions(*)')
        .order('createdAt', { ascending: false })
      
      if (eventId) {
        query = query.eq('eventId', eventId)
      }
      
      const { data, error } = await query
      if (error) throw error
      gifts = data || []
    } else {
      // Usa Prisma
      const where = eventId ? { eventId } : {}
      gifts = await prisma.gift.findMany({
        where,
        include: {
          contributions: {
            where: {
              paymentStatus: 'approved'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    const giftsWithProgress = gifts.map((gift: any) => {
      // Em Supabase, a relação pode trazer contribuições de qualquer status.
      // Para manter consistência com o Prisma (que filtra aprovadas), filtramos aqui.
      const contributions = (gift.contributions || []).filter(
        (c: any) => c?.paymentStatus === 'approved'
      )
      const totalReceived = contributions.reduce((sum: number, c: any) => {
        return sum + Number(c.amount)
      }, 0)

      const { contributions: _, ...giftData } = gift

      const totalCents = toCents(Number(gift.totalValue))
      const receivedCents = toCents(totalReceived)
      const remainingCents = Math.max(0, totalCents - receivedCents)

      const quotaTotalRaw = Number(gift.quotaTotal || 1)
      const quotaTotal = Number.isFinite(quotaTotalRaw) && quotaTotalRaw >= 1 ? Math.floor(quotaTotalRaw) : 1
      const quotaValueCents = quotaTotal > 0 ? (totalCents / quotaTotal) : totalCents
      const quotasConfigOk = quotaTotal > 0 && totalCents > 0 && totalCents % quotaTotal === 0
      const quotaValue = quotasConfigOk ? (quotaValueCents / 100) : null
      const quotasReceived = quotasConfigOk && quotaValueCents > 0 ? Math.floor(receivedCents / quotaValueCents) : null
      const quotasRemaining = quotasConfigOk && quotaValueCents > 0 ? Math.floor(remainingCents / quotaValueCents) : null

      return {
        ...giftData,
        totalReceived,
        progress: Math.min(100, (totalReceived / Number(gift.totalValue)) * 100),
        remaining: Math.max(0, Number(gift.totalValue) - totalReceived),
        quotaTotal,
        quotaValue,
        quotasReceived,
        quotasRemaining,
      }
    })

    return NextResponse.json({ gifts: giftsWithProgress })
  } catch (error: any) {
    console.error('Erro ao buscar presentes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar presentes', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// POST /api/gifts - Criar novo presente (admin)
export async function POST(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const body = await request.json()
    const parsed = createGiftSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, description, imageUrl, totalValue, eventId } = parsed.data

    let targetEventId = eventId
    if (!targetEventId) {
      if (isVercel) {
        const { data, error } = await supabase.from('events').select('id').single()
        if (error || !data) {
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

    let gift
    if (isVercel) {
      const { data, error } = await supabase
        .from('gifts')
        .insert({
          id: randomUUID(),
          eventId: targetEventId,
          title,
          description: description || null,
          imageUrl: imageUrl || null,
          totalValue,
          status: 'available',
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      gift = data
    } else {
      const giftData: any = {
        eventId: targetEventId,
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        totalValue,
        status: 'available'
      }
      gift = await prisma.gift.create({ data: giftData })
    }

    return NextResponse.json(
      { message: 'Presente criado com sucesso', gift },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar presente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar presente' },
      { status: 500 }
    )
  }
}
