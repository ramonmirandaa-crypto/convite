import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { createRSVPSchema, updateRSVPSchema } from '@/lib/validation'
import { randomUUID } from 'crypto'
import { adminAuth } from '@/lib/adminAuth'
import { sendRSVPConfirmationEmail } from '@/lib/email'

const isVercel = process.env.VERCEL === '1'

// GET /api/rsvp - Listar todos os convidados (admin)
export async function GET(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let guests
    if (isVercel) {
      const { data, error } = await supabase
        .from('guests')
        .select('*, event(*), contributions(*)')
        .order('createdAt', { ascending: false })
      if (error) throw error
      guests = data || []
    } else {
      guests = await prisma.guest.findMany({
        include: {
          event: true,
          contributions: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }
    return NextResponse.json(guests)
  } catch (error: any) {
    console.error('Erro ao buscar convidados:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar convidados', details: error?.message },
      { status: 500 }
    )
  }
}

// POST /api/rsvp - Criar novo convidado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createRSVPSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, phone, guestCount, dietaryRestrictions, suggestedSong, eventId } = parsed.data

    // Se não houver eventId, busca o primeiro evento ou cria um padrão
    let targetEventId = eventId
    if (!targetEventId) {
      if (isVercel) {
        const { data, error } = await supabase.from('events').select('id').single()
        if (data) {
          targetEventId = data.id
        } else {
          // Cria evento padrão
          const { data: newEvent, error: createError } = await supabase
            .from('events')
            .insert({
              id: randomUUID(),
              coupleNames: 'Casal',
              date: new Date('2025-06-22').toISOString(),
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
              date: new Date('2025-06-22'),
              venue: 'Local do Evento'
            }
          })
          targetEventId = newEvent.id
        }
      }
    }

    const qrCodeToken = randomUUID()

    let guest
    if (isVercel) {
      const { data, error } = await supabase
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
          confirmed: true,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      guest = data
    } else {
      if (!targetEventId) {
        return NextResponse.json(
          { error: 'Evento não encontrado' },
          { status: 400 }
        )
      }
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
          confirmed: true
        }
      })
    }

    // Envia email de confirmação
    try {
      let event
      if (isVercel) {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', targetEventId)
          .single()
        if (!error) event = data
      } else {
        event = await prisma.event.findUnique({ where: { id: targetEventId } })
      }
      
      if (event) {
        await sendRSVPConfirmationEmail(
          email,
          name,
          guestCount,
          new Date(event.date).toISOString(),
          event.venue
        )
      }
    } catch (emailError) {
      console.error('Erro ao enviar email de confirmação:', emailError)
      // Não falha se o email não for enviado
    }

    return NextResponse.json({
      message: 'Confirmação registrada com sucesso',
      guest,
      qrCodeUrl: `/api/rsvp/qr/${qrCodeToken}`
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar convidado:', error)
    return NextResponse.json(
      { error: 'Erro ao criar confirmação', details: error?.message },
      { status: 500 }
    )
  }
}
