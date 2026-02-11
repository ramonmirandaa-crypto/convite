'use client'

import { useState } from 'react'
import { createRSVP } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { useCouplePhotos } from '@/lib/usePhotos'
import { PageLayout, PageContainer, Card } from '../components/PageLayout'
import { FloralDivider, RedRose, OrangeFlower, YellowFlower } from '../components/FloralElements'

export default function RSVP() {
  const { photos: couplePhotos } = useCouplePhotos(1)
  const headerImage = couplePhotos.length > 0 ? couplePhotos[0].imageUrl : null

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guestCount: 1,
    dietaryRestrictions: '',
    suggestedSong: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      await createRSVP({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guestCount: formData.guestCount,
        dietaryRestrictions: formData.dietaryRestrictions || undefined,
        suggestedSong: formData.suggestedSong || undefined,
        message: formData.message || undefined,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao enviar confirmação')
    }
  }

  if (status === 'success') {
    return (
      <PageLayout>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="max-w-lg w-full text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#F8F4ED] to-[#FDF9F3] rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-[#D4653C]/20">
              <svg className="w-12 h-12 text-[#D4653C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-serif text-gradient-warm mb-6">
              Presença Confirmada!
            </h1>
            
            <p className="text-xl text-[#6B5D4D] mb-2 font-serif">
              Obrigado, <span className="text-[#D4653C] font-medium">{formData.name}</span>!
            </p>
            <p className="text-[#6B5D4D] mb-10 font-serif">
              Sua presença foi confirmada com sucesso. Estamos muito felizes em contar com você neste dia especial!
            </p>

            <div className="bg-[#F8F4ED] border border-[#D4653C]/10 rounded-2xl p-6 mb-8">
              <p className="text-[#D4653C] text-sm font-serif">
                ✨ Um email de confirmação foi enviado para {formData.email}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-8 py-4 rounded-full border-2 border-[#D4653C] text-[#D4653C] hover:bg-[#D4653C]/5 transition-all duration-300 font-serif"
              >
                Voltar ao Início
              </Link>
              <Link
                href="/gifts"
                className="btn-premium"
              >
                Ver Lista de Presentes
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout hideFooter>
      {/* Header */}
      <section className="relative pt-24 pb-12 px-4">
        {/* Elementos florais */}
        <div className="absolute top-10 left-10 opacity-20 float">
          <RedRose size={50} />
        </div>
        <div className="absolute top-20 right-10 opacity-15 float-slow">
          <OrangeFlower size={40} />
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#D4653C]/30 shadow-xl">
            {headerImage ? (
              <Image
                src={headerImage}
                alt="Raiana e Raphael"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#F8F4ED] to-[#FDF9F3] flex items-center justify-center">
                <span className="text-4xl">💍</span>
              </div>
            )}
          </div>
          <p className="text-[#D4653C] text-sm uppercase tracking-[0.3em] mb-4 font-serif">
            Confirme sua Presença
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#3D3429] mb-4">
            Raiana & Raphael
          </h1>
          
          {/* Divider floral */}
          <FloralDivider className="my-6" />
          
          <p className="text-[#6B5D4D] font-serif">
            16 de Maio de 2026 • Rancho do Coutinho
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24 px-4">
        <PageContainer>
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 md:p-10">
              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-serif">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#3D3429] flex items-center gap-3 font-serif">
                    <span className="w-8 h-8 bg-[#F8F4ED] rounded-full flex items-center justify-center text-[#D4653C] text-sm font-semibold">1</span>
                    Dados Pessoais
                  </h3>
                  
                  <div>
                    <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Digite seu nome completo"
                      className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all font-serif"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all font-serif"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Telefone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all font-serif"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#D4653C]/10" />

                {/* Guest Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#3D3429] flex items-center gap-3 font-serif">
                    <span className="w-8 h-8 bg-[#F8F4ED] rounded-full flex items-center justify-center text-[#D4653C] text-sm font-semibold">2</span>
                    Acompanhantes
                  </h3>
                  
                  <div>
                    <label className="block text-sm text-[#6B5D4D] mb-3 font-serif">Quantidade de Acompanhantes</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, guestCount: Math.max(0, formData.guestCount - 1) })}
                        className="w-12 h-12 rounded-full bg-[#F8F4ED] hover:bg-[#D4653C]/10 flex items-center justify-center text-[#6B5D4D] hover:text-[#D4653C] transition-colors text-xl"
                      >
                        −
                      </button>
                      <span className="text-3xl font-serif text-[#3D3429] w-16 text-center">
                        {formData.guestCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, guestCount: Math.min(10, formData.guestCount + 1) })}
                        className="w-12 h-12 rounded-full bg-[#F8F4ED] hover:bg-[#D4653C]/10 flex items-center justify-center text-[#6B5D4D] hover:text-[#D4653C] transition-colors text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#D4653C]/10" />

                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#3D3429] flex items-center gap-3 font-serif">
                    <span className="w-8 h-8 bg-[#F8F4ED] rounded-full flex items-center justify-center text-[#D4653C] text-sm font-semibold">3</span>
                    Informações Adicionais
                  </h3>
                  
                  <div>
                    <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Restrições Alimentares (opcional)</label>
                    <textarea
                      value={formData.dietaryRestrictions}
                      onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                      placeholder="Alguma alergia ou restrição alimentar?"
                      rows={3}
                      className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all resize-none font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Sugestão de Música (opcional)</label>
                    <input
                      type="text"
                      value={formData.suggestedSong}
                      onChange={(e) => setFormData({ ...formData, suggestedSong: e.target.value })}
                      placeholder="Que música você gostaria de ouvir na festa?"
                      className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Mensagem para os Noivos (opcional)</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Deixe uma mensagem especial para nós..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all resize-none font-serif"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full btn-premium py-4 text-lg font-medium disabled:opacity-50 font-serif"
                >
                  {status === 'loading' ? 'Enviando...' : '💌 Confirmar Presença'}
                </button>
              </form>
            </Card>

            {/* Back link */}
            <div className="mt-8 text-center">
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
          </div>
        </PageContainer>
      </section>
    </PageLayout>
  )
}
