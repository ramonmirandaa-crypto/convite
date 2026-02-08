import { NextResponse } from 'next/server'
import { removeAdminToken } from '@/lib/auth'

export async function POST() {
  removeAdminToken()
  return NextResponse.json({ success: true })
}
