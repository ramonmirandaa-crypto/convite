'use client'

import { useState } from 'react'
import { createRSVP } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'

export default function RSVP() {
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
      <main className="min-h-screen bg-[#FDF8F3] flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-yellow-400">
            <svg className="w-12 h-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-serif text-gradient-gold mb-6">
            Presença Confirmada!
          </h1>
          
          <p className="text-xl text-gray-600 mb-2">
            Obrigado, <span className="text-yellow-600 font-medium">{formData.name}</span>!
          </p>
          <p className="text-gray-500 mb-10">
            Sua presença foi confirmada com sucesso. Estamos muito felizes em contar com você neste dia especial!
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
            <p className="text-yellow-700 text-sm">
              ✨ Um email de confirmação foi enviado para {formData.email}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 rounded-full border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50 transition-all duration-300"
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
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Header */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="absolute inset-0 bg-[url('/Fotos/IMG_0548.jpeg')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDF8F3] via-[#FDF8F3]/95 to-[#FDF8F3]" />
        
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
            <Image
              src="/Fotos/IMG_0549.jpeg"
              alt="Raiana e Raphael"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>
          <p className="text-yellow-600 text-sm uppercase tracking-[0.3em] mb-4">
            Confirme sua Presença
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
            Raiana & Raphael
          </h1>
          <p className="text-gray-500">
            16 de Maio de 2026 • Rancho do Coutinho
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-8 md:p-10">
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm font-semibold">1</span>
                  Dados Pessoais
                </h3>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite seu nome completo"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Telefone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Guest Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm font-semibold">2</span>
                  Acompanhantes
                </h3>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-3">Quantidade de Acompanhantes</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, guestCount: Math.max(0, formData.guestCount - 1) })}
                      className="w-12 h-12 rounded-full bg-gray-100 hover:bg-yellow-100 flex items-center justify-center text-gray-600 hover:text-yellow-600 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-3xl font-semibold text-gray-800 w-16 text-center">
                      {formData.guestCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, guestCount: Math.min(10, formData.guestCount + 1) })}
                      className="w-12 h-12 rounded-full bg-gray-100 hover:bg-yellow-100 flex items-center justify-center text-gray-600 hover:text-yellow-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm font-semibold">3</span>
                  Informações Adicionais
                </h3>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Restrições Alimentares (opcional)</label>
                  <textarea
                    value={formData.dietaryRestrictions}
                    onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                    placeholder="Alguma alergia ou restrição alimentar?"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Sugestão de Música (opcional)</label>
                  <input
                    type="text"
                    value={formData.suggestedSong}
                    onChange={(e) => setFormData({ ...formData, suggestedSong: e.target.value })}
                    placeholder="Que música você gostaria de ouvir na festa?"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Mensagem para os Noivos (opcional)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Deixe uma mensagem especial para nós..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 transition-all resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full btn-premium py-4 text-lg font-medium disabled:opacity-50"
              >
                {status === 'loading' ? 'Enviando...' : '💌 Confirmar Presença'}
              </button>
            </form>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar ao Início</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
