// API interna - usa rotas relativas para Serverless Functions
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    // Desabilitar cache para sempre buscar dados atualizados
    cache: 'no-store',
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro de conexão com o servidor' }))
    throw new Error(error.error || `Erro ${res.status}`)
  }

  return res.json()
}

// RSVP
export function createRSVP(data: {
  name: string
  email: string
  phone?: string
  guestCount: number
  dietaryRestrictions?: string
  message?: string
}) {
  return request('/rsvp', { method: 'POST', body: JSON.stringify(data) })
}

// Gifts
export function listGifts() {
  return request<{ gifts: Gift[] }>('/gifts')
}

export function reserveGift(id: string, data: { name: string; email: string }) {
  return request(`/gifts/${id}/reserve`, { method: 'POST', body: JSON.stringify(data) })
}

// Contact
export function sendContact(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  return request('/contact', { method: 'POST', body: JSON.stringify(data) })
}

// Event
export function getEvent() {
  return request<EventData>('/event')
}

// Payments
export function createPayment(data: {
  giftId: string
  amount: number
  payerName: string
  payerEmail: string
  payerCPF: string
  payerPhone?: string
  message?: string
  isAnonymous?: boolean
  paymentMethod: 'pix' | 'credit_card'
  cardToken?: string
  installments?: number
  paymentMethodId?: string
  issuerId?: string
}) {
  return request('/payments/create', { method: 'POST', body: JSON.stringify(data) })
}

export function getPaymentStatus(id: string) {
  return request(`/payments/status/${id}`)
}

// Types
export interface EventData {
  id: string
  coupleNames: string
  date: string
  venue: string
  venueMapsUrl: string | null
  description: string | null
  guestCount: number
  giftCount: number
}

export interface Gift {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  totalValue: number
  status: string
  progress: number
  remaining: number
  totalReceived?: number
}
