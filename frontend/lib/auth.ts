import { cookies } from 'next/headers'

const ADMIN_TOKEN = 'admin_token'

export function isAuthenticated(): boolean {
  const cookieStore = cookies()
  return cookieStore.has(ADMIN_TOKEN)
}

export function setAdminToken() {
  cookies().set(ADMIN_TOKEN, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/'
  })
}

export function removeAdminToken() {
  cookies().delete(ADMIN_TOKEN)
}
