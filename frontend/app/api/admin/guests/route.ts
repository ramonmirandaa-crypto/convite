import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'
import { createRSVPSchema } from '@/lib/validation'
import { randomUUID } from 'crypto'
import { z } from 'zod'

const isVercel = process.env.VERCEL === '1'

const adminCreateGuestSchema = createRSVPSchema.extend({
  confirmed: z.boolean(),
})

// GET - Lista todos os convidados
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let guests
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('guests')
        .select('*, contributions(*)')
        .order('createdAt', { ascending: false })
      if (error) throw error
      guests = (data || []).map((guest: any) => ({
        ...guest,
        _count: { contributions: guest.contributions?.length || 0 }
      }))
    } else {
      guests = await prisma.guest.findMany({
        include: {
          _count: {
            select: { contributions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ guests })
  } catch (error: any) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar convidados', details: error?.message, guests: [] },
      { status: 500 }
    )
  }
}

// POST - Cria convidado (admin)
export async function POST(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const body = await request.json()
    const normalized = {
      ...body,
      phone: body?.phone || undefined,
      dietaryRestrictions: body?.dietaryRestrictions || undefined,
      suggestedSong: body?.suggestedSong || undefined,
      message: body?.message || undefined,
      eventId: body?.eventId || undefined,
    }

    const parsed = adminCreateGuestSchema.safeParse(normalized)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, phone, guestCount, dietaryRestrictions, suggestedSong, eventId, confirmed } = parsed.data

    // Define eventId alvo (se não vier no body, usa/cria o primeiro evento)
    let targetEventId = eventId
    if (!targetEventId) {
      if (isVercel) {
        const { data, error } = await getSupabaseAdmin().from('events').select('id').single()
        if (data?.id) {
          targetEventId = data.id
        } else {
          const { data: newEvent, error: createError } = await getSupabaseAdmin()
            .from('events')
            .insert({
              id: randomUUID(),
              coupleNames: 'Casal',
              date: new Date('2026-05-16').toISOString(),
              venue: 'Local do Evento',
              updatedAt: new Date().toISOString(),
            })
            .select()
            .single()
          if (createError) throw createError
          targetEventId = newEvent.id
        }
      } else {
        const existingEvent = await prisma.event.findFirst()
        if (existingEvent) {
          targetEventId = existingEvent.id
        } else {
          const newEvent = await prisma.event.create({
            data: {
              coupleNames: 'Casal',
              date: new Date('2026-05-16'),
              venue: 'Local do Evento',
            }
          })
          targetEventId = newEvent.id
        }
      }
    }

    if (!targetEventId) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 400 }
      )
    }

    const qrCodeToken = randomUUID()

    let guest: any
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('guests')
        .insert({
          id: randomUUID(),
          eventId: targetEventId,
          name,
          email,
          phone: phone || null,
          guestCount,
          dietaryRestrictions: dietaryRestrictions || null,
          suggestedSong: suggestedSong || null,
          qrCodeToken,
          confirmed,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      guest = data
    } else {
      guest = await prisma.guest.create({
        data: {
          eventId: targetEventId,
          name,
          email,
          phone: phone || null,
          guestCount,
          dietaryRestrictions: dietaryRestrictions || null,
          suggestedSong: suggestedSong || null,
          qrCodeToken,
          confirmed,
        }
      })
    }

    return NextResponse.json(
      { message: 'Convidado criado com sucesso', guest },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating guest:', error)
    return NextResponse.json(
      { error: 'Erro ao criar convidado', details: error?.message },
      { status: 500 }
    )
  }
}
