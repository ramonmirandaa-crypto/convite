import { NextRequest, NextResponse } from 'next/server'

// Verifica autenticação por cookie (usado nas rotas de API)
export function adminAuth(request: NextRequest): { success: boolean; response?: NextResponse } {
  // Tenta cookie primeiro
  const adminToken = request.cookies.get('admin_token')?.value
  
  if (adminToken === 'authenticated') {
    return { success: true }
  }

  // Fallback para Basic Auth (para compatibilidade)
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Basic ')) {
    const credentials = Buffer.from(authHeader.slice(6), 'base64').toString()
    const [username, password] = credentials.split(':')

    const adminUser = process.env.ADMIN_USER || 'admin'
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123'

    if (username === adminUser && password === adminPass) {
      return { success: true }
    }
  }

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

// Verifica apenas o cookie (para uso em páginas)
export function checkAdminCookie(request: NextRequest): boolean {
  const adminToken = request.cookies.get('admin_token')?.value
  return adminToken === 'authenticated'
}
