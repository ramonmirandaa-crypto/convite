'use client'

import { useEffect, useRef, useState } from 'react'
import { listGifts, Gift } from '@/lib/api'
import Image from 'next/image'
import { MercadoPagoProvider } from '@/lib/mercadopago-js'
import CardPaymentForm from '@/components/CardPaymentForm'
import { useCouplePhotos } from '@/lib/usePhotos'

// Tipos
interface PaymentModalProps {
  gift: Gift
  publicKey: string
  onClose: () => void
  onSuccess: () => void
}

// Modal de Pagamento
function PaymentModal({ gift, publicKey, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'form' | 'pix' | 'card' | 'loading' | 'success'>('form')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')
  const [amount, setAmount] = useState(gift.remaining || 0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    message: '',
    isAnonymous: false,
  })
  const [pixData, setPixData] = useState<{
    qrCode: string
    qrCodeBase64: string
    copyPasteCode: string
    paymentId: string
  } | null>(null)
  const [error, setError] = useState('')
  const [contributionId, setContributionId] = useState('')
  const [waitingMessage, setWaitingMessage] = useState('')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Limpa polling ao desmontar o componente
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStep('loading')

    try {
      const payload = {
        giftId: gift.id,
        amount,
        payerName: formData.name,
        payerEmail: formData.email,
        payerCPF: formData.cpf,
        payerPhone: formData.phone,
        message: formData.message,
        isAnonymous: formData.isAnonymous,
        paymentMethod,
      }

      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      setContributionId(data.contribution.id)

      if (paymentMethod === 'pix') {
        if (data.mock) {
          // Modo de desenvolvimento - usar dados mockados
          setPixData({
            qrCode: data.pixQrCode,
            qrCodeBase64: '',
            copyPasteCode: data.pixCode,
            paymentId: data.contribution.id,
          })
        } else if (data.pix) {
          // Dados reais do Mercado Pago
          setPixData({
            qrCode: data.pix.qrCodeBase64,
            qrCodeBase64: data.pix.qrCodeBase64,
            copyPasteCode: data.pix.copyPasteCode,
            paymentId: data.payment.id,
          })
        } else {
          // Se não tem dados do PIX, mostra erro
          throw new Error('Erro ao gerar QR Code PIX. Tente novamente ou use outro método de pagamento.')
        }
        setStep('pix')
        
        // Inicia polling para verificar status
        startPolling(data.contribution.id)
      }
    } catch (err: any) {
      setError(err.message)
      setStep('form')
    }
  }

  const handleCardPayment = async (cardToken: string, paymentMethodId: string, installments: number, issuerId?: string) => {
    setStep('loading')
    setError('')

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.id,
          amount,
          payerName: formData.name,
          payerEmail: formData.email,
          payerCPF: formData.cpf,
          payerPhone: formData.phone,
          message: formData.message,
          isAnonymous: formData.isAnonymous,
          paymentMethod: 'credit_card',
          cardToken,
          installments,
          paymentMethodId,
          issuerId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }

      setContributionId(data.contribution.id)

      const status = data.payment?.status
      if (status === 'approved') {
        setStep('success')
        setTimeout(onSuccess, 2000)
      } else if (status === 'in_process' || status === 'pending') {
        // Cartão pode ficar em análise - inicia polling
        startPolling(data.contribution.id)
        setStep('pix') // Reutiliza tela de aguardando com mensagem adequada
        setPixData(null) // Sem QR code - apenas mensagem de aguardando
      } else if (status === 'rejected') {
        const detail = data.payment?.statusDetail || ''
        const rejectionMessages: Record<string, string> = {
          cc_rejected_bad_filled_card_number: 'Número do cartão incorreto.',
          cc_rejected_bad_filled_date: 'Data de validade incorreta.',
          cc_rejected_bad_filled_other: 'Verifique os dados do cartão.',
          cc_rejected_bad_filled_security_code: 'Código de segurança incorreto.',
          cc_rejected_blacklist: 'Pagamento não pôde ser processado.',
          cc_rejected_call_for_authorize: 'Ligue para a operadora do cartão para autorizar.',
          cc_rejected_card_disabled: 'Cartão desativado. Ligue para a operadora.',
          cc_rejected_duplicated_payment: 'Pagamento duplicado. Aguarde alguns minutos.',
          cc_rejected_high_risk: 'Pagamento recusado por segurança. Tente outro método.',
          cc_rejected_insufficient_amount: 'Saldo insuficiente no cartão.',
          cc_rejected_max_attempts: 'Limite de tentativas atingido. Tente outro cartão.',
          cc_rejected_other_reason: 'Pagamento recusado pela operadora.',
        }
        const message = rejectionMessages[detail] || 'Pagamento não aprovado. Tente novamente com outro cartão ou método.'
        setStep('form')
        setError(message)
      } else {
        setStep('form')
        setError('Pagamento não aprovado. Tente novamente.')
      }
    } catch (err: any) {
      setError(err.message)
      setStep('form')
    }
  }

  const startPolling = (id: string) => {
    // Limpa polling anterior se existir
    if (pollingRef.current) clearInterval(pollingRef.current)
    if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current)

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${id}`)
        const data = await res.json()

        if (data.status === 'approved') {
          clearInterval(interval)
          pollingRef.current = null
          setStep('success')
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 2000)
        } else if (data.status === 'rejected' || data.status === 'cancelled') {
          clearInterval(interval)
          pollingRef.current = null
          setStep('form')
          setError('Pagamento foi recusado ou cancelado. Tente novamente.')
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
      }
    }, 5000)

    pollingRef.current = interval

    // Para após 10 minutos
    pollingTimeoutRef.current = setTimeout(() => {
      clearInterval(interval)
      pollingRef.current = null
    }, 10 * 60 * 1000)
  }

  const copyPixCode = () => {
    if (pixData?.copyPasteCode) {
      navigator.clipboard.writeText(pixData.copyPasteCode)
      alert('Código PIX copiado!')
    }
  }

  // Formata CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-serif text-gray-800 mb-2">Pagamento Confirmado!</h3>
          <p className="text-gray-500">Obrigado pela sua contribuição! 💕</p>
        </div>
      </div>
    )
  }

  if (step === 'pix') {
    // Tela de aguardando - pode ser PIX (com QR) ou cartão em análise (sem QR)
    const isCardProcessing = !pixData
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-serif text-gray-800 mb-2">
              {isCardProcessing ? 'Pagamento em Análise' : 'Pagamento PIX'}
            </h3>
            <p className="text-gray-500 text-sm">
              {isCardProcessing
                ? 'Seu pagamento está sendo analisado. Isso pode levar alguns instantes.'
                : 'Escaneie o QR Code ou copie o código'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            {/* QR Code - só para PIX */}
            {pixData && (
              <>
                <div className="bg-white p-4 rounded-xl border-2 border-yellow-200">
                  {pixData.qrCodeBase64 ? (
                    <img
                      src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  ) : pixData.qrCode ? (
                    <div className="w-48 h-48 bg-yellow-50 flex items-center justify-center">
                      <img src={pixData.qrCode} alt="QR Code PIX" className="w-44 h-44" />
                    </div>
                  ) : null}
                </div>

                {/* Código Copia e Cola */}
                {pixData.copyPasteCode && (
                  <div className="w-full">
                    <p className="text-sm text-gray-500 mb-2">Código Copia e Cola:</p>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-gray-100 p-3 rounded-lg text-xs break-all">
                        {pixData.copyPasteCode.substring(0, 50)}...
                      </code>
                      <button
                        onClick={copyPixCode}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Ícone de processamento para cartão */}
            {isCardProcessing && (
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-2 text-yellow-600">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-sm">
                {isCardProcessing ? 'Aguardando confirmação...' : 'Aguardando pagamento...'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              {isCardProcessing ? 'Fechar (será notificado por email)' : 'Fechar (pode pagar depois)'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'card') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif text-gray-800">Pagamento com Cartão</h3>
            <button
              onClick={() => setStep('form')}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Voltar
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Resumo */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Contribuição para:</p>
            <p className="font-medium text-gray-800">{gift.title}</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              R$ {amount.toFixed(2)}
            </p>
          </div>

          {/* Formulário de Cartão */}
          <MercadoPagoProvider publicKey={publicKey}>
            <CardPaymentForm
              publicKey={publicKey}
              amount={amount}
              onSubmit={handleCardPayment}
              onError={setError}
            />
          </MercadoPagoProvider>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-serif text-gray-800 mb-4">
          Contribuir para {gift.title}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Valor */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Valor da Contribuição (R$)</label>
            <input
              type="number"
              min={1}
              max={gift.remaining}
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Restante: R$ {Number(gift.remaining).toFixed(2)}
            </p>
          </div>

          {/* Dados Pessoais */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">CPF</label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                maxLength={14}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Telefone (opcional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Mensagem (opcional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none resize-none"
            />
          </div>

          {/* Anônimo */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-400"
            />
            <span className="text-sm text-gray-600">Contribuir anonimamente</span>
          </label>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  paymentMethod === 'pix'
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-200'
                }`}
              >
                <span className="text-2xl">💠</span>
                <p className="font-medium text-gray-800 mt-1">PIX</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('card')
                  if (publicKey) {
                    setStep('card')
                  } else {
                    setError('Pagamento com cartão não configurado. Use PIX ou configure o Mercado Pago.')
                  }
                }}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  paymentMethod === 'card'
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-200'
                }`}
              >
                <span className="text-2xl">💳</span>
                <p className="font-medium text-gray-800 mt-1">Cartão</p>
              </button>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={step === 'loading'}
              className="flex-1 py-3 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={step === 'loading' || paymentMethod !== 'pix'}
              className="flex-1 py-3 rounded-full btn-premium text-white disabled:opacity-50"
            >
              {step === 'loading' ? 'Processando...' : 'Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente de card de presente
function GiftCard({ gift, onContribute }: { gift: Gift; onContribute: (gift: Gift) => void }) {
  const progress = gift.progress || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-video bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        {gift.imageUrl ? (
          <Image
            src={gift.imageUrl}
            alt={gift.title}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-6xl">🎁</span>
        )}
        
        {gift.status === 'fulfilled' && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl mb-2 block">✨</span>
              <span className="text-yellow-600 font-medium">Presenteado!</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-medium text-gray-800 mb-2">{gift.title}</h3>
        {gift.description && (
          <p className="text-gray-500 text-sm mb-4">{gift.description}</p>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Progresso</span>
            <span className="text-yellow-600 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Valor Total</p>
            <p className="text-xl font-semibold text-gradient-gold">
              R$ {Number(gift.totalValue).toFixed(2)}
            </p>
          </div>

          {gift.status === 'available' ? (
            <button
              onClick={() => onContribute(gift)}
              className="px-6 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full text-sm font-medium transition-colors"
            >
              Contribuir
            </button>
          ) : (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Completo
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface PaymentInfo {
  pixKey: string
  pixKeyType: string
  coupleNames: string
}

export default function Gifts() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [mpPublicKey, setMpPublicKey] = useState('')
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    pixKey: '',
    pixKeyType: '',
    coupleNames: 'Raiana & Raphael'
  })
  
  // Usa as fotos do casal configuradas no painel (categoria "couple").
  const { photos: couplePhotos } = useCouplePhotos(1)
  const headerImage = couplePhotos.length > 0 ? couplePhotos[0].imageUrl : null

  useEffect(() => {
    loadGifts()
    loadMpConfig()
    loadPaymentInfo()
  }, [])

  async function loadGifts() {
    try {
      const data = await listGifts()
      setGifts(data.gifts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar presentes')
    } finally {
      setLoading(false)
    }
  }

  async function loadMpConfig() {
    try {
      const res = await fetch('/api/event')
      if (res.ok) {
        const event = await res.json()
        const mpConfig = event.mpConfig || {}
        if (mpConfig.publicKey) {
          setMpPublicKey(mpConfig.publicKey)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações MP:', error)
    }
  }

  async function loadPaymentInfo() {
    try {
      const res = await fetch('/api/payment-info')
      if (res.ok) {
        const data = await res.json()
        setPaymentInfo({
          pixKey: data.pixKey || '',
          pixKeyType: data.pixKeyType || '',
          coupleNames: data.coupleNames || 'Raiana & Raphael'
        })
      }
    } catch (error) {
      console.error('Erro ao carregar informações de pagamento:', error)
    }
  }

  const availableCount = gifts.filter(g => g.status === 'available').length
  const fulfilledCount = gifts.filter(g => g.status === 'fulfilled').length

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      {/* Header */}
      <section className="relative pt-24 pb-12 px-4">
        {headerImage && (
          <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${headerImage})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDF8F3] via-[#FDF8F3]/95 to-[#FDF8F3]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
            {headerImage ? (
              <Image
                src={headerImage}
                alt="Raiana e Raphael"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-300 flex items-center justify-center">
                <span className="text-3xl">🎁</span>
              </div>
            )}
          </div>
          <p className="text-yellow-600 text-sm uppercase tracking-[0.3em] mb-4">
            Lista de Presentes
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
            {paymentInfo.coupleNames || 'Raiana & Raphael'}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Sua presença é nosso maior presente! Mas se quiser nos presentear, 
            preparamos uma lista com itens que vão nos ajudar a construir nosso novo lar.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-10">
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-600">{availableCount}</p>
              <p className="text-sm text-gray-500">Disponíveis</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">{fulfilledCount}</p>
              <p className="text-sm text-gray-500">Arrecadados</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gradient-gold">{gifts.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gifts Grid */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-500">{error}</p>
              <button
                onClick={loadGifts}
                className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && gifts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <p className="text-gray-500">Nenhum presente cadastrado ainda.</p>
            </div>
          )}

          {!loading && !error && gifts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onContribute={setSelectedGift}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pix Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-yellow-50 to-yellow-100/50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-200 flex items-center justify-center">
            <span className="text-3xl">💝</span>
          </div>
          <h2 className="text-2xl font-serif text-gray-800 mb-4">
            Prefere contribuir com PIX?
          </h2>
          <p className="text-gray-600 mb-8">
            Você também pode nos presentear através de uma contribuição via PIX. 
            Qualquer valor será muito bem-vindo!
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
            <p className="text-sm text-gray-500 mb-2">
              Chave PIX {paymentInfo.pixKeyType ? `(${paymentInfo.pixKeyType})` : ''}
            </p>
            {paymentInfo.pixKey ? (
              <div className="flex items-center gap-3">
                <code className="bg-yellow-50 px-4 py-2 rounded-lg text-yellow-800 font-mono text-sm max-w-[200px] truncate">
                  {paymentInfo.pixKey}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(paymentInfo.pixKey)}
                  className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                  title="Copiar"
                >
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Chave PIX não configurada</p>
            )}
            <p className="text-xs text-gray-400 mt-3">{paymentInfo.coupleNames}</p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 px-4 border-t border-yellow-100">
        <div className="max-w-4xl mx-auto flex justify-center">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar ao Início</span>
          </a>
        </div>
      </section>

      {/* Modal de Pagamento */}
      {selectedGift && (
        <PaymentModal
          gift={selectedGift}
          publicKey={mpPublicKey}
          onClose={() => setSelectedGift(null)}
          onSuccess={loadGifts}
        />
      )}
    </main>
  )
}
