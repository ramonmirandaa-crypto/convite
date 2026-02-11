'use client'

import { useEffect, useState } from 'react'
import { getEvent, EventData } from '@/lib/api'
import Link from 'next/link'
import { PageLayout, PageContainer, Card } from '../components/PageLayout'
import { FloralDivider, FloralCorner, RedRose, OrangeFlower, YellowFlower } from '../components/FloralElements'

// Componente de contador simples
function SimpleCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const weddingDate = new Date(targetDate)
    
    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = weddingDate.getTime() - now.getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    
    return () => clearInterval(timer)
  }, [targetDate])

  const timeBlocks = [
    { value: timeLeft.days, label: 'Dias' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ]

  return (
    <div className="flex justify-center gap-3 md:gap-6">
      {timeBlocks.map((block, index) => (
        <div key={index} className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl border border-[#D4653C]/20 bg-white/80 backdrop-blur-sm flex items-center justify-center mb-2">
            <span className="text-xl md:text-2xl font-serif text-[#B8333C]">
              {String(block.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-[#6B5D4D] uppercase tracking-wider font-serif">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  )
}

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
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4653C] mx-auto mb-4" />
            <p className="text-[#6B5D4D] font-serif">Carregando...</p>
          </div>
        </div>
      </PageLayout>
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
    <PageLayout hideFooter>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Decorative corners */}
        <div className="absolute top-4 left-4 opacity-40">
          <FloralCorner position="top-left" />
        </div>
        <div className="absolute top-4 right-4 opacity-40">
          <FloralCorner position="top-right" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-40">
          <FloralCorner position="bottom-left" />
        </div>
        <div className="absolute bottom-4 right-4 opacity-40">
          <FloralCorner position="bottom-right" />
        </div>

        {/* Elementos florais flutuantes */}
        <div className="absolute top-20 left-[10%] float opacity-30">
          <RedRose size={60} />
        </div>
        <div className="absolute top-32 right-[15%] float-slow opacity-25">
          <OrangeFlower size={50} />
        </div>
        <div className="absolute bottom-40 left-[8%] float-slow opacity-30">
          <YellowFlower size={45} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="text-[#D4653C] text-sm uppercase tracking-[0.3em] mb-4 font-serif">
            Juntos para sempre
          </p>

          <h1 className="text-5xl sm:text-7xl font-serif mb-6 text-gradient-warm">
            {currentEvent.coupleNames}
          </h1>

          <FloralDivider />

          <p className="text-xl text-[#6B5D4D] max-w-2xl mx-auto leading-relaxed font-serif mt-6">
            {currentEvent.description}
          </p>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-16 px-4 bg-[#FFFCF8]">
        <PageContainer>
          <div className="text-center">
            <h2 className="text-3xl font-serif text-[#3D3429] mb-2">Faltam apenas</h2>
            <FloralDivider />
            <div className="my-8">
              <SimpleCountdown targetDate={currentEvent.date} />
            </div>
            <FloralDivider />
          </div>
        </PageContainer>
      </section>

      {/* Event Details */}
      <section className="py-16 px-4">
        <PageContainer>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Date & Time Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4653C]/10 to-transparent rounded-bl-full" />
              <div className="p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#F8F4ED] rounded-full flex items-center justify-center border border-[#D4653C]/10">
                    <svg className="w-6 h-6 text-[#D4653C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-[#3D3429]">Data & Horário</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#9B8B7A] uppercase tracking-wider font-serif">Quando</p>
                    <p className="text-xl text-[#3D3429] capitalize font-serif">{formatDate(currentEvent.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9B8B7A] uppercase tracking-wider font-serif">Horário</p>
                    <p className="text-xl text-[#3D3429] font-serif">{formatTime(currentEvent.date)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Venue Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E8B84A]/10 to-transparent rounded-bl-full" />
              <div className="p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#F8F4ED] rounded-full flex items-center justify-center border border-[#D4653C]/10">
                    <svg className="w-6 h-6 text-[#E8B84A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif text-[#3D3429]">Local</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#9B8B7A] uppercase tracking-wider font-serif">Onde</p>
                    <p className="text-xl text-[#3D3429] font-serif">{currentEvent.venue}</p>
                  </div>
                  
                  <a
                    href={currentEvent.venueMapsUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#D4653C] hover:text-[#B8333C] font-medium transition-colors font-serif"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                    </svg>
                    Ver no Google Maps
                  </a>
                </div>
              </div>
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
                <div className="p-6">
                  <span className="text-3xl mb-2 block">{stat.icon}</span>
                  <p className="text-3xl font-serif text-[#D4653C] font-bold">{stat.value}</p>
                  <p className="text-sm text-[#6B5D4D] font-serif">{stat.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#F8F4ED] to-[#FDF9F3]">
        <PageContainer>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <RedRose size={50} />
            </div>
            <h2 className="text-3xl font-serif text-[#3D3429] mb-4">
              Esperamos você!
            </h2>
            <p className="text-[#6B5D4D] mb-8 max-w-2xl mx-auto font-serif">
              Sua presença é muito importante para nós. Confirme sua presença e faça parte deste momento especial.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/rsvp" className="btn-premium">
                ✉️ Confirmar Presença
              </Link>
              <Link href="/gifts" className="px-8 py-4 rounded-full border-2 border-[#D4653C] text-[#D4653C] hover:bg-[#D4653C]/5 transition-all duration-300 font-serif">
                🎁 Ver Lista de Presentes
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Navigation */}
      <section className="py-8 px-4 border-t border-[#D4653C]/10">
        <PageContainer>
          <div className="flex justify-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[#6B5D4D] hover:text-[#D4653C] transition-colors font-serif"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar ao Início</span>
            </Link>
          </div>
        </PageContainer>
      </section>
    </PageLayout>
  )
}
