import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')?.value
  const hasValidToken = adminToken === 'authenticated'
  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin/dashboard')
  const isLoginRoute = pathname === '/admin/login'
  const debug = process.env.NODE_ENV !== 'production'

  if (debug) {
    console.log('[Middleware]', { pathname, hasToken: hasValidToken, isAdminRoute, isLoginRoute })
  }

  // Se tentar acessar dashboard sem token, redireciona para login
  if (isAdminRoute && !hasValidToken) {
    if (debug) console.log('[Middleware] Redirecting to login (no token)')
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Se já está logado e tenta acessar login, redireciona para dashboard
  if (isLoginRoute && hasValidToken) {
    if (debug) console.log('[Middleware] Redirecting to dashboard (has token)')
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
