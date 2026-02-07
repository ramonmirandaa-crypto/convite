'use client'

import { useState } from 'react'
import { createRSVP } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent } from '@/components/ui/Card'
import { FloralDivider, HeartDecoration } from '@/components/FloralDecoration'

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
      <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Presença Confirmada!
            </h1>
            
            <FloralDivider />
            
            <p className="text-lg text-gray-600 mb-2">
              Obrigado, <span className="font-semibold text-rose-500">{formData.name}</span>!
            </p>
            <p className="text-gray-600 mb-8">
              Sua presença foi confirmada com sucesso. Estamos muito felizes em contar com você neste dia especial!
            </p>

            <div className="bg-rose-50 rounded-xl p-4 mb-8">
              <p className="text-sm text-rose-700">
                <HeartDecoration className="w-4 h-4 inline mr-1" />
                Um email de confirmação foi enviado para {formData.email}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="/" variant="outline">
                Voltar ao Início
              </Button>
              <Button href="/gifts">
                Ver Lista de Presentes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      {/* Header */}
      <section className="pt-16 pb-8 px-4 text-center">
        <p className="text-rose-500 text-lg tracking-widest uppercase mb-4">
          RSVP
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          Confirmar Presença
        </h1>
        <FloralDivider />
        <p className="text-gray-600 max-w-2xl mx-auto">
          Preencha o formulário abaixo para confirmar sua presença em nosso casamento.
          Sua resposta é muito importante para o planejamento do evento.
        </p>
      </section>

      {/* Form */}
      <section className="pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 text-sm">1</span>
                    Dados Pessoais
                  </h3>
                  
                  <Input
                    label="Nome Completo"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite seu nome completo"
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                    />

                    <Input
                      label="Telefone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-200" />

                {/* Guest Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 text-sm">2</span>
                    Acompanhantes
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade de Acompanhantes
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, guestCount: Math.max(0, formData.guestCount - 1) })}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                      >
                        −
                      </button>
                      <span className="text-2xl font-semibold text-gray-800 w-12 text-center">
                        {formData.guestCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, guestCount: Math.min(10, formData.guestCount + 1) })}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200" />

                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 text-sm">3</span>
                    Informações Adicionais
                  </h3>
                  
                  <Textarea
                    label="Restrições Alimentares (opcional)"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                    placeholder="Alguma alergia ou restrição alimentar?"
                    rows={3}
                  />

                  <Input
                    label="Sugestão de Música (opcional)"
                    type="text"
                    value={formData.suggestedSong}
                    onChange={(e) => setFormData({ ...formData, suggestedSong: e.target.value })}
                    placeholder="Que música você gostaria de ouvir na festa?"
                  />

                  <Textarea
                    label="Mensagem para os Noivos (opcional)"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Deixe uma mensagem especial para nós..."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full"
                  size="lg"
                  icon="💌"
                >
                  {status === 'loading' ? 'Enviando...' : 'Confirmar Presença'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Button href="/" variant="ghost" icon="←">
              Voltar ao Início
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
