import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[Supabase Admin] Service role key not configured. Admin operations may fail if RLS is enabled.')
}

// Placeholder values allow the module to load at build time without crashing.
// The client is only used when isVercel=true (i.e. SUPABASE_SERVICE_ROLE_KEY is set).
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key-for-build',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
