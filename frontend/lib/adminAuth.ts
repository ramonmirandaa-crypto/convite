import { NextRequest, NextResponse } from 'next/server'

export function adminAuth(request: NextRequest): { success: boolean; response?: NextResponse } {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    const response = NextResponse.json(
      { error: 'Autenticação necessária' },
      { 
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin"'
        }
      }
    )
    return { success: false, response }
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString()
  const [username, password] = credentials.split(':')

  const adminUser = process.env.ADMIN_USER || 'admin'
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123'

  if (username !== adminUser || password !== adminPass) {
    const response = NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 403 }
    )
    return { success: false, response }
  }

  return { success: true }
}
