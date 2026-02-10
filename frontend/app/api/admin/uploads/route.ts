import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { randomUUID } from 'crypto'
import path from 'path'
import { promises as fs } from 'fs'

export const runtime = 'nodejs'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const isVercel = process.env.VERCEL === '1'

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

function inferExtension(file: File): string {
  const extFromMime = MIME_TO_EXT[file.type]
  if (extFromMime) return extFromMime

  const allowedExts = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'])
  const name = (file.name || '').toLowerCase()
  const extFromName = name.includes('.') ? name.split('.').pop() : undefined
  if (extFromName && allowedExts.has(extFromName)) return extFromName === 'jpeg' ? 'jpg' : extFromName

  return 'jpg'
}

function hasSupabaseAdminConfig(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(supabaseUrl && serviceKey)
}

function isBucketNotFoundError(error: any): boolean {
  const msg = String(error?.message || '').toLowerCase()
  return msg.includes('bucket not found') || error?.statusCode === 404
}

function isBucketAlreadyExistsError(error: any): boolean {
  const msg = String(error?.message || '').toLowerCase()
  return msg.includes('already exists') || error?.statusCode === 409
}

export async function POST(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const formData = await request.formData()
    const entry = formData.get('file')

    if (!entry || typeof entry === 'string') {
      return NextResponse.json(
        { error: 'Arquivo não encontrado. Envie no campo "file".' },
        { status: 400 }
      )
    }

    const file = entry as File

    if (file.size <= 0) {
      return NextResponse.json(
        { error: 'Arquivo vazio.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo: ${Math.floor(MAX_FILE_SIZE_BYTES / 1024 / 1024)}MB.` },
        { status: 400 }
      )
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Envie JPG, PNG, WEBP, GIF ou AVIF.' },
        { status: 400 }
      )
    }

    const ext = inferExtension(file)
    const fileId = randomUUID()

    // Prefer Supabase Storage when configured (recommended for Vercel/serverless).
    if (hasSupabaseAdminConfig()) {
      const supabaseAdmin = getSupabaseAdmin()
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'photos'
      const prefix = process.env.SUPABASE_STORAGE_PREFIX || 'uploads'
      const objectPath = `${prefix}/${fileId}.${ext}`

      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadOptions = {
        contentType: file.type,
        upsert: false,
        cacheControl: '31536000',
      }

      let { error } = await supabaseAdmin.storage.from(bucket).upload(objectPath, buffer, uploadOptions)
      if (error && isBucketNotFoundError(error)) {
        // Self-heal: create the bucket (public) and retry once.
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, { public: true })
        if (createError && !isBucketAlreadyExistsError(createError)) {
          console.error('[Uploads] Storage createBucket failed', {
            bucket,
            message: createError.message,
          })
          return NextResponse.json(
            {
              error: 'Erro ao criar bucket no Storage.',
              details: createError.message,
              bucket,
              hint:
                'Crie o bucket manualmente no Supabase Storage ou verifique permissões da service role key.',
            },
            { status: 500 }
          )
        }

        ;({ error } = await supabaseAdmin.storage.from(bucket).upload(objectPath, buffer, uploadOptions))
      }

      if (error) {
        console.error('[Uploads] Storage upload failed', {
          bucket,
          objectPath,
          message: error.message,
        })
        return NextResponse.json(
          {
            error: 'Erro ao enviar imagem para o Storage.',
            details: error.message,
            bucket,
            path: objectPath,
            hint:
              'Verifique se o bucket existe e está público (ou ajuste as políticas). Você pode configurar SUPABASE_STORAGE_BUCKET.',
          },
          { status: 500 }
        )
      }

      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath)
      return NextResponse.json(
        { url: data.publicUrl, bucket, path: objectPath },
        { status: 201 }
      )
    }

    // On Vercel, the filesystem is read-only (except /tmp) and cannot be used to serve public uploads.
    if (isVercel) {
      return NextResponse.json(
        {
          error: 'Upload local não disponível na Vercel.',
          hint:
            'Configure o Supabase Storage (bucket público) e a variável SUPABASE_SERVICE_ROLE_KEY, ou informe uma URL manualmente no campo de imagem.',
        },
        { status: 500 }
      )
    }

    // Local filesystem fallback (useful for local dev / non-serverless deployments).
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const filename = `${fileId}.${ext}`
    const destPath = path.join(uploadsDir, filename)

    await fs.writeFile(destPath, Buffer.from(await file.arrayBuffer()))

    const origin = new URL(request.url).origin
    return NextResponse.json(
      { url: `${origin}/uploads/${filename}`, path: `public/uploads/${filename}` },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload', details: error?.message },
      { status: 500 }
    )
  }
}
