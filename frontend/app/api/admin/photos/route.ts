import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// GET - Lista todas as fotos
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let photos
    if (isVercel) {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('createdAt', { ascending: false })
      if (error) throw error
      photos = data || []
    } else {
      photos = await prisma.photo.findMany({
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ photos })
  } catch (error: any) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar fotos', photos: [] },
      { status: 200 }
    )
  }
}
