import { NextResponse } from 'next/server'

// GET /api/health - Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API está funcionando'
  })
}
