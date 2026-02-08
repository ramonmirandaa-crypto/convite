import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {
    database: false,
    databaseType: null as 'prisma' | 'supabase' | null,
    env: {
      hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      hasDirectUrl: !!process.env.POSTGRES_URL_NON_POOLING,
      hasAdminUser: !!process.env.ADMIN_USER,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    error: null as string | null
  }

  // Tenta Prisma primeiro
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
    checks.databaseType = 'prisma'
    return NextResponse.json(checks, { status: 200 })
  } catch (prismaError) {
    console.log('Prisma connection failed, trying Supabase...')
    checks.error = prismaError instanceof Error ? prismaError.message : 'Prisma error'
  }

  // Fallback para Supabase
  try {
    const { data, error } = await supabase.from('events').select('id').limit(1)
    if (error) throw error
    checks.database = true
    checks.databaseType = 'supabase'
    checks.error = null
    return NextResponse.json(checks, { status: 200 })
  } catch (supabaseError) {
    console.error('Supabase connection failed:', supabaseError)
    checks.error = supabaseError instanceof Error 
      ? `Prisma: ${checks.error} | Supabase: ${supabaseError.message}` 
      : 'Both Prisma and Supabase failed'
  }

  return NextResponse.json(checks, { status: 503 })
}
