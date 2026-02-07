'use client'

import { useEffect, useState } from 'react'
import { listGifts, reserveGift, Gift } from '../../lib/api'

export default function Gifts() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadGifts()
  }, [])

  async function loadGifts() {
    try {
      const data = await listGifts()
      setGifts(data.gifts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar presentes')
    } finally {
      setLoading(false)
    }
  }

  async function handleReserve(id: string) {
    try {
      await reserveGift(id)
      await loadGifts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reservar presente')
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <h1 className="text-5xl font-bold mb-6 text-primary-600 text-center">
          Lista de Presentes
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-lg text-gray-700 mb-8 text-center">
            Escolha um presente para nos presentear neste momento especial
          </p>

          {loading && (
            <p className="text-center text-gray-500">Carregando presentes...</p>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}

          {!loading && !error && gifts.length === 0 && (
            <p className="text-center text-gray-500">Nenhum presente cadastrado ainda.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gifts.map((gift) => (
              <div
                key={gift.id}
                className={`border rounded-lg p-6 ${
                  gift.status !== 'available'
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-primary-200 hover:border-primary-500'
                }`}
              >
                <h3 className="text-xl font-semibold mb-2">{gift.title}</h3>
                {gift.description && (
                  <p className="text-sm text-gray-500 mb-2">{gift.description}</p>
                )}
                <p className="text-lg text-gray-600 mb-2">{formatCurrency(gift.totalValue)}</p>

                {gift.progress > 0 && (
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, gift.progress)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(gift.progress)}% arrecadado</p>
                  </div>
                )}

                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    gift.status === 'fulfilled'
                      ? 'bg-blue-100 text-blue-700'
                      : gift.status !== 'available'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {gift.status === 'available' ? 'Disponível' : gift.status === 'fulfilled' ? 'Completo' : 'Reservado'}
                </span>
                {gift.status === 'available' && (
                  <button
                    onClick={() => handleReserve(gift.id)}
                    className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Reservar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <a
          href="/"
          className="inline-block mt-8 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Voltar ao Início
        </a>
      </div>
    </main>
  )
}
