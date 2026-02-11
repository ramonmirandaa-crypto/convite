import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]

export async function POST(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'photos'

    const results: any = {
      bucket,
      steps: [],
      success: false,
    }

    // Passo 1: Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      results.steps.push({ step: 'list_buckets', status: 'error', error: listError.message })
      return NextResponse.json(results, { status: 500 })
    }

    const bucketExists = buckets?.some(b => b.name === bucket)
    results.steps.push({ step: 'check_bucket', exists: bucketExists })

    // Passo 2: Criar o bucket se não existir
    if (!bucketExists) {
      const { data, error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
      })

      if (createError) {
        results.steps.push({ step: 'create_bucket', status: 'error', error: createError.message })
        return NextResponse.json(results, { status: 500 })
      }

      results.steps.push({ step: 'create_bucket', status: 'success', data })
    } else {
      results.steps.push({ step: 'create_bucket', status: 'skipped', reason: 'already_exists' })
    }

    // Passo 3: Configurar políticas via SQL
    try {
      // Tentar criar políticas usando SQL
      const policiesSQL = `
        -- Garantir que RLS está habilitado
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        
        -- Remover políticas antigas se existirem
        DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
        DROP POLICY IF EXISTS "Allow service role uploads" ON storage.objects;
        DROP POLICY IF EXISTS "Allow service role deletes" ON storage.objects;
        
        -- Política 1: Leitura pública para anon
        CREATE POLICY "Allow public read access"
        ON storage.objects FOR SELECT
        TO anon
        USING (bucket_id = '${bucket}');
        
        -- Política 2: Upload para service_role
        CREATE POLICY "Allow service role uploads"
        ON storage.objects FOR INSERT
        TO service_role
        WITH CHECK (bucket_id = '${bucket}');
        
        -- Política 3: Delete para service_role
        CREATE POLICY "Allow service role deletes"
        ON storage.objects FOR DELETE
        TO service_role
        USING (bucket_id = '${bucket}');
        
        -- Política 4: Update para service_role
        CREATE POLICY "Allow service role updates"
        ON storage.objects FOR UPDATE
        TO service_role
        USING (bucket_id = '${bucket}')
        WITH CHECK (bucket_id = '${bucket}');
      `

      // Tentar executar via RPC
      const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', { sql: policiesSQL })
      
      if (sqlError) {
        // Se RPC falhar, tentar via query direta (pode não funcionar em todas as configs)
        results.steps.push({ 
          step: 'setup_policies', 
          status: 'warning', 
          warning: 'RPC exec_sql não disponível. Políticas precisam ser configuradas manualmente.',
          error: sqlError.message,
          manual_setup_required: true
        })
      } else {
        results.steps.push({ step: 'setup_policies', status: 'success' })
      }
    } catch (policyError: any) {
      results.steps.push({ 
        step: 'setup_policies', 
        status: 'warning', 
        warning: 'Políticas precisam ser configuradas manualmente',
        error: policyError?.message 
      })
    }

    // Passo 4: Testar upload
    try {
      const testContent = new Uint8Array([0x89, 0x50, 0x4E, 0x47]) // PNG header
      const { error: testError } = await supabaseAdmin.storage
        .from(bucket)
        .upload('test-connection.png', testContent, { upsert: true })

      if (testError) {
        results.steps.push({ 
          step: 'test_upload', 
          status: 'error', 
          error: testError.message,
          hint: 'Se o erro mencionar RLS ou políticas, configure manualmente no Supabase Dashboard'
        })
      } else {
        // Deleta o arquivo de teste
        await supabaseAdmin.storage.from(bucket).remove(['test-connection.png'])
        results.steps.push({ step: 'test_upload', status: 'success' })
        results.success = true
      }
    } catch (testError: any) {
      results.steps.push({ step: 'test_upload', status: 'error', error: testError?.message })
    }

    const statusCode = results.success ? 200 : 500
    return NextResponse.json(results, { status: statusCode })

  } catch (error: any) {
    console.error('Setup storage error:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao configurar storage', 
        details: error?.message,
        hint: 'Verifique se SUPABASE_SERVICE_ROLE_KEY está configurada corretamente'
      },
      { status: 500 }
    )
  }
}

// GET: Verificar status do storage
export async function GET(request: NextRequest) {
  const auth = adminAuth(request)
  if (!auth.success) return auth.response!

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'photos'

    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()
    
    if (error) {
      return NextResponse.json(
        { error: 'Erro ao listar buckets', details: error.message },
        { status: 500 }
      )
    }

    const bucketInfo = buckets?.find(b => b.name === bucket)
    
    return NextResponse.json({
      bucket,
      exists: !!bucketInfo,
      bucketInfo: bucketInfo || null,
      allBuckets: buckets?.map(b => b.name) || [],
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao verificar storage', details: error?.message },
      { status: 500 }
    )
  }
}
