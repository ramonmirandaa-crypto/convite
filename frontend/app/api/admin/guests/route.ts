import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// GET - Lista todos os convidados
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let guests
    if (isVercel) {
      const { data, error } = await supabase
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
      { error: 'Erro ao carregar convidados', guests: [] },
      { status: 200 }
    )
  }
}
