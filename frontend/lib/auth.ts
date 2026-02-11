import { cookies } from 'next/headers'

const ADMIN_TOKEN = 'admin_token'

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.has(ADMIN_TOKEN)
}

export async function setAdminToken() {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_TOKEN, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/'
  })
}

export async function removeAdminToken() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_TOKEN)
}
