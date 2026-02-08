'use client'

import { useEffect, useState } from 'react'
import { getEvent, EventData } from '../../lib/api'
import { Countdown } from '@/components/Countdown'
import { FloralDivider, FloralCorner, HeartDecoration } from '@/components/FloralDecoration'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

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
      weekday: 'long',
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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </main>
    )
  }

  const defaultEvent = {
    coupleNames: 'Raiana & Raphael',
    date: '2026-05-16T12:00:00',
    venue: 'Rancho do Coutinho, Estrada Sao Jose do Turvo, 2195',
    venueMapsUrl: 'https://maps.google.com/?q=Estr.+de+São+José+do+Turvo+-+São+Luiz+da+Barra,+Barra+do+Piraí+-+RJ,+27165-971',
    description: 'Com grande alegria, convidamos você para celebrar conosco este momento especial.',
  }

  const currentEvent = event || defaultEvent

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Decorative corners */}
        <FloralCorner position="top-left" />
        <FloralCorner position="top-right" />
        <FloralCorner position="bottom-left" />
        <FloralCorner position="bottom-right" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="text-rose-500 text-lg tracking-widest uppercase mb-4">
            Juntos para sempre
          </p>

          <h1 className="text-5xl sm:text-7xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">
              {currentEvent.coupleNames}
            </span>
          </h1>

          <FloralDivider />

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {currentEvent.description}
          </p>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Faltam apenas</h2>
          <FloralDivider />
          <Countdown targetDate={currentEvent.date} />
          <FloralDivider />
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Date & Time Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100 to-transparent rounded-bl-full" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Data & Horário</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Quando</p>
                    <p className="text-xl text-gray-800 capitalize">{formatDate(currentEvent.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Horário</p>
                    <p className="text-xl text-gray-800">{formatTime(currentEvent.date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-transparent rounded-bl-full" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Local</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Onde</p>
                    <p className="text-xl text-gray-800">{currentEvent.venue}</p>
                  </div>
                  
                  <a
                    href={currentEvent.venueMapsUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-600 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                    </svg>
                    Ver no Google Maps
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Convidados', value: event?.guestCount || 0, icon: '👥' },
              { label: 'Presentes', value: event?.giftCount || 0, icon: '🎁' },
              { label: 'Meses', value: '6+', icon: '📅' },
              { label: 'Anos Juntos', value: '3', icon: '💕' },
            ].map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-6">
                  <span className="text-3xl mb-2 block">{stat.icon}</span>
                  <p className="text-3xl font-bold text-rose-500">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-rose-100 to-amber-100">
        <div className="max-w-4xl mx-auto text-center">
          <HeartDecoration className="w-8 h-8 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Esperamos você!
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Sua presença é muito importante para nós. Confirme sua presença e faça parte deste momento especial.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/rsvp" size="lg" icon="✉️">
              Confirmar Presença
            </Button>
            <Button href="/gifts" variant="secondary" size="lg" icon="🎁">
              Ver Lista de Presentes
            </Button>
          </div>
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
