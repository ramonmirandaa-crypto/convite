import { createClient, SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  // Retorna cliente cacheado se existir
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Supabase Admin] Service role key not configured!')
    console.error('[Supabase Admin] URL exists:', !!supabaseUrl)
    console.error('[Supabase Admin] Key exists:', !!supabaseServiceKey)
    throw new Error('Supabase service role key not configured')
  }

  // Cria o cliente com service role key
  // O service role automaticamente bypassa o RLS no Supabase
  cachedClient = createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  return cachedClient
}
