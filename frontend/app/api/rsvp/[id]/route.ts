import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { updateRSVPSchema } from '@/lib/validation'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// GET /api/rsvp/:id - Buscar convidado específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    let guest

    if (isVercel) {
      const { data, error } = await supabase
        .from('guests')
        .select('*, event(*), contributions(*, gift(*))')
        .eq('id', id)
        .single()
      if (error) throw error
      guest = data
    } else {
      guest = await prisma.guest.findUnique({
        where: { id },
        include: {
          event: true,
          contributions: {
            include: {
              gift: true
            }
          }
        }
      })
    }

    if (!guest) {
      return NextResponse.json(
        { error: 'Convidado não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(guest)
  } catch (error: any) {
    console.error('Erro ao buscar convidado:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar convidado', details: error?.message },
      { status: 500 }
    )
  }
}

// PUT /api/rsvp/:id - Atualizar convidado (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { id } = params
    const body = await request.json()
    const parsed = updateRSVPSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    let guest
    if (isVercel) {
      const { data, error } = await supabase
        .from('guests')
        .update(parsed.data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      guest = data
    } else {
      guest = await prisma.guest.update({
        where: { id },
        data: parsed.data
      })
    }

    return NextResponse.json({ message: 'Convidado atualizado com sucesso', guest })
  } catch (error: any) {
    console.error('Erro ao atualizar convidado:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar convidado', details: error?.message },
      { status: 500 }
    )
  }
}

// DELETE /api/rsvp/:id - Deletar convidado (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const { id } = params
    
    if (isVercel) {
      const { error } = await supabase.from('guests').delete().eq('id', id)
      if (error) throw error
    } else {
      await prisma.guest.delete({ where: { id } })
    }
    
    return NextResponse.json({ message: 'Convidado deletado com sucesso' })
  } catch (error: any) {
    console.error('Erro ao deletar convidado:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar convidado', details: error?.message },
      { status: 500 }
    )
  }
}
