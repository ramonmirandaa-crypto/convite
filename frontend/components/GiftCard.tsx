'use client'

import { useState } from 'react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Gift } from '../lib/api'

interface GiftCardProps {
  gift: Gift
  onReserve: (id: string, name: string, email: string) => Promise<void>
}

export function GiftCard({ gift, onReserve }: GiftCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onReserve(gift.id, name, email)
      setShowModal(false)
      setName('')
      setEmail('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getStatusConfig = () => {
    switch (gift.status) {
      case 'fulfilled':
        return {
          label: 'Arrecadado',
          className: 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white',
          icon: '✓',
        }
      case 'hidden':
        return {
          label: 'Reservado',
          className: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
          icon: '🔒',
        }
      default:
        return {
          label: 'Disponível',
          className: 'bg-gradient-to-r from-rose-400 to-rose-600 text-white',
          icon: '✦',
        }
    }
  }

  const status = getStatusConfig()
  const isAvailable = gift.status === 'available'

  return (
    <>
      <Card className="relative overflow-hidden group">
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.className}`}>
          <span>{status.icon}</span>
          {status.label}
        </div>

        <CardContent className="pt-8">
          {/* Image placeholder or actual image */}
          <div className="aspect-video bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl mb-4 flex items-center justify-center">
            {gift.imageUrl ? (
              <img
                src={gift.imageUrl}
                alt={gift.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <svg className="w-16 h-16 text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">{gift.title}</h3>
          
          {gift.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{gift.description}</p>
          )}

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-rose-600">
              {formatCurrency(gift.totalValue)}
            </span>
          </div>

          {/* Progress bar */}
          {gift.progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Arrecadado</span>
                <span>{Math.round(gift.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-400 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, gift.progress)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(gift.totalValue - (gift.remaining || 0))} de {formatCurrency(gift.totalValue)}
              </p>
            </div>
          )}

          {isAvailable && (
            <Button
              onClick={() => setShowModal(true)}
              className="w-full"
              icon="🎁"
            >
              Reservar Presente
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Reservar Presente
              </h3>
              <p className="text-center text-gray-600 mb-6">
                Você está reservando: <strong>{gift.title}</strong>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all outline-none"
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seu Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all outline-none"
                    placeholder="Digite seu email"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Reservando...' : 'Confirmar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
