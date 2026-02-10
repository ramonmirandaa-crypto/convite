import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'
import { randomUUID } from 'crypto'

const isVercel = process.env.VERCEL === '1'

// GET - Buscar dados do evento
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let event
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin().from('events').select('*').single()
      if (error) throw error
      event = data
    } else {
      event = await prisma.event.findFirst()
    }
    
    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error: any) {
    console.error('Erro ao buscar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados do evento', details: error?.message },
      { status: 500 }
    )
  }
}

// POST - Atualizar dados do evento
export async function POST(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const formData = await request.formData()
    
    const coupleNames = formData.get('coupleNames') as string
    const date = formData.get('date') as string
    const venue = formData.get('venue') as string
    const venueMapsUrl = formData.get('venueMapsUrl') as string
    const description = formData.get('description') as string

    // Validação básica
    if (!coupleNames || !date || !venue) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      )
    }

    let event
    if (isVercel) {
      // Busca o primeiro evento
      const { data: existingEvent, error: findError } = await getSupabaseAdmin()
        .from('events')
        .select('id')
        .single()
      
      if (findError && findError.code !== 'PGRST116') throw findError

      const eventData = {
        coupleNames,
        date: new Date(date).toISOString(),
        venue,
        venueMapsUrl: venueMapsUrl || null,
        description: description || null,
        updatedAt: new Date().toISOString(),
      }

      if (existingEvent) {
        // Atualiza
        const { data, error } = await getSupabaseAdmin()
          .from('events')
          .update(eventData)
          .eq('id', existingEvent.id)
          .select()
          .single()
        if (error) throw error
        event = data
      } else {
        // Cria novo
        const { data, error } = await getSupabaseAdmin()
          .from('events')
          .insert({ id: randomUUID(), ...eventData })
          .select()
          .single()
        if (error) throw error
        event = data
      }
    } else {
      // Usa Prisma
      const existingEvent = await prisma.event.findFirst()
      
      if (existingEvent) {
        event = await prisma.event.update({
          where: { id: existingEvent.id },
          data: {
            coupleNames,
            date: new Date(date),
            venue,
            venueMapsUrl: venueMapsUrl || null,
            description: description || null,
          }
        })
      } else {
        event = await prisma.event.create({
          data: {
            coupleNames,
            date: new Date(date),
            venue,
            venueMapsUrl: venueMapsUrl || null,
            description: description || null,
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Dados do evento atualizados com sucesso',
      event 
    })
  } catch (error: any) {
    console.error('Erro ao atualizar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar dados do evento', details: error?.message },
      { status: 500 }
    )
  }
}
