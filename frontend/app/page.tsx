'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getEvent, EventData } from '@/lib/api'
import { useCouplePhotos, useGalleryPhotos } from '@/lib/usePhotos'

// Componente de contador regressivo
function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
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

  if (!mounted) {
    return (
      <div className="flex justify-center gap-4 md:gap-8">
        {['Dias', 'Horas', 'Minutos', 'Segundos'].map((label) => (
          <div key={label} className="text-center">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl border-2 border-yellow-400 flex items-center justify-center mb-2">
              <span className="text-2xl md:text-4xl font-bold text-yellow-700">--</span>
            </div>
            <span className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    )
  }

  const timeBlocks = [
    { value: timeLeft.days, label: 'Dias' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Minutos' },
    { value: timeLeft.seconds, label: 'Segundos' },
  ]

  return (
    <div className="flex justify-center gap-3 md:gap-6">
      {timeBlocks.map((block, index) => (
        <div key={index} className="text-center">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl border-2 border-yellow-400 flex items-center justify-center mb-2 shadow-lg shadow-yellow-200/50">
            <span className="text-2xl md:text-4xl font-bold text-yellow-700">
              {String(block.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// Hero Section com foto e nomes lado a lado
function HeroSection({ eventDate }: { eventDate: string }) {
  const { photos: couplePhotos, loading } = useCouplePhotos(5)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  // Fotos padrão de fallback (hardcoded caso não tenha no painel)
  const fallbackPhotos = [
    '/images/IMG_0544.png',
    '/images/IMG_0548.jpeg',
    '/images/IMG_0549.jpeg',
    '/images/IMG_0550.jpeg',
  ]

  // Usa fotos do painel ou fallback
  const mainPhotos = couplePhotos.length > 0 
    ? couplePhotos.map(p => p.imageUrl)
    : fallbackPhotos

  useEffect(() => {
    if (mainPhotos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhoto((prev) => (prev + 1) % mainPhotos.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [mainPhotos.length])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-yellow-50/30 to-[#FDF8F3]">
      {/* Círculos decorativos dourados */}
      <div className="absolute top-20 left-10 w-32 h-32 border border-yellow-300/50 rounded-full opacity-50" />
      <div className="absolute bottom-40 right-20 w-48 h-48 border border-yellow-300/30 rounded-full opacity-30" />
      <div className="absolute top-1/3 right-10 w-24 h-24 bg-yellow-200/20 rounded-full blur-xl" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-20 pb-10">
        {/* Data */}
        <p className="text-yellow-600 text-sm md:text-base uppercase tracking-[0.3em] mb-8 text-center fade-in-up">
          {formatDate(eventDate)}
        </p>

        {/* Layout Principal: Foto e Nomes Lado a Lado */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mb-12">
          
          {/* Foto dos noivos - Lado Esquerdo */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex-shrink-0 fade-in-up fade-in-up-delay-1">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 p-1">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                {!loading && (
                  <Image
                    src={mainPhotos[currentPhoto]}
                    alt="Raiana e Raphael"
                    fill
                    className="object-cover transition-opacity duration-1000"
                    priority
                  />
                )}
              </div>
            </div>
            {/* Brilho ao redor */}
            <div className="absolute -inset-4 bg-yellow-400/20 rounded-full blur-2xl -z-10" />
            
            {/* Indicadores de foto */}
            {mainPhotos.length > 1 && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {mainPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhoto(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPhoto 
                        ? 'bg-yellow-500 w-6' 
                        : 'bg-yellow-300 hover:bg-yellow-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Nomes - Lado Direito */}
          <div className="text-center lg:text-left fade-in-up fade-in-up-delay-2">
            <h1 className="flex flex-col lg:items-start">
              <span className="text-5xl md:text-6xl lg:text-8xl font-serif text-gradient-gold mb-2">
                Raiana
              </span>
              <span className="text-3xl md:text-4xl lg:text-5xl font-serif text-yellow-600/60 italic my-1 lg:my-2">
                &
              </span>
              <span className="text-5xl md:text-6xl lg:text-8xl font-serif text-gradient-gold">
                Raphael
              </span>
            </h1>
            
            {/* Frase */}
            <p className="text-lg md:text-xl text-gray-600 max-w-md mt-6 font-light italic">
              &ldquo;Duas almas, um só coração. Um amor que transcende o tempo.&rdquo;
            </p>
          </div>
        </div>

        {/* Contador */}
        <div className="mb-10 fade-in-up fade-in-up-delay-3">
          <p className="text-yellow-600/80 text-sm uppercase tracking-widest mb-6 text-center">
            Faltam apenas
          </p>
          <Countdown targetDate={eventDate} />
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up fade-in-up-delay-4">
          <Link href="/rsvp" className="btn-premium">
            Confirmar Presença
          </Link>
          <Link href="/gifts" className="px-8 py-4 rounded-full border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50 transition-all duration-300 font-medium">
            Lista de Presentes
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}

// Seção com fotos em grid - usando fotos do painel
function PhotosSection() {
  const { photos: galleryPhotos, loading } = useGalleryPhotos(4)

  // Fotos padrão de fallback
  const fallbackPhotos = [
    { src: '/images/5e17a544-5f8d-4169-b912-6ac1de30787f.jpeg', title: 'Amor' },
    { src: '/images/603d0296-8ce6-47ba-8576-05bda785aa80.jpeg', title: 'Carinho' },
    { src: '/images/67695956-b0e1-4c97-a7ba-f37006a2a9ab.jpeg', title: 'Ternura' },
    { src: '/images/9a046fed-3acc-41c3-902e-d7e5f17fc680.jpeg', title: 'Paixão' },
  ]

  const photos = galleryPhotos.length > 0
    ? galleryPhotos.map(p => ({ src: p.imageUrl, title: p.title }))
    : fallbackPhotos

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-yellow-600 text-sm uppercase tracking-[0.3em] mb-4">Nossa História</p>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-800">Momentos Inesquecíveis</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-medium">{photo.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/gallery" className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors">
            <span>Ver Todas as Fotos</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Seção da História
function StorySection() {
  const { photos: couplePhotos } = useCouplePhotos(1)
  const storyImage = couplePhotos.length > 0 
    ? couplePhotos[0].imageUrl 
    : '/images/IMG_0549.jpeg'

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white to-yellow-50/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={storyImage}
                alt="Raiana e Raphael"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border-2 border-yellow-400 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-yellow-200/50 rounded-2xl -z-10" />
          </div>

          <div className="space-y-6">
            <p className="text-yellow-600 text-sm uppercase tracking-[0.3em]">Nossa História</p>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800 leading-tight">
              Um Amor que <span className="text-gradient-gold">Cresce</span> a Cada Dia
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Em meio às incertezas da vida, encontramos um no outro a certeza do amor verdadeiro. 
              Cada momento ao seu lado é uma página nova sendo escrita em nossa história.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Hoje, com corações cheios de gratidão e esperança, convidamos você para testemunhar 
              o início da nossa eternidade juntos.
            </p>
            <div className="pt-4 flex items-center gap-4">
              <div className="w-20 h-[2px] bg-gradient-to-r from-yellow-500 to-transparent" />
              <span className="text-yellow-600 font-medium">Raiana & Raphael</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Seção de Informações do Evento
function EventSection({ event }: { event: EventData }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      full: date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const dateInfo = formatDate(event.date)

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-yellow-600 text-sm uppercase tracking-[0.3em] mb-4">O Grande Dia</p>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4 capitalize">
            {dateInfo.full}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Cerimônia */}
          <div className="card-elegant p-8 text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <span className="text-3xl">💒</span>
            </div>
            <h3 className="text-xl font-serif text-gray-800 mb-3">Cerimônia</h3>
            <p className="text-yellow-600 font-medium mb-2">{dateInfo.time} horas</p>
            <p className="text-gray-500">{event.venue}</p>
          </div>

          {/* Recepção */}
          <div className="card-elegant p-8 text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <span className="text-3xl">🥂</span>
            </div>
            <h3 className="text-xl font-serif text-gray-800 mb-3">Recepção</h3>
            <p className="text-yellow-600 font-medium mb-2">Após a cerimônia</p>
            <p className="text-gray-500">{event.venue}</p>
          </div>
        </div>

        {/* Botão de localização */}
        <div className="text-center mt-12">
          <a
            href={event.venueMapsUrl || 'https://maps.google.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Ver Localização</span>
          </a>
        </div>
      </div>
    </section>
  )
}

// Seção de PIX
function PixSection() {
  const [showPix, setShowPix] = useState(false)

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-yellow-50 to-yellow-100/50">
      <div className="max-w-3xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-200 flex items-center justify-center">
          <span className="text-4xl">💝</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">
          Quer nos Presentear?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Sua presença é nosso maior presente! Mas se desejar nos presentear, 
          aceitamos contribuições via PIX para nos ajudar a construir nosso novo lar.
        </p>

        {!showPix ? (
          <button onClick={() => setShowPix(true)} className="btn-premium">
            Ver Dados do PIX
          </button>
        ) : (
          <div className="glass-light rounded-2xl p-8 max-w-md mx-auto animate-fadeIn">
            <p className="text-sm text-gray-500 mb-2">Chave PIX</p>
            <div className="flex items-center gap-3 justify-center mb-4">
              <code className="bg-yellow-100 px-4 py-2 rounded-lg text-yellow-800 font-mono">
                casamento.raianaeraphael@email.com
              </code>
              <button
                onClick={() => navigator.clipboard.writeText('casamento.raianaeraphael@email.com')}
                className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                title="Copiar"
              >
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Raiana & Raphael</p>
            <button onClick={() => setShowPix(false)} className="text-yellow-600 hover:text-yellow-700 text-sm">
              Fechar
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// Footer
function Footer({ eventDate, venue }: { eventDate: string; venue: string }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <footer className="py-12 px-4 bg-white border-t border-yellow-100">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6">
          <span className="text-4xl font-serif text-gradient-gold">R & R</span>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          {formatDate(eventDate)} • {venue}
        </p>
        <div className="flex justify-center gap-8 text-gray-500">
          <Link href="/rsvp" className="hover:text-yellow-600 transition-colors">RSVP</Link>
          <Link href="/gifts" className="hover:text-yellow-600 transition-colors">Presentes</Link>
          <Link href="/gallery" className="hover:text-yellow-600 transition-colors">Galeria</Link>
          <Link href="/contact" className="hover:text-yellow-600 transition-colors">Contato</Link>
        </div>
        <p className="text-gray-300 text-xs mt-8">
          Com amor, Raiana & Raphael ❤️
        </p>
      </div>
    </footer>
  )
}

// Página Principal
export default function Home() {
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvent()
      .then(setEvent)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Dados padrão caso não consiga carregar
  const defaultEvent: EventData = {
    id: '',
    coupleNames: 'Raiana & Raphael',
    date: '2026-05-16T12:00:00',
    venue: 'Rancho do Coutinho, Estrada Sao Jose do Turvo, 2195',
    venueMapsUrl: 'https://maps.google.com/?q=Estr.+de+São+José+do+Turvo+-+São+Luiz+da+Barra,+Barra+do+Piraí+-+RJ,+27165-971',
    description: null,
    guestCount: 0,
    giftCount: 0,
  }

  const currentEvent = event || defaultEvent

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      <HeroSection eventDate={currentEvent.date} />
      <PhotosSection />
      <StorySection />
      <EventSection event={currentEvent} />
      <PixSection />
      <Footer eventDate={currentEvent.date} venue={currentEvent.venue} />
    </main>
  )
}
