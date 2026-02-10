'use client'

import { useState, useEffect } from 'react'
import DeleteButton from './DeleteButton'

interface Guest {
  id: string
  name: string
  email: string
  phone: string | null
  confirmed: boolean
  guestCount: number
  dietaryRestrictions: string | null
  suggestedSong: string | null
  qrCodeToken: string
  _count: {
    contributions: number
  }
}

export const dynamic = 'force-dynamic'

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGuests()
  }, [])

  async function fetchGuests() {
    try {
      const res = await fetch('/api/admin/guests')
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar convidados')
      }
      
      setGuests(data.guests || [])
    } catch (err) {
      console.error('Guests error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar convidados')
    } finally {
      setLoading(false)
    }
  }

  const confirmedCount = guests.filter(g => g.confirmed).length
  const totalGuests = guests.reduce((sum, g) => sum + (g.confirmed ? g.guestCount : 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar convidados</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(''); fetchGuests() }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-800">Gerenciar Convidados</h1>
        <a 
          href="/admin/dashboard/guests/new"
          className="btn-premium py-2 px-4 rounded-lg text-sm"
        >
          + Novo Convidado
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4">
          <p className="text-sm text-gray-500">Total Cadastrados</p>
          <p className="text-2xl font-bold text-gray-800">{guests.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4">
          <p className="text-sm text-gray-500">Confirmados</p>
          <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4">
          <p className="text-sm text-gray-500">Total de Pessoas</p>
          <p className="text-2xl font-bold text-blue-600">{totalGuests}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-yellow-50 border-b border-yellow-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Convidado</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Contato</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Confirmado</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Acompanhantes</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-50">
            {guests.map((guest) => (
              <tr key={guest.id} className="hover:bg-yellow-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      guest.confirmed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <span className="text-lg">
                        {guest.confirmed ? '✅' : '⏳'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{guest.name}</h3>
                      {guest.dietaryRestrictions && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          🍽️ {guest.dietaryRestrictions}
                        </p>
                      )}
                      {guest.suggestedSong && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          🎵 {guest.suggestedSong}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">{guest.email}</p>
                  {guest.phone && (
                    <p className="text-sm text-gray-500">{guest.phone}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    guest.confirmed 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {guest.confirmed ? 'Sim' : 'Pendente'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-medium text-gray-800">
                    {guest.confirmed ? guest.guestCount : '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a 
                      href={`/api/rsvp/qr/${guest.qrCodeToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Ver QR Code"
                    >
                      📱
                    </a>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                      ✏️
                    </button>
                    <DeleteButton guestId={guest.id} />
                  </div>
                </td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="text-4xl mb-2">👥</div>
                  <p>Nenhum convidado cadastrado</p>
                  <a 
                    href="/admin/dashboard/guests/new"
                    className="text-yellow-600 hover:underline mt-2 inline-block"
                  >
                    Adicionar primeiro convidado
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
