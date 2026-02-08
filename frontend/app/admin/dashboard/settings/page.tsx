'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

interface EventData {
  id?: string
  coupleNames: string
  date: string
  venue: string
  venueMapsUrl: string
  description: string
  pixKey: string
  pixKeyType: string
  mpConfig?: {
    accessToken?: string
    publicKey?: string
  }
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [eventData, setEventData] = useState<EventData>({
    coupleNames: '',
    date: '',
    venue: '',
    venueMapsUrl: '',
    description: '',
    pixKey: '',
    pixKeyType: '',
    mpConfig: {}
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      // Carrega dados do evento
      const eventRes = await fetch('/api/event')
      if (eventRes.ok) {
        const event = await eventRes.json()
        setEventData(prev => ({
          ...prev,
          coupleNames: event.coupleNames || '',
          date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
          venue: event.venue || '',
          venueMapsUrl: event.venueMapsUrl || '',
          description: event.description || '',
        }))
      }

      // Carrega configurações de pagamento separadamente
      const paymentRes = await fetch('/api/admin/settings/payment')
      if (paymentRes.ok) {
        const payment = await paymentRes.json()
        setEventData(prev => ({
          ...prev,
          pixKey: payment.pixKey || '',
          pixKeyType: payment.pixKeyType || '',
          mpConfig: payment.mpConfig || {}
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleEventSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('coupleNames', eventData.coupleNames)
      formData.append('date', eventData.date)
      formData.append('venue', eventData.venue)
      formData.append('venueMapsUrl', eventData.venueMapsUrl)
      formData.append('description', eventData.description)

      const res = await fetch('/api/admin/settings/event', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Dados do evento salvos com sucesso!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar dados do evento' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar dados do evento' })
    } finally {
      setSaving(false)
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('pixKey', eventData.pixKey)
      formData.append('pixKeyType', eventData.pixKeyType)
      formData.append('mpAccessToken', eventData.mpConfig?.accessToken || '')
      formData.append('mpPublicKey', eventData.mpConfig?.publicKey || '')

      const res = await fetch('/api/admin/settings/payment', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Configurações de pagamento salvas com sucesso!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar configurações de pagamento' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações de pagamento' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Configurações</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dados do Evento</h2>
          
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Casal
              </label>
              <input
                type="text"
                value={eventData.coupleNames}
                onChange={(e) => setEventData({ ...eventData, coupleNames: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                placeholder="Ex: Raiana & Raphael"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Casamento
              </label>
              <input
                type="datetime-local"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local
              </label>
              <input
                type="text"
                value={eventData.venue}
                onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                placeholder="Ex: Rancho do Coutinho"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Google Maps
              </label>
              <input
                type="url"
                value={eventData.venueMapsUrl}
                onChange={(e) => setEventData({ ...eventData, venueMapsUrl: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 resize-none"
                placeholder="Descrição do evento..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-premium w-full py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Dados do Evento'}
            </button>
          </form>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Pagamento</h2>
          
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave PIX
              </label>
              <input
                type="text"
                value={eventData.pixKey}
                onChange={(e) => setEventData({ ...eventData, pixKey: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                placeholder="CPF, Email ou Chave Aleatória"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo da Chave PIX
              </label>
              <select
                value={eventData.pixKeyType}
                onChange={(e) => setEventData({ ...eventData, pixKeyType: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              >
                <option value="">Selecione...</option>
                <option value="CPF">CPF</option>
                <option value="EMAIL">Email</option>
                <option value="PHONE">Telefone</option>
                <option value="RANDOM">Chave Aleatória</option>
              </select>
            </div>

            <div className="pt-4 border-t border-yellow-100">
              <h3 className="font-medium text-gray-800 mb-2">Mercado Pago (Opcional)</h3>
              <p className="text-sm text-gray-500 mb-4">
                Configure o Mercado Pago para receber pagamentos automáticos via PIX e cartão.
                <a 
                  href="https://www.mercadopago.com.br/developers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:text-yellow-700 ml-1"
                >
                  Saiba mais →
                </a>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={eventData.mpConfig?.accessToken || ''}
                    onChange={(e) => setEventData({ 
                      ...eventData, 
                      mpConfig: { ...eventData.mpConfig, accessToken: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                    placeholder="APP_USR-..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Encontre em: Mercado Pago → Desenvolvedores → Credenciais
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Key
                  </label>
                  <input
                    type="text"
                    value={eventData.mpConfig?.publicKey || ''}
                    onChange={(e) => setEventData({ 
                      ...eventData, 
                      mpConfig: { ...eventData.mpConfig, publicKey: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                    placeholder="APP_USR-..."
                  />
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Webhook Configurado</p>
                  <p className="text-yellow-600">
                    URL: <code className="bg-yellow-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_APP_URL || 'https://seusite.com'}/api/payments/webhook</code>
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-premium w-full py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações de Pagamento'}
            </button>
          </form>
        </div>
      </div>

      {/* Admin Info */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações de Acesso</h2>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Usuário:</strong> {process.env.NEXT_PUBLIC_ADMIN_USER || 'Configurado nas variáveis de ambiente'}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Para alterar a senha, modifique as variáveis de ambiente 
            <code className="bg-yellow-100 px-2 py-1 rounded mx-1">ADMIN_USER</code> e 
            <code className="bg-yellow-100 px-2 py-1 rounded mx-1">ADMIN_PASSWORD</code>
          </p>
        </div>
      </div>
    </div>
  )
}
