'use client'

import { useState, useEffect } from 'react'
import DeleteButton from './DeleteButton'

interface Gift {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  totalValue: number
  totalReceived: number
  remaining: number
  progress: number
  quotaTotal: number | null
  status: string
  _count: {
    contributions: number
  }
}

export const dynamic = 'force-dynamic'

export default function GiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGifts()
  }, [])

  async function fetchGifts() {
    try {
      const res = await fetch('/api/admin/gifts')
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar presentes')
      }
      
      setGifts(data.gifts || [])
    } catch (err) {
      console.error('Gifts error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar presentes')
    } finally {
      setLoading(false)
    }
  }

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
        <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar presentes</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(''); fetchGifts() }}
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
        <h1 className="text-2xl font-serif text-gray-800">Gerenciar Presentes</h1>
        <a 
          href="/admin/dashboard/gifts/new"
          className="btn-premium py-2 px-4 rounded-lg text-sm"
        >
          + Novo Presente
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-yellow-50 border-b border-yellow-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Presente</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Valor</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Cotas</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Arrecadado</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Contribuições</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-50">
            {gifts.map((gift) => (
              <tr key={gift.id} className="hover:bg-yellow-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {gift.imageUrl ? (
                      <img 
                        src={gift.imageUrl} 
                        alt={gift.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🎁</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-800">{gift.title}</h3>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {gift.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-800">
                    R$ {Number(gift.totalValue).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="font-medium text-gray-800">{gift.quotaTotal || 1}</span>
                    <p className="text-xs text-gray-400">
                      Cota: R${' '}
                      {(() => {
                        const qt = Number(gift.quotaTotal || 1)
                        const totalCents = Math.round(Number(gift.totalValue) * 100)
                        if (qt <= 0 || totalCents % qt !== 0) return '-'
                        return (totalCents / qt / 100).toFixed(2)
                      })()}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="font-medium text-green-700">
                      R$ {Number(gift.totalReceived || 0).toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-400">
                      Restante: R$ {Number(gift.remaining || 0).toFixed(2)}
                    </p>
                    <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, Number(gift.progress || 0)))}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    gift.status === 'available' 
                      ? 'bg-green-100 text-green-700'
                      : gift.status === 'fulfilled'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {gift.status === 'available' && 'Disponível'}
                    {gift.status === 'fulfilled' && 'Completo'}
                    {gift.status === 'hidden' && 'Oculto'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{gift._count.contributions}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/admin/dashboard/gifts/${gift.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      ✏️
                    </a>
                    <DeleteButton giftId={gift.id} />
                  </div>
                </td>
              </tr>
            ))}
            {gifts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="text-4xl mb-2">🎁</div>
                  <p>Nenhum presente cadastrado</p>
                  <a 
                    href="/admin/dashboard/gifts/new"
                    className="text-yellow-600 hover:underline mt-2 inline-block"
                  >
                    Adicionar primeiro presente
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
