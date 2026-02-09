import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { adminAuth } from '@/lib/adminAuth'

const isVercel = process.env.VERCEL === '1'

const eventData = {
  coupleNames: 'Raiana & Raphael',
  date: '2026-05-16T12:00:00.000Z',
  venue: 'Rancho do Coutinho, Estrada Sao Jose do Turvo, 2195',
  venueMapsUrl: 'https://maps.google.com/?q=Estr.+de+São+José+do+Turvo+-+São+Luiz+da+Barra,+Barra+do+Piraí+-+RJ,+27165-971',
  description: 'Com imensa alegria, convidamos você para celebrar conosco o início da nossa eternidade. Um dia de amor, união e bênçãos.',
}

const photoFiles = [
  { title: 'Nosso Amor', file: 'IMG_0544.png' },
  { title: 'Momento Especial', file: 'IMG_0548.jpeg' },
  { title: 'Juntos Para Sempre', file: 'IMG_0549.jpeg' },
  { title: 'Sorriso de Felicidade', file: 'IMG_0550.jpeg' },
  { title: 'Dia Inesquecível', file: '5e17a544-5f8d-4169-b912-6ac1de30787f.jpeg' },
  { title: 'Amor Verdadeiro', file: '603d0296-8ce6-47ba-8576-05bda785aa80.jpeg' },
  { title: 'Completude', file: '67695956-b0e1-4c97-a7ba-f37006a2a9ab.jpeg' },
  { title: 'Dois Corações', file: '9a046fed-3acc-41c3-902e-d7e5f17fc680.jpeg' },
  { title: 'Carinho', file: '0abd5f16-6d62-47bb-a804-89a3ad11748b.jpeg' },
  { title: 'Ternura', file: '166dcb0a-2b44-4547-91c3-7f1f733a9ca6.jpeg' },
  { title: 'Harmonia', file: '2bf3d2c2-6041-4450-8eb4-bd41cbb0e891.jpeg' },
  { title: 'União', file: '40111ddd-7108-48c6-b256-63ee117fa43e.jpeg' },
]

export async function POST(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    let event
    let photosAdded = 0
    let photoPathsMigrated = 0

    if (isVercel) {
      // --- Supabase path ---
      // Upsert event
      const { data: existing } = await supabaseAdmin.from('events').select('id').limit(1).single()

      if (existing) {
        const { data, error } = await supabaseAdmin
          .from('events')
          .update({ ...eventData, updatedAt: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        event = data
      } else {
        const { data, error } = await supabaseAdmin
          .from('events')
          .insert({ ...eventData, date: new Date(eventData.date).toISOString() })
          .select()
          .single()
        if (error) throw error
        event = data
      }

      // Add photos if none exist
      const { count } = await supabaseAdmin.from('photos').select('*', { count: 'exact', head: true })

      if ((count ?? 0) === 0) {
        const rows = photoFiles.map((p, i) => ({
          title: p.title,
          description: 'Momento especial de Raiana & Raphael',
          imageUrl: `/Fotos/${p.file}`,
          category: 'gallery',
          order: i,
          isActive: true,
        }))
        const { error } = await supabaseAdmin.from('photos').insert(rows)
        if (error) throw error
        photosAdded = rows.length
      }

      // Migrate old /images/ paths → /Fotos/
      const { data: oldPhotos } = await supabaseAdmin
        .from('photos')
        .select('id, imageUrl')
        .like('imageUrl', '/images/%')

      if (oldPhotos && oldPhotos.length > 0) {
        for (const photo of oldPhotos) {
          await supabaseAdmin
            .from('photos')
            .update({ imageUrl: photo.imageUrl.replace('/images/', '/Fotos/') })
            .eq('id', photo.id)
        }
        photoPathsMigrated = oldPhotos.length
      }
    } else {
      // --- Prisma path (local) ---
      event = await prisma.event.upsert({
        where: { id: '07fa2963-e46e-44c6-94d1-67d77e584256' },
        update: { ...eventData, date: new Date(eventData.date) },
        create: { ...eventData, date: new Date(eventData.date) },
      })

      const existingPhotos = await prisma.photo.count()

      if (existingPhotos === 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          await prisma.photo.create({
            data: {
              title: photoFiles[i].title,
              description: 'Momento especial de Raiana & Raphael',
              imageUrl: `/Fotos/${photoFiles[i].file}`,
              category: 'gallery',
              order: i,
              isActive: true,
            }
          })
        }
        photosAdded = photoFiles.length
      }

      // Migrate old /images/ paths → /Fotos/
      photoPathsMigrated = await prisma.$executeRawUnsafe(
        `UPDATE "photos" SET "imageUrl" = REPLACE("imageUrl", '/images/', '/Fotos/') WHERE "imageUrl" LIKE '/images/%'`
      )
    }

    return NextResponse.json({
      message: 'Setup atualizado!',
      event,
      photosAdded,
      photoPathsMigrated,
    })
  } catch (error: any) {
    console.error('Erro no setup:', error)
    return NextResponse.json(
      { error: 'Erro ao executar setup', details: error?.message },
      { status: 500 }
    )
  }
}
