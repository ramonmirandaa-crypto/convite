import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { createContactSchema } from '@/lib/validation'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// GET /api/contact - Listar todas as mensagens (admin)
export async function GET(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let messages
    if (isVercel) {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('createdAt', { ascending: false })
      if (error) throw error
      messages = data || []
    } else {
      messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }
    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Erro ao listar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro ao listar mensagens', details: error?.message },
      { status: 500 }
    )
  }
}

// POST /api/contact - Enviar mensagem de contato (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createContactSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    let contact
    if (isVercel) {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert(parsed.data)
        .select()
        .single()
      if (error) throw error
      contact = data
    } else {
      contact = await prisma.contactMessage.create({
        data: parsed.data
      })
    }

    return NextResponse.json(
      { message: 'Mensagem enviada com sucesso', contact },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao salvar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem', details: error?.message },
      { status: 500 }
    )
  }
}
