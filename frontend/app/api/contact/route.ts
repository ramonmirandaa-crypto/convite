import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createContactSchema } from '@/lib/validation'
import { adminAuth } from '@/lib/adminAuth'

// GET /api/contact - Listar todas as mensagens (admin)
export async function GET(request: NextRequest) {
  // Verifica autenticação admin
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Erro ao listar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro ao listar mensagens' },
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

    const contact = await prisma.contactMessage.create({
      data: parsed.data
    })

    return NextResponse.json(
      { message: 'Mensagem enviada com sucesso', contact },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    )
  }
}
