import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/adminAuth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    await prisma.photo.delete({
      where: { id: params.id }
    }).catch(() => null)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir foto:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir foto' },
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

    const photo = await prisma.photo.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        order: data.order,
        isActive: data.isActive
      }
    }).catch(() => null)

    if (!photo) {
      return NextResponse.json(
        { error: 'Foto não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(photo)
  } catch (error) {
    console.error('Erro ao atualizar foto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar foto' },
      { status: 500 }
    )
  }
}
