'use client'

import { useEffect, useState } from 'react'
import { getEvent, EventData } from '../../lib/api'

export default function Welcome() {
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvent()
      .then(setEvent)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : event ? (
          <>
            <h1 className="text-5xl font-bold mb-6 text-primary-600">
              {event.coupleNames}
            </h1>
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
              <p className="text-xl text-gray-700 mb-4">
                {event.description || 'Com grande alegria, convidamos você para celebrar conosco este momento especial'}
              </p>
              <div className="mt-8 space-y-4">
                <p className="text-lg">
                  <strong>Data:</strong> {formatDate(event.date)}
                </p>
                <p className="text-lg">
                  <strong>Horário:</strong> {formatTime(event.date)}
                </p>
                <p className="text-lg">
                  <strong>Local:</strong> {event.venue}
                </p>
                {event.venueMapsUrl && (
                  <a
                    href={event.venueMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-primary-600 hover:text-primary-700 underline"
                  >
                    Ver no Google Maps
                  </a>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-5xl font-bold mb-6 text-primary-600">
              Bem-vindos ao Nosso Casamento
            </h1>
            <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
              <p className="text-xl text-gray-700">
                Evento ainda não configurado.
              </p>
            </div>
          </>
        )}
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
