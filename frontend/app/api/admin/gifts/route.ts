import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

// GET - Lista todos os presentes
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let gifts
    if (isVercel) {
      const { data, error } = await supabase
        .from('gifts')
        .select('*, contributions(*)')
        .order('createdAt', { ascending: false })
      if (error) throw error
      gifts = (data || []).map((gift: any) => ({
        ...gift,
        _count: { contributions: gift.contributions?.length || 0 }
      }))
    } else {
      gifts = await prisma.gift.findMany({
        include: {
          _count: {
            select: { contributions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ gifts })
  } catch (error: any) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar presentes', gifts: [] },
      { status: 200 }
    )
  }
}
