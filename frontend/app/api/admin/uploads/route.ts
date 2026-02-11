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
  return msg.includes('bucket not found') || error?.statusCode === 404 || msg.includes('not found')
}

function isBucketAlreadyExistsError(error: any): boolean {
  const msg = String(error?.message || '').toLowerCase()
  return msg.includes('already exists') || error?.statusCode === 409 || msg.includes('already')
}

function isRLSError(error: any): boolean {
  const msg = String(error?.message || '').toLowerCase()
  return msg.includes('row-level security') || 
         msg.includes('new row violates') || 
         msg.includes('rls') ||
         msg.includes('policy')
}

// Configura as políticas RLS necessárias para o bucket
async function setupBucketPolicies(supabaseAdmin: any, bucket: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Política 1: Permitir leitura pública (anon)
    const { error: selectError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          -- Remover política existente se houver
          DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
          
          -- Criar política para leitura pública
          CREATE POLICY "Allow public read access"
          ON storage.objects FOR SELECT
          TO anon
          USING (bucket_id = '${bucket}');
        END $$;
      `
    })

    // Política 2: Permitir upload via service_role
    const { error: insertError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          -- Remover política existente se houver
          DROP POLICY IF EXISTS "Allow service role uploads" ON storage.objects;
          
          -- Criar política para upload via service_role
          CREATE POLICY "Allow service role uploads"
          ON storage.objects FOR INSERT
          TO service_role
          WITH CHECK (bucket_id = '${bucket}');
        END $$;
      `
    })

    // Política 3: Permitir delete via service_role
    const { error: deleteError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          -- Remover política existente se houver
          DROP POLICY IF EXISTS "Allow service role deletes" ON storage.objects;
          
          -- Criar política para delete via service_role
          CREATE POLICY "Allow service role deletes"
          ON storage.objects FOR DELETE
          TO service_role
          USING (bucket_id = '${bucket}');
        END $$;
      `
    })

    if (selectError || insertError || deleteError) {
      console.log('[Uploads] Some policies may have failed, but bucket should work:', {
        selectError: selectError?.message,
        insertError: insertError?.message,
        deleteError: deleteError?.message,
      })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error?.message }
  }
}

// Cria o bucket e configura as políticas automaticamente
async function ensureBucketExists(supabaseAdmin: any, bucket: string): Promise<{ 
  success: boolean; 
  created: boolean;
  error?: string;
  details?: string;
}> {
  try {
    // Tenta criar o bucket
    const { data, error } = await supabaseAdmin.storage.createBucket(bucket, { 
      public: true,
      fileSizeLimit: MAX_FILE_SIZE_BYTES,
      allowedMimeTypes: Array.from(ALLOWED_IMAGE_MIME_TYPES)
    })

    if (error) {
      if (isBucketAlreadyExistsError(error)) {
        console.log(`[Uploads] Bucket "${bucket}" already exists`)
        return { success: true, created: false }
      }
      
      console.error('[Uploads] Failed to create bucket:', error.message)
      return { 
        success: false, 
        created: false, 
        error: 'Falha ao criar bucket', 
        details: error.message 
      }
    }

    console.log(`[Uploads] Bucket "${bucket}" created successfully`)
    
    // Configura as políticas RLS
    const policyResult = await setupBucketPolicies(supabaseAdmin, bucket)
    if (!policyResult.success) {
      console.warn('[Uploads] Bucket created but policies setup failed:', policyResult.error)
    }

    return { success: true, created: true }
  } catch (error: any) {
    return { 
      success: false, 
      created: false, 
      error: 'Erro ao criar bucket', 
      details: error?.message 
    }
  }
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

      // Tenta fazer o upload
      let { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(objectPath, buffer, uploadOptions)
      
      // Se falhou porque o bucket não existe, cria automaticamente
      if (uploadError && isBucketNotFoundError(uploadError)) {
        console.log(`[Uploads] Bucket "${bucket}" not found, creating automatically...`)
        
        const bucketResult = await ensureBucketExists(supabaseAdmin, bucket)
        
        if (!bucketResult.success) {
          return NextResponse.json(
            {
              error: 'Erro ao criar bucket automaticamente.',
              details: bucketResult.details,
              hint: 'Crie o bucket manualmente no Supabase: Dashboard → Storage → New bucket → "photos" (Public)',
            },
            { status: 500 }
          )
        }

        console.log(`[Uploads] Bucket created: ${bucketResult.created}, retrying upload...`)
        
        // Tenta fazer o upload novamente
        const retryResult = await supabaseAdmin.storage.from(bucket).upload(objectPath, buffer, uploadOptions)
        uploadError = retryResult.error
      }

      // Se falhou por erro de RLS/políticas, tenta configurar e fazer upload novamente
      if (uploadError && isRLSError(uploadError)) {
        console.log('[Uploads] RLS error detected, setting up policies...')
        
        const policyResult = await setupBucketPolicies(supabaseAdmin, bucket)
        if (!policyResult.success) {
          console.warn('[Uploads] Policy setup failed:', policyResult.error)
        }
        
        // Tenta fazer o upload novamente
        const retryResult = await supabaseAdmin.storage.from(bucket).upload(objectPath, buffer, uploadOptions)
        uploadError = retryResult.error
      }

      if (uploadError) {
        console.error('[Uploads] Storage upload failed', {
          bucket,
          objectPath,
          message: uploadError.message,
        })
        
        return NextResponse.json(
          {
            error: 'Erro ao enviar imagem para o Storage.',
            details: uploadError.message,
            bucket,
            path: objectPath,
            hint: isRLSError(uploadError) 
              ? 'Erro de permissão (RLS). Configure manualmente no Supabase: Storage → Policies → New Policy → Allow all operations for service_role'
              : 'Verifique as configurações do Supabase Storage.',
          },
          { status: 500 }
        )
      }

      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath)
      
      return NextResponse.json(
        { 
          url: data.publicUrl, 
          bucket, 
          path: objectPath,
          message: 'Upload realizado com sucesso!'
        },
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
