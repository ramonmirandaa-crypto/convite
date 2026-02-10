import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { decrypt } from '@/lib/crypto'

const isVercel = process.env.VERCEL === '1'

// Evita otimização estática/caches inesperados em GET.
export const dynamic = 'force-dynamic'

// GET /api/payment-info - Buscar informações de pagamento (público)
// Retorna apenas dados públicos necessários para a página de presentes
export async function GET() {
  try {
    let event

    if (isVercel) {
      // Usa Supabase na Vercel
      const { data, error } = await supabase
        .from('events')
        .select('pixKey, pixKeyType, coupleNames')
        .single()
      
      if (error) throw error
      event = data
    } else {
      // Usa Prisma localmente
      event = await prisma.event.findFirst({
        select: {
          pixKey: true,
          pixKeyType: true,
          coupleNames: true,
        }
      })
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Nenhum evento configurado' },
        { status: 404 }
      )
    }

    // Descriptografa a chave PIX se necessário
    let pixKey = event.pixKey || ''
    if (pixKey && pixKey.includes(':')) {
      try {
        pixKey = decrypt(pixKey)
      } catch (e) {
        // Se falhar, pode ser que já esteja em texto plano (legado)
        console.log('Chave PIX pode estar em texto plano ou formato inválido')
      }
    }

    const response = NextResponse.json({
      pixKey: pixKey || '',
      pixKeyType: event.pixKeyType || '',
      coupleNames: event.coupleNames || '',
    })
    
    // Desabilitar cache para sempre buscar dados atualizados
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Erro ao buscar informações de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar informações de pagamento' },
      { status: 500 }
    )
  }
}
