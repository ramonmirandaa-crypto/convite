'use client'

import { useState } from 'react'
import { sendContact } from '@/lib/api'
import Link from 'next/link'
import { PageLayout, PageContainer, Card } from '../components/PageLayout'
import { FloralDivider, RedRose, OrangeFlower, YellowFlower } from '../components/FloralElements'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      await sendContact(formData)
      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
    }
  }

  return (
    <PageLayout hideFooter>
      {/* Header */}
      <section className="relative pt-24 pb-8 px-4">
        {/* Elementos florais */}
        <div className="absolute top-10 left-10 opacity-20 float">
          <RedRose size={50} />
        </div>
        <div className="absolute top-20 right-10 opacity-15 float-slow">
          <OrangeFlower size={40} />
        </div>
        
        <PageContainer>
          <div className="text-center">
            <p className="text-[#D4653C] text-sm uppercase tracking-[0.3em] mb-4 font-serif">
              Contato
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif text-[#3D3429] mb-4">
              Fale Conosco
            </h1>
            
            {/* Divider floral */}
            <FloralDivider className="my-6" />
            
            <p className="text-[#6B5D4D] max-w-2xl mx-auto font-serif">
              Tem alguma dúvida ou mensagem especial? Entre em contato conosco!
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Content */}
      <section className="pb-16 px-4">
        <PageContainer>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="md:col-span-1 space-y-4">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F8F4ED] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4653C]/10">
                  <svg className="w-6 h-6 text-[#D4653C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-serif text-[#3D3429] mb-1">Email</h3>
                <p className="text-sm text-[#6B5D4D] font-serif">casamento@raianaeraphael.com</p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F8F4ED] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4653C]/10">
                  <svg className="w-6 h-6 text-[#E8B84A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-serif text-[#3D3429] mb-1">Telefone</h3>
                <p className="text-sm text-[#6B5D4D] font-serif">(24) 99999-9999</p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F8F4ED] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4653C]/10">
                  <svg className="w-6 h-6 text-[#5B7248]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-[#3D3429] mb-1">Local</h3>
                <p className="text-sm text-[#6B5D4D] font-serif">Rancho do Coutinho</p>
                <p className="text-xs text-[#9B8B7A] font-serif">Estrada Sao Jose do Turvo, 2195</p>
                <p className="text-xs text-[#9B8B7A] font-serif">Sao Luiz da Barra, Barra do Pirai - RJ</p>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <Card className="p-8">
                {status === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#5B7248]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#5B7248]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-serif text-[#3D3429] mb-2">Mensagem Enviada!</h3>
                    <p className="text-[#6B5D4D] mb-6 font-serif">
                      Obrigado pelo contato! Responderemos em breve.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="px-6 py-2 border border-[#D4653C] text-[#D4653C] rounded-full hover:bg-[#D4653C]/5 transition-colors font-serif"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-serif">{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Nome</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Seu nome"
                          className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all font-serif"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Email</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="seu@email.com"
                          className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all font-serif"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Assunto</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Sobre o que deseja falar?"
                        className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all font-serif"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Mensagem</label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Escreva sua mensagem..."
                        rows={5}
                        className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all resize-none font-serif"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full btn-premium disabled:opacity-50 font-serif"
                    >
                      {status === 'loading' ? 'Enviando...' : '💌 Enviar Mensagem'}
                    </button>
                  </form>
                )}
              </Card>
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
