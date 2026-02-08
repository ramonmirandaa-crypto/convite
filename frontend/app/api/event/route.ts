import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { adminAuth } from '@/lib/adminAuth'
import { z } from 'zod'

const isVercel = process.env.VERCEL === '1'

const updateEventSchema = z.object({
  coupleNames: z.string().min(2).max(200).optional(),
  date: z.string().datetime().optional(),
  venue: z.string().min(2).max(300).optional(),
  venueMapsUrl: z.string().url().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
})

// GET /api/event - Buscar dados do evento (público)
export async function GET() {
  try {
    let event, guestCount = 0, giftCount = 0

    if (isVercel) {
      // Usa Supabase na Vercel
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .single()
      
      if (error) throw error
      event = data

      // Conta guests e gifts
      const { count: gc, error: gcError } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
      if (!gcError) guestCount = gc || 0

      const { count: gic, error: gicError } = await supabase
        .from('gifts')
        .select('*', { count: 'exact', head: true })
      if (!gicError) giftCount = gic || 0
    } else {
      // Usa Prisma localmente
      event = await prisma.event.findFirst({
        include: {
          _count: {
            select: {
              guests: true,
              gifts: true,
            }
          }
        }
      })
      if (event) {
        guestCount = event._count.guests
        giftCount = event._count.gifts
      }
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Nenhum evento configurado' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      id: event.id,
      coupleNames: event.coupleNames,
      date: event.date,
      venue: event.venue,
      venueMapsUrl: event.venueMapsUrl,
      description: event.description,
      guestCount,
      giftCount,
    })
    
    // Desabilitar cache para sempre buscar dados atualizados
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}

// PUT /api/event - Atualizar dados do evento (admin)
export async function PUT(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const body = await request.json()
    const parsed = updateEventSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    let eventId
    if (isVercel) {
      const { data, error } = await supabase
        .from('events')
        .select('id')
        .single()
      if (error) throw error
      eventId = data?.id
    } else {
      const event = await prisma.event.findFirst()
      eventId = event?.id
    }

    if (!eventId) {
      return NextResponse.json(
        { error: 'Nenhum evento configurado' },
        { status: 404 }
      )
    }

    const data: any = { ...parsed.data }
    if (data.date) {
      data.date = new Date(data.date)
    }

    let updated
    if (isVercel) {
      const { data: result, error } = await supabase
        .from('events')
        .update(data)
        .eq('id', eventId)
        .select()
        .single()
      if (error) throw error
      updated = result
    } else {
      updated = await prisma.event.update({
        where: { id: eventId },
        data,
      })
    }

    return NextResponse.json({
      message: 'Evento atualizado com sucesso',
      event: updated
    })
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}
