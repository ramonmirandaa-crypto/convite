import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] URL or Anon Key not configured. Supabase features will be unavailable.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key-for-build'
)

// Função para testar a conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('events').select('count').single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}
