'use client'

import { useEffect, useState } from 'react'
import { listGifts, reserveGift, Gift } from '@/lib/api'
import { GiftCard } from '@/components/GiftCard'
import { Button } from '@/components/ui/Button'
import { FloralDivider } from '@/components/FloralDecoration'

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

  async function handleReserve(id: string, name: string, email: string) {
    await reserveGift(id, { name, email })
  }

  const availableCount = gifts.filter(g => g.status === 'available').length
  const fulfilledCount = gifts.filter(g => g.status === 'fulfilled').length

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-rose-50">
      {/* Header */}
      <section className="pt-16 pb-8 px-4 text-center">
        <p className="text-rose-500 text-lg tracking-widest uppercase mb-4">
          Lista de Presentes
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          Presentes dos Noivos
        </h1>
        <FloralDivider />
        <p className="text-gray-600 max-w-2xl mx-auto">
          Sua presença é nosso maior presente! Mas se quiser nos presentear, 
          preparamos uma lista com itens que vão nos ajudar a construir nosso novo lar.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-500">{availableCount}</p>
            <p className="text-sm text-gray-600">Disponíveis</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-rose-500">{fulfilledCount}</p>
            <p className="text-sm text-gray-600">Arrecadados</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{gifts.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
      </section>

      {/* Gifts Grid */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadGifts}
                className="mt-4 text-rose-500 hover:text-rose-600 font-medium"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && gifts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600">Nenhum presente cadastrado ainda.</p>
            </div>
          )}

          {!loading && !error && gifts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onReserve={handleReserve}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pix Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-rose-100 to-amber-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Prefere contribuir com PIX?
          </h2>
          <p className="text-gray-600 mb-6">
            Você também pode nos presentear através de uma contribuição via PIX. 
            Qualquer valor será muito bem-vindo!
          </p>
          <Button variant="secondary" icon="💳">
            Ver Dados Bancários
          </Button>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex justify-center">
          <Button href="/" variant="ghost" icon="←">
            Voltar ao Início
          </Button>
        </div>
      </section>
    </main>
  )
}
