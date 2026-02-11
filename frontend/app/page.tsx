'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getEvent, EventData } from '@/lib/api'
import { useCouplePhotos, useGalleryPhotos } from '@/lib/usePhotos'
import { 
  RedRose, 
  OrangeFlower, 
  YellowFlower, 
  GreenLeaf, 
  Eucalyptus, 
  DriedPampas,
  FloralCircle,
  FloralDivider,
  FloralCorner,
  FloralPattern,
  PinkDahlia
} from './components/FloralElements'

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
      <div className="flex justify-center gap-3 md:gap-6">
        {['Dias', 'Horas', 'Minutos', 'Segundos'].map((label) => (
          <div key={label} className="text-center">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl border border-[#D4653C]/20 bg-white/80 backdrop-blur-sm flex items-center justify-center mb-2">
              <span className="text-2xl md:text-4xl font-serif text-[#B8333C]">--</span>
            </div>
            <span className="text-xs md:text-sm text-[#6B5D4D] uppercase tracking-wider font-serif">{label}</span>
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
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl border border-[#D4653C]/20 bg-white/90 backdrop-blur-sm flex items-center justify-center mb-2 shadow-lg shadow-[#D4653C]/5">
            <span className="text-2xl md:text-4xl font-serif text-[#B8333C]">
              {String(block.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs md:text-sm text-[#6B5D4D] uppercase tracking-wider font-serif">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// Hero Section com design floral
function HeroSection({ eventDate }: { eventDate: string }) {
  const { photos: couplePhotos, loading } = useCouplePhotos(5)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  const mainPhotos = couplePhotos.map(p => p.imageUrl)

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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFFCF8] via-[#F8F4ED] to-[#FDF9F3]">
      {/* Pattern de fundo sutil */}
      <FloralPattern />
      
      {/* Elementos florais decorativos - cantos */}
      <div className="absolute top-4 left-4 opacity-60">
        <FloralCorner position="top-left" />
      </div>
      <div className="absolute top-4 right-4 opacity-60">
        <FloralCorner position="top-right" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-60">
        <FloralCorner position="bottom-left" />
      </div>
      <div className="absolute bottom-4 right-4 opacity-60">
        <FloralCorner position="bottom-right" />
      </div>

      {/* Elementos florais flutuantes */}
      <div className="absolute top-20 left-[10%] float opacity-40">
        <RedRose size={60} />
      </div>
      <div className="absolute top-32 right-[15%] float-slow opacity-30">
        <OrangeFlower size={50} />
      </div>
      <div className="absolute bottom-40 left-[8%] float-slow opacity-35">
        <YellowFlower size={45} />
      </div>
      <div className="absolute bottom-32 right-[12%] float opacity-30">
        <PinkDahlia size={55} />
      </div>
      
      {/* Folhagem decorativa */}
      <div className="absolute top-1/4 left-[5%] opacity-25">
        <GreenLeaf size={70} />
      </div>
      <div className="absolute top-1/3 right-[8%] opacity-25">
        <GreenLeaf size={60} flipped />
      </div>
      <div className="absolute bottom-1/4 right-[5%] opacity-20">
        <Eucalyptus size={80} />
      </div>
      <div className="absolute bottom-1/3 left-[6%] opacity-20">
        <DriedPampas size={90} />
      </div>

      {/* Círculos decorativos */}
      <div className="absolute top-1/4 left-1/4 opacity-10">
        <FloralCircle size={300} />
      </div>
      <div className="absolute bottom-1/4 right-1/4 opacity-10">
        <FloralCircle size={250} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-20 pb-10">
        {/* Data */}
        <p className="text-[#D4653C] text-sm md:text-base uppercase tracking-[0.3em] mb-8 text-center font-serif fade-in-up">
          {formatDate(eventDate)}
        </p>

        {/* Layout Principal: Foto e Nomes Lado a Lado */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mb-12">
          
          {/* Foto dos noivos - Lado Esquerdo com decoração floral */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex-shrink-0 fade-in-up fade-in-up-delay-1">
            {/* Decoração floral ao redor da foto */}
            <div className="absolute -top-6 -left-6 float opacity-60">
              <RedRose size={50} />
            </div>
            <div className="absolute -top-4 -right-4 float-slow opacity-50">
              <OrangeFlower size={40} />
            </div>
            <div className="absolute -bottom-4 -left-4 float-slow opacity-50">
              <YellowFlower size={35} />
            </div>
            <div className="absolute -bottom-6 -right-6 float opacity-60">
              <PinkDahlia size={45} />
            </div>
            
            {/* Círculo decorativo */}
            <div className="absolute -inset-3 rounded-full border border-[#D4653C]/20" />
            <div className="absolute -inset-6 rounded-full border border-[#E8B84A]/10" />
            
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4653C] via-[#E89B6C] to-[#B8333C] p-1">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                {loading ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#F8F4ED] to-[#FDF9F3] flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-[#D4653C] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : mainPhotos.length > 0 ? (
                  <div className="w-full h-full relative">
                    <Image
                      src={mainPhotos[currentPhoto]}
                      alt="Raiana e Raphael"
                      fill
                      className="object-cover object-top transition-opacity duration-1000"
                      style={{ objectPosition: 'center 20%' }}
                      priority
                      sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#F8F4ED] to-[#FDF9F3] flex items-center justify-center">
                    <span className="text-6xl">💍</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Brilho ao redor */}
            <div className="absolute -inset-4 bg-[#E8B84A]/10 rounded-full blur-2xl -z-10" />
            
            {/* Indicadores de foto */}
            {mainPhotos.length > 1 && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {mainPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPhoto(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPhoto 
                        ? 'bg-[#D4653C] w-6' 
                        : 'bg-[#D4653C]/30 hover:bg-[#D4653C]/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Nomes - Lado Direito */}
          <div className="text-center fade-in-up fade-in-up-delay-2">
            {/* Pais dos noivos */}
            <div className="mb-8">
              <p className="text-[#D4653C]/80 text-sm uppercase tracking-widest mb-4 font-serif">
                Com a bênção de Deus e de seus pais
              </p>
              
              {/* Divider floral */}
              <FloralDivider className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-[#6B5D4D] max-w-2xl mx-auto font-serif">
                <div className="text-center">
                  <p className="text-[#3D3429]">Solange Aparecida Miranda Assumpção</p>
                  <p className="text-[#6B5D4D]">e José dos Santos Assumpção</p>
                </div>
                <div className="text-center">
                  <p className="text-[#3D3429]">Maria José Alves Perino dos Santos</p>
                  <p className="text-[#6B5D4D]">e Marco Aurélio dos Santos</p>
                </div>
              </div>
            </div>

            {/* Nomes dos noivos */}
            <h1 className="flex items-center justify-center gap-3 md:gap-6 mb-6">
              <span className="text-4xl md:text-6xl lg:text-7xl font-serif text-gradient-warm">
                Raiana
              </span>
              <span className="text-2xl md:text-4xl lg:text-5xl font-serif text-[#D4653C]/50 italic">
                &
              </span>
              <span className="text-4xl md:text-6xl lg:text-7xl font-serif text-gradient-warm">
                Raphael
              </span>
            </h1>

            <p className="text-[#D4653C]/80 text-sm uppercase tracking-widest mb-6 font-serif">
              Convidam para a cerimônia
            </p>
            
            {/* Divider floral */}
            <FloralDivider className="mb-6" />
            
            {/* Frase */}
            <p className="text-lg md:text-xl text-[#6B5D4D] max-w-md font-light italic mx-auto font-serif">
              &ldquo;Duas almas, um só coração. Um amor que transcende o tempo.&rdquo;
            </p>
          </div>
        </div>

        {/* Contador */}
        <div className="mb-10 fade-in-up fade-in-up-delay-3">
          <p className="text-[#D4653C]/80 text-sm uppercase tracking-widest mb-6 text-center font-serif">
            Faltam apenas
          </p>
          <Countdown targetDate={eventDate} />
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up fade-in-up-delay-4">
          <Link href="/rsvp" className="btn-premium">
            Confirmar Presença
          </Link>
          <Link href="/gifts" className="btn-secondary">
            Lista de Presentes
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-[#D4653C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}

// Seção com fotos em grid
function PhotosSection() {
  const { photos: galleryPhotos, loading } = useGalleryPhotos(4)
  const photos = galleryPhotos.map(p => ({ src: p.imageUrl, title: p.title }))

  return (
    <section className="relative py-20 px-4 bg-[#FFFCF8]">
      {/* Pattern de fundo */}
      <FloralPattern />
      
      {/* Elementos florais decorativos */}
      <div className="absolute top-10 left-10 opacity-20 float">
        <RedRose size={80} />
      </div>
      <div className="absolute top-20 right-10 opacity-15 float-slow">
        <OrangeFlower size={60} />
      </div>
      <div className="absolute bottom-10 left-[5%] opacity-15">
        <GreenLeaf size={50} />
      </div>
      <div className="absolute bottom-20 right-[8%] opacity-10">
        <DriedPampas size={70} />
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[#D4653C] text-sm uppercase tracking-[0.3em] mb-4 font-serif">Nossa História</p>
          <h2 className="text-4xl md:text-5xl font-serif text-[#3D3429]">Momentos Inesquecíveis</h2>
          
          {/* Divider floral */}
          <FloralDivider className="mt-6" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-2 border-[#D4653C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : photos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-500 border border-[#D4653C]/10"
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D3429]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-serif">{photo.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="text-center mt-10">
          <Link href="/gallery" className="inline-flex items-center gap-2 text-[#D4653C] hover:text-[#B8333C] font-serif transition-colors">
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
  const storyImage = couplePhotos.length > 0 ? couplePhotos[0].imageUrl : null

  return (
    <section className="relative py-24 px-4 bg-gradient-to-b from-[#FFFCF8] via-[#F8F4ED] to-[#FDF9F3]">
      {/* Pattern de fundo */}
      <FloralPattern />
      
      {/* Elementos florais */}
      <div className="absolute top-20 right-[5%] opacity-20">
        <FloralCircle size={200} />
      </div>
      <div className="absolute bottom-20 left-[5%] opacity-15">
        <BouquetDecoration size={180} />
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            {/* Decoração floral ao redor da imagem */}
            <div className="absolute -top-4 -left-4 opacity-60">
              <RedRose size={50} />
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-50">
              <OrangeFlower size={45} />
            </div>
            
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-[#D4653C]/10">
              {storyImage ? (
                <Image
                  src={storyImage}
                  alt="Raiana e Raphael"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#F8F4ED] to-[#FDF9F3] flex items-center justify-center">
                  <span className="text-7xl">💛</span>
                </div>
              )}
            </div>
            
            {/* Decoração de canto */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border-2 border-[#D4653C]/20 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#E8B84A]/10 rounded-2xl -z-10" />
          </div>

          <div className="space-y-6">
            <p className="text-[#D4653C] text-sm uppercase tracking-[0.3em] font-serif">Nossa História</p>
            
            <h2 className="text-4xl md:text-5xl font-serif text-[#3D3429] leading-tight">
              Um Amor que <span className="text-gradient-warm">Cresce</span> a Cada Dia
            </h2>
            
            {/* Divider floral */}
            <FloralDivider className="justify-start" />
            
            <p className="text-[#6B5D4D] text-lg leading-relaxed font-serif">
              Em meio às incertezas da vida, encontramos um no outro a certeza do amor verdadeiro. 
              Cada momento ao seu lado é uma página nova sendo escrita em nossa história.
            </p>
            <p className="text-[#6B5D4D] text-lg leading-relaxed font-serif">
              Hoje, com corações cheios de gratidão e esperança, convidamos você para testemunhar 
              o início da nossa eternidade juntos.
            </p>
            
            <div className="pt-4 flex items-center gap-4">
              <div className="w-20 h-[2px] bg-gradient-to-r from-[#D4653C] to-transparent" />
              <span className="text-[#D4653C] font-serif font-medium">Raiana & Raphael</span>
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
    <section className="relative py-24 px-4 bg-[#FFFCF8]">
      {/* Pattern de fundo */}
      <FloralPattern />
      
      {/* Elementos florais */}
      <div className="absolute top-10 left-[10%] opacity-20 float">
        <YellowFlower size={60} />
      </div>
      <div className="absolute top-20 right-[8%] opacity-15 float-slow">
        <PinkDahlia size={55} />
      </div>
      <div className="absolute bottom-10 left-[5%] opacity-15">
        <Eucalyptus size={70} />
      </div>
      <div className="absolute bottom-20 right-[10%] opacity-10">
        <FloralCircle size={150} />
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#D4653C] text-sm uppercase tracking-[0.3em] mb-4 font-serif">O Grande Dia</p>
          <h2 className="text-4xl md:text-5xl font-serif text-[#3D3429] mb-4 capitalize">
            {dateInfo.full}
          </h2>
          
          {/* Divider floral */}
          <FloralDivider className="mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Cerimônia */}
          <div className="card-elegant p-8 text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F8F4ED] flex items-center justify-center group-hover:bg-[#FDF9F3] transition-colors border border-[#D4653C]/10">
              <span className="text-3xl">💒</span>
            </div>
            <h3 className="text-xl font-serif text-[#3D3429] mb-3">Cerimônia</h3>
            <p className="text-[#D4653C] font-medium mb-2 font-serif">{dateInfo.time} horas</p>
            <p className="text-[#6B5D4D] font-serif">{event.venue}</p>
          </div>

          {/* Recepção */}
          <div className="card-elegant p-8 text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F8F4ED] flex items-center justify-center group-hover:bg-[#FDF9F3] transition-colors border border-[#D4653C]/10">
              <span className="text-3xl">🥂</span>
            </div>
            <h3 className="text-xl font-serif text-[#3D3429] mb-3">Recepção</h3>
            <p className="text-[#D4653C] font-medium mb-2 font-serif">Após a cerimônia</p>
            <p className="text-[#6B5D4D] font-serif">{event.venue}</p>
          </div>
        </div>

        {/* Botão de localização */}
        <div className="text-center mt-12">
          <a
            href={event.venueMapsUrl || 'https://maps.google.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-secondary"
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
  const [paymentInfo, setPaymentInfo] = useState<{
    pixKey: string
    pixKeyType: string
    coupleNames: string
  }>({
    pixKey: '',
    pixKeyType: '',
    coupleNames: '',
  })
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(false)

  useEffect(() => {
    loadPaymentInfo()
  }, [])

  async function loadPaymentInfo() {
    setLoadingPaymentInfo(true)
    try {
      const res = await fetch('/api/payment-info', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setPaymentInfo({
          pixKey: data.pixKey || '',
          pixKeyType: data.pixKeyType || '',
          coupleNames: data.coupleNames || '',
        })
      }
    } catch (error) {
      console.error('Erro ao carregar informações de pagamento:', error)
    } finally {
      setLoadingPaymentInfo(false)
    }
  }

  return (
    <section className="relative py-20 px-4 bg-gradient-to-r from-[#F8F4ED] to-[#FDF9F3]">
      {/* Pattern de fundo */}
      <FloralPattern />
      
      {/* Elementos florais */}
      <div className="absolute top-10 right-[10%] opacity-20 float-slow">
        <RedRose size={70} />
      </div>
      <div className="absolute bottom-10 left-[8%] opacity-15 float">
        <OrangeFlower size={55} />
      </div>
      
      <div className="relative max-w-3xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F8F4ED] flex items-center justify-center border border-[#D4653C]/10">
          <span className="text-4xl">💝</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-serif text-[#3D3429] mb-4">
          Quer nos Presentear?
        </h2>
        
        {/* Divider floral */}
        <FloralDivider className="mb-6" />
        
        <p className="text-[#6B5D4D] mb-8 max-w-xl mx-auto font-serif">
          Sua presença é nosso maior presente! Mas se desejar nos presentear, 
          aceitamos contribuições via PIX para nos ajudar a construir nosso novo lar.
        </p>

        {!showPix ? (
          <button
            onClick={() => setShowPix(true)}
            className="btn-premium"
            disabled={loadingPaymentInfo}
          >
            {loadingPaymentInfo ? 'Carregando...' : 'Ver Dados do PIX'}
          </button>
        ) : (
          <div className="glass-light rounded-2xl p-8 max-w-md mx-auto animate-fadeIn">
            <p className="text-sm text-[#6B5D4D] mb-2 font-serif">
              Chave PIX {paymentInfo.pixKeyType ? `(${paymentInfo.pixKeyType})` : ''}
            </p>

            {paymentInfo.pixKey ? (
              <div className="flex items-center gap-3 justify-center mb-4">
                <code className="bg-[#F8F4ED] px-4 py-2 rounded-lg text-[#B8333C] font-mono break-all border border-[#D4653C]/10">
                  {paymentInfo.pixKey}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(paymentInfo.pixKey)}
                  className="p-2 hover:bg-[#F8F4ED] rounded-lg transition-colors"
                  title="Copiar"
                >
                  <svg className="w-5 h-5 text-[#D4653C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ) : (
              <p className="text-sm text-[#9B8B7A] mb-4 font-serif">Chave PIX não configurada</p>
            )}

            <p className="text-xs text-[#9B8B7A] mb-4 font-serif">{paymentInfo.coupleNames || 'Raiana & Raphael'}</p>
            
            <button onClick={() => setShowPix(false)} className="text-[#D4653C] hover:text-[#B8333C] text-sm font-serif transition-colors">
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
    <footer className="relative py-12 px-4 bg-[#FFFCF8] border-t border-[#D4653C]/10">
      {/* Pattern de fundo sutil */}
      <FloralPattern />
      
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Elemento floral central */}
        <div className="flex justify-center mb-6">
          <FloralDivider />
        </div>
        
        <div className="mb-6">
          <span className="text-4xl font-serif text-gradient-warm">R & R</span>
        </div>
        
        <p className="text-[#9B8B7A] text-sm mb-6 font-serif">
          {formatDate(eventDate)} • {venue}
        </p>
        
        <div className="flex justify-center gap-8 text-[#6B5D4D]">
          <Link href="/rsvp" className="hover:text-[#D4653C] transition-colors font-serif">RSVP</Link>
          <Link href="/gifts" className="hover:text-[#D4653C] transition-colors font-serif">Presentes</Link>
          <Link href="/gallery" className="hover:text-[#D4653C] transition-colors font-serif">Galeria</Link>
        </div>
        
        <p className="text-[#9B8B7A]/70 text-xs mt-8 font-serif">
          Com amor, Raiana & Raphael ❤️
        </p>
        
        <div className="mt-4">
          <Link
            href="/admin/login"
            className="text-[#9B8B7A]/50 hover:text-[#D4653C] text-xs transition-colors font-serif"
          >
            Administração
          </Link>
        </div>
      </div>
    </footer>
  )
}

// Importação dinâmica do BouquetDecoration para evitar erro
import dynamic from 'next/dynamic'

const BouquetDecoration = dynamic(() => import('./components/FloralElements').then(mod => mod.BouquetDecoration), {
  ssr: false
})

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
      <main className="min-h-screen bg-[#F8F4ED] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4653C] mx-auto mb-4" />
          <p className="text-[#6B5D4D] font-serif">Carregando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F4ED]">
      <HeroSection eventDate={currentEvent.date} />
      <PhotosSection />
      <StorySection />
      <EventSection event={currentEvent} />
      <PixSection />
      <Footer eventDate={currentEvent.date} venue={currentEvent.venue} />
    </main>
  )
}
