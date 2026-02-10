import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const isVercel = process.env.VERCEL === '1'

const updatePhotoSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  imageUrl: z.string().url().optional(),
  category: z.enum(['gallery', 'banner', 'couple']).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    if (isVercel) {
      const { data, error } = await getSupabaseAdmin()
        .from('photos')
        .delete()
        .eq('id', params.id)
        .select('id')

      if (error) throw error
      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: 'Foto não encontrada' },
          { status: 404 }
        )
      }
    } else {
      await prisma.photo.delete({
        where: { id: params.id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao excluir foto:', error)

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Foto não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir foto', details: error?.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const data = await request.json()
    const normalized = {
      ...data,
      description: data?.description === '' ? null : data?.description,
      order: typeof data?.order === 'number' ? data.order : undefined,
      isActive: typeof data?.isActive === 'boolean' ? data.isActive : undefined,
    }

    const parsed = updatePhotoSchema.safeParse(normalized)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Monta update sem undefined (para não "apagar" campos sem querer)
    const updateData: any = {}
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) updateData[key] = value
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }

    let photo: any
    if (isVercel) {
      updateData.updatedAt = new Date().toISOString()
      const { data: updated, error } = await getSupabaseAdmin()
        .from('photos')
        .update(updateData)
        .eq('id', params.id)
        .select('*')
        .single()
      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Foto não encontrada' },
            { status: 404 }
          )
        }
        throw error
      }
      photo = updated
    } else {
      photo = await prisma.photo.update({
        where: { id: params.id },
        data: updateData
      })
    }

    if (!photo) {
      return NextResponse.json(
        { error: 'Foto não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(photo)
  } catch (error: any) {
    console.error('Erro ao atualizar foto:', error)

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Foto não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar foto', details: error?.message },
      { status: 500 }
    )
  }
}
