import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'
import { encrypt, decrypt } from '@/lib/crypto'

const isVercel = process.env.VERCEL === '1'

// GET - Buscar configurações de pagamento
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let event
    if (isVercel) {
      const { data, error } = await supabaseAdmin
        .from('events')
        .select('pixKey, pixKeyType, mpConfig')
        .single()
      if (error) throw error
      event = data
    } else {
      event = await prisma.event.findFirst({
        select: {
          pixKey: true,
          pixKeyType: true,
          mpConfig: true,
        }
      })
    }
    
    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Descriptografa os valores para exibição
    let pixKey = event.pixKey || ''
    let mpConfig: any = event.mpConfig || {}

    // Tenta descriptografar a chave PIX
    if (pixKey && pixKey.includes(':')) {
      try {
        pixKey = decrypt(pixKey)
      } catch (e) {
        // Se falhar, pode ser que já esteja em texto plano (legado)
        console.log('Chave PIX pode estar em texto plano ou formato inválido')
      }
    }

    // Tenta descriptografar o accessToken do MP
    if (mpConfig.accessToken && mpConfig.accessToken.includes(':')) {
      try {
        const decryptedToken = decrypt(mpConfig.accessToken)
        mpConfig = {
          ...mpConfig,
          accessToken: decryptedToken
        }
      } catch (e) {
        console.log('Access Token pode estar em texto plano ou formato inválido')
      }
    }

    // Tenta descriptografar o webhookSecret do MP
    if (mpConfig.webhookSecret && mpConfig.webhookSecret.includes(':')) {
      try {
        mpConfig = {
          ...mpConfig,
          webhookSecret: decrypt(mpConfig.webhookSecret)
        }
      } catch (e) {
        console.log('Webhook Secret pode estar em texto plano ou formato inválido')
      }
    }

    return NextResponse.json({
      pixKey,
      pixKeyType: event.pixKeyType || '',
      mpConfig,
    })
  } catch (error: any) {
    console.error('Erro ao buscar configurações de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações', details: error?.message },
      { status: 500 }
    )
  }
}

// POST - Atualizar configurações de pagamento
export async function POST(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const formData = await request.formData()
    
    const pixKey = formData.get('pixKey') as string
    const pixKeyType = formData.get('pixKeyType') as string
    const mpAccessToken = formData.get('mpAccessToken') as string
    const mpPublicKey = formData.get('mpPublicKey') as string
    const mpWebhookSecret = formData.get('mpWebhookSecret') as string

    // Busca o primeiro evento
    let event
    if (isVercel) {
      const { data, error } = await supabaseAdmin.from('events').select('id, mpConfig').single()
      if (error) throw error
      event = data
    } else {
      event = await prisma.event.findFirst()
    }
    
    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado. Crie o evento primeiro.' },
        { status: 404 }
      )
    }

    // Prepara os dados de atualização
    const updateData: any = {}

    // Atualiza PIX se fornecido
    if (pixKey !== null) {
      updateData.pixKey = pixKey ? encrypt(pixKey) : null
    }
    if (pixKeyType !== null) {
      updateData.pixKeyType = pixKeyType || null
    }

    // Atualiza configurações do Mercado Pago
    const currentConfig = (event.mpConfig as any) || {}
    const newConfig: any = { ...currentConfig }
    
    if (mpAccessToken !== null) {
      newConfig.accessToken = mpAccessToken ? encrypt(mpAccessToken) : null
    }
    if (mpPublicKey !== null) {
      newConfig.publicKey = mpPublicKey || null
    }
    if (mpWebhookSecret !== null) {
      newConfig.webhookSecret = mpWebhookSecret ? encrypt(mpWebhookSecret) : null
    }

    updateData.mpConfig = newConfig

    // Atualiza o evento
    if (isVercel) {
      updateData.updatedAt = new Date().toISOString()
      // Usa service role key para bypass do RLS
      const { error } = await supabaseAdmin
        .from('events')
        .update(updateData)
        .eq('id', event.id)
      if (error) {
        console.error('[Payment Settings] Supabase update error:', error)
        throw error
      }
    } else {
      await prisma.event.update({
        where: { id: event.id },
        data: updateData
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configurações de pagamento atualizadas com sucesso',
    })
  } catch (error: any) {
    console.error('Erro ao atualizar configurações de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações', details: error?.message },
      { status: 500 }
    )
  }
}
