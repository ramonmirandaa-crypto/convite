import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const isVercel = process.env.VERCEL === '1'

const createPhotoSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url(),
  category: z.enum(['gallery', 'banner', 'couple']).default('gallery'),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().optional(),
})

// GET - Lista todas as fotos
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let photos
    if (isVercel) {
      const { data, error } = await supabaseAdmin
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
      { error: 'Erro ao carregar fotos', details: error?.message, photos: [] },
      { status: 500 }
    )
  }
}

// POST - Cria nova foto (admin)
export async function POST(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const body = await request.json()
    const normalized = {
      ...body,
      description: body?.description || undefined,
      category: body?.category || 'gallery',
      order: typeof body?.order === 'number' ? body.order : 0,
      isActive: typeof body?.isActive === 'boolean' ? body.isActive : true,
    }

    const parsed = createPhotoSchema.safeParse(normalized)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    let photo: any
    if (isVercel) {
      const { data, error } = await supabaseAdmin
        .from('photos')
        .insert({
          id: randomUUID(),
          title: parsed.data.title,
          description: parsed.data.description || null,
          imageUrl: parsed.data.imageUrl,
          category: parsed.data.category,
          order: parsed.data.order,
          isActive: parsed.data.isActive ?? true,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      photo = data
    } else {
      photo = await prisma.photo.create({
        data: {
          title: parsed.data.title,
          description: parsed.data.description || null,
          imageUrl: parsed.data.imageUrl,
          category: parsed.data.category,
          order: parsed.data.order,
          isActive: parsed.data.isActive ?? true,
        }
      })
    }

    return NextResponse.json(photo, { status: 201 })
  } catch (error: any) {
    console.error('Error creating photo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar foto', details: error?.message },
      { status: 500 }
    )
  }
}
