'use client'

import { useEffect, useRef, useState } from 'react'
import { listGifts, Gift } from '@/lib/api'
import Image from 'next/image'
import { MercadoPagoProvider } from '@/lib/mercadopago-js'
import CardPaymentForm from '@/components/CardPaymentForm'
import { useCouplePhotos } from '@/lib/usePhotos'
import { PageLayout, PageHeader, PageContainer, Card } from '../components/PageLayout'
import { FloralDivider, RedRose, OrangeFlower, YellowFlower, GreenLeaf } from '../components/FloralElements'

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
  const [amount, setAmount] = useState(0)
  const [quotaQuantity, setQuotaQuantity] = useState(1)
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
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const quotaValue = typeof gift.quotaValue === 'number' ? gift.quotaValue : null
  const quotasRemaining = typeof gift.quotasRemaining === 'number' ? gift.quotasRemaining : null
  const canUseQuotas = quotaValue !== null && quotasRemaining !== null && quotaValue > 0
  const quotasAvailable = quotasRemaining ?? 0
  const useRemainingFallback = canUseQuotas && quotasAvailable < 1 && Number(gift.remaining) > 0

  useEffect(() => {
    setStep('form')
    setPaymentMethod('pix')
    setError('')
    setQuotaQuantity(1)

    if (canUseQuotas && quotaValue) {
      setAmount(useRemainingFallback ? (Number(gift.remaining) || 0) : quotaValue)
    } else {
      setAmount(Number(gift.remaining) || 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gift.id])

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
        quotaQuantity: canUseQuotas && !useRemainingFallback ? quotaQuantity : undefined,
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
          setPixData({
            qrCode: data.pixQrCode,
            qrCodeBase64: '',
            copyPasteCode: data.pixCode,
            paymentId: data.contribution.id,
          })
        } else if (data.pix) {
          setPixData({
            qrCode: data.pix.qrCodeBase64,
            qrCodeBase64: data.pix.qrCodeBase64,
            copyPasteCode: data.pix.copyPasteCode,
            paymentId: data.payment.id,
          })
        } else {
          throw new Error('Erro ao gerar QR Code PIX. Tente novamente ou use outro método de pagamento.')
        }
        setStep('pix')
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
          quotaQuantity: canUseQuotas && !useRemainingFallback ? quotaQuantity : undefined,
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
        startPolling(data.contribution.id)
        setStep('pix')
        setPixData(null)
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
        <div className="bg-[#FFFCF8] rounded-2xl p-8 max-w-md w-full text-center border border-[#D4653C]/10">
          <div className="w-20 h-20 bg-[#5B7248]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#5B7248]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-serif text-[#3D3429] mb-2">Pagamento Confirmado!</h3>
          <p className="text-[#6B5D4D] font-serif">Obrigado pela sua contribuição! 💕</p>
        </div>
      </div>
    )
  }

  if (step === 'pix') {
    const isCardProcessing = !pixData
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#FFFCF8] rounded-2xl p-8 max-w-md w-full border border-[#D4653C]/10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-serif text-[#3D3429] mb-2">
              {isCardProcessing ? 'Pagamento em Análise' : 'Pagamento PIX'}
            </h3>
            <p className="text-[#6B5D4D] text-sm font-serif">
              {isCardProcessing
                ? 'Seu pagamento está sendo analisado. Isso pode levar alguns instantes.'
                : 'Escaneie o QR Code ou copie o código'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            {pixData && (
              <>
                <div className="bg-white p-4 rounded-xl border-2 border-[#D4653C]/20">
                  {pixData.qrCodeBase64 ? (
                    <img
                      src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  ) : pixData.qrCode ? (
                    <div className="w-48 h-48 bg-[#F8F4ED] flex items-center justify-center">
                      <img src={pixData.qrCode} alt="QR Code PIX" className="w-44 h-44" />
                    </div>
                  ) : null}
                </div>

                {pixData.copyPasteCode && (
                  <div className="w-full">
                    <p className="text-sm text-[#6B5D4D] mb-2 font-serif">Código Copia e Cola:</p>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-[#F8F4ED] p-3 rounded-lg text-xs break-all text-[#3D3429]">
                        {pixData.copyPasteCode.substring(0, 50)}...
                      </code>
                      <button
                        onClick={copyPixCode}
                        className="px-4 py-2 bg-[#D4653C]/10 text-[#D4653C] rounded-lg hover:bg-[#D4653C]/20 transition font-serif"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {isCardProcessing && (
              <div className="w-20 h-20 bg-[#F8F4ED] rounded-full flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-[#D4653C] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <div className="flex items-center gap-2 text-[#D4653C]">
              <div className="w-2 h-2 bg-[#D4653C] rounded-full animate-pulse" />
              <span className="text-sm font-serif">
                {isCardProcessing ? 'Aguardando confirmação...' : 'Aguardando pagamento...'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-[#9B8B7A] hover:text-[#6B5D4D] text-sm font-serif transition-colors"
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
        <div className="bg-[#FFFCF8] rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-[#D4653C]/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif text-[#3D3429]">Pagamento com Cartão</h3>
            <button
              onClick={() => setStep('form')}
              className="text-[#9B8B7A] hover:text-[#6B5D4D]"
            >
              ← Voltar
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-[#F8F4ED] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#6B5D4D] font-serif">Contribuição para:</p>
            <p className="font-medium text-[#3D3429] font-serif">{gift.title}</p>
            <p className="text-2xl font-bold text-[#D4653C] mt-2 font-serif">
              R$ {amount.toFixed(2)}
            </p>
          </div>

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
            className="w-full mt-4 py-2 text-[#9B8B7A] hover:text-[#6B5D4D] text-sm font-serif transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFCF8] rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-[#D4653C]/10">
        <h3 className="text-2xl font-serif text-[#3D3429] mb-4">
          Contribuir para {gift.title}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">
              {canUseQuotas && !useRemainingFallback ? 'Quantidade de Cotas' : 'Valor da Contribuição (R$)'}
            </label>

            {canUseQuotas && !useRemainingFallback ? (
              <>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(1, quotaQuantity - 1)
                      setQuotaQuantity(next)
                      setAmount((quotaValue || 0) * next)
                    }}
                    disabled={quotaQuantity <= 1}
                    className="w-12 h-12 rounded-full bg-[#F8F4ED] hover:bg-[#D4653C]/10 flex items-center justify-center text-[#6B5D4D] hover:text-[#D4653C] transition-colors disabled:opacity-50 font-serif text-xl"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, quotasAvailable)}
                    step={1}
                    required
                    value={quotaQuantity}
                    onChange={(e) => {
                      const raw = Math.floor(Number(e.target.value))
                      const max = Math.max(1, quotasAvailable)
                      const next = Math.min(max, Math.max(1, Number.isFinite(raw) ? raw : 1))
                      setQuotaQuantity(next)
                      setAmount((quotaValue || 0) * next)
                    }}
                    className="w-24 px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] focus:border-[#D4653C] focus:outline-none text-center font-serif"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const max = Math.max(1, quotasAvailable)
                      const next = Math.min(max, quotaQuantity + 1)
                      setQuotaQuantity(next)
                      setAmount((quotaValue || 0) * next)
                    }}
                    disabled={quotaQuantity >= quotasAvailable}
                    className="w-12 h-12 rounded-full bg-[#F8F4ED] hover:bg-[#D4653C]/10 flex items-center justify-center text-[#6B5D4D] hover:text-[#D4653C] transition-colors disabled:opacity-50 font-serif text-xl"
                  >
                    +
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-[#9B8B7A] font-serif">
                  <span>Valor da cota: R$ {(quotaValue || 0).toFixed(2)}</span>
                  <span>Disponíveis: {quotasRemaining ?? '-'}</span>
                </div>
                <p className="text-xs text-[#9B8B7A] mt-1 font-serif">
                  Restante: R$ {Number(gift.remaining).toFixed(2)}
                </p>
              </>
            ) : (
              <>
                <input
                  type="number"
                  min={1}
                  max={gift.remaining}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] focus:border-[#D4653C] focus:outline-none font-serif"
                />
                {useRemainingFallback && (
                  <p className="text-xs text-[#6B5D4D] mt-1 font-serif">
                    Restante menor que 1 cota. Você pode contribuir com o valor restante.
                  </p>
                )}
                <p className="text-xs text-[#9B8B7A] mt-1 font-serif">
                  Restante: R$ {Number(gift.remaining).toFixed(2)}
                </p>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] focus:border-[#D4653C] focus:outline-none font-serif"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] focus:border-[#D4653C] focus:outline-none font-serif"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">CPF</label>
              <input
                type="text"
                required
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                maxLength={14}
                className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] focus:border-[#D4653C] focus:outline-none font-serif"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Telefone (opcional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] focus:border-[#D4653C] focus:outline-none font-serif"
            />
          </div>

          <div>
            <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Mensagem (opcional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] focus:border-[#D4653C] focus:outline-none resize-none font-serif"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4 text-[#D4653C] rounded focus:ring-[#D4653C]"
            />
            <span className="text-sm text-[#6B5D4D] font-serif">Contribuir anonimamente</span>
          </label>

          <div>
            <label className="block text-sm text-[#6B5D4D] mb-2 font-serif">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 rounded-xl border-2 text-center transition font-serif ${
                  paymentMethod === 'pix'
                    ? 'border-[#D4653C] bg-[#D4653C]/5'
                    : 'border-[#D4653C]/20 hover:border-[#D4653C]/40'
                }`}
              >
                <span className="text-2xl">💠</span>
                <p className="font-medium text-[#3D3429] mt-1">PIX</p>
              </button>
              <button
                type="button"
                disabled={!publicKey || amount < 100 || amount <= 0}
                onClick={() => {
                  setPaymentMethod('card')
                  if (!publicKey) {
                    setError('Pagamento com cartão não configurado. Use PIX ou configure o Mercado Pago.')
                    return
                  }
                  if (amount < 100) {
                    setError('Pagamento com cartão disponível apenas para valores a partir de R$ 100,00.')
                    return
                  }
                  if (publicKey) {
                    setStep('card')
                  } else {
                    setError('Pagamento com cartão não configurado. Use PIX ou configure o Mercado Pago.')
                  }
                }}
                className={`p-4 rounded-xl border-2 text-center transition disabled:opacity-50 disabled:cursor-not-allowed font-serif ${
                  paymentMethod === 'card'
                    ? 'border-[#D4653C] bg-[#D4653C]/5'
                    : 'border-[#D4653C]/20 hover:border-[#D4653C]/40'
                }`}
              >
                <span className="text-2xl">💳</span>
                <p className="font-medium text-[#3D3429] mt-1">Cartão</p>
              </button>
            </div>
            <p className="text-xs text-[#9B8B7A] mt-2 font-serif">
              Cartão: mínimo R$ 100,00. Parcelamento: até 3x, mínimo R$ 80,00 por parcela.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={step === 'loading'}
              className="flex-1 py-3 rounded-full border border-[#D4653C]/20 text-[#6B5D4D] hover:bg-[#F8F4ED] transition-colors disabled:opacity-50 font-serif"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={step === 'loading' || paymentMethod !== 'pix' || amount <= 0}
              className="flex-1 py-3 rounded-full btn-premium text-white disabled:opacity-50 font-serif"
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
    <Card className="overflow-hidden group">
      <div className="relative aspect-video bg-gradient-to-br from-[#F8F4ED] to-[#FDF9F3] flex items-center justify-center">
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
          <div className="absolute inset-0 bg-[#FFFCF8]/90 flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl mb-2 block">✨</span>
              <span className="text-[#D4653C] font-serif font-medium">Presenteado!</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-serif text-[#3D3429] mb-2">{gift.title}</h3>
        {gift.description && (
          <p className="text-[#6B5D4D] text-sm mb-4 font-serif">{gift.description}</p>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#9B8B7A] font-serif">Progresso</span>
            <span className="text-[#D4653C] font-medium font-serif">{progress}%</span>
          </div>
          <div className="h-2 bg-[#F8F4ED] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#E8B84A] to-[#D4653C] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9B8B7A] font-serif">Valor Total</p>
            <p className="text-xl font-serif text-gradient-warm font-semibold">
              R$ {Number(gift.totalValue).toFixed(2)}
            </p>
            {typeof gift.quotaValue === 'number' &&
              typeof gift.quotaTotal === 'number' &&
              gift.quotaTotal > 1 &&
              typeof gift.quotasRemaining === 'number' && (
                <p className="text-xs text-[#9B8B7A] mt-1 font-serif">
                  Cota: R$ {gift.quotaValue.toFixed(2)} • Restam {gift.quotasRemaining}
                </p>
              )}
          </div>

          {gift.status === 'available' ? (
            <button
              onClick={() => onContribute(gift)}
              className="px-6 py-2 bg-[#D4653C]/10 hover:bg-[#D4653C]/20 text-[#D4653C] rounded-full text-sm font-serif font-medium transition-colors"
            >
              Contribuir
            </button>
          ) : (
            <span className="px-4 py-2 bg-[#5B7248]/10 text-[#5B7248] rounded-full text-sm font-serif font-medium">
              Completo
            </span>
          )}
        </div>
      </div>
    </Card>
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
    <PageLayout hideFooter>
      {/* Header */}
      <PageHeader
        title={paymentInfo.coupleNames || 'Raiana & Raphael'}
        subtitle="Lista de Presentes"
        description="Sua presença é nosso maior presente! Mas se quiser nos presentear, preparamos uma lista com itens que vão nos ajudar a construir nosso novo lar."
        imageUrl={headerImage}
        icon="🎁"
        showBackButton={false}
      >
        {/* Stats */}
        <div className="flex justify-center gap-12 mt-10">
          <div className="text-center">
            <p className="text-4xl font-serif text-[#5B7248] font-bold">{availableCount}</p>
            <p className="text-sm text-[#6B5D4D] font-serif">Disponíveis</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-serif text-[#E8B84A] font-bold">{fulfilledCount}</p>
            <p className="text-sm text-[#6B5D4D] font-serif">Arrecadados</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-serif text-gradient-warm font-bold">{gifts.length}</p>
            <p className="text-sm text-[#6B5D4D] font-serif">Total</p>
          </div>
        </div>
      </PageHeader>

      {/* Gifts Grid */}
      <section className="pb-16 px-4">
        <PageContainer>
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-2 border-[#D4653C] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-500 font-serif">{error}</p>
              <button
                onClick={loadGifts}
                className="mt-4 text-[#D4653C] hover:text-[#B8333C] font-medium font-serif transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && gifts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#F8F4ED] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <p className="text-[#6B5D4D] font-serif">Nenhum presente cadastrado ainda.</p>
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
        </PageContainer>
      </section>

      {/* Pix Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#F8F4ED] to-[#FDF9F3]">
        <PageContainer>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F8F4ED] flex items-center justify-center border border-[#D4653C]/10">
              <span className="text-3xl">💝</span>
            </div>
            
            {/* Divider floral */}
            <FloralDivider className="mb-6" />
            
            <h2 className="text-2xl font-serif text-[#3D3429] mb-4">
              Prefere contribuir com PIX?
            </h2>
            <p className="text-[#6B5D4D] mb-8 font-serif">
              Você também pode nos presentear através de uma contribuição via PIX. 
              Qualquer valor será muito bem-vindo!
            </p>
            
            <div className="bg-[#FFFCF8] rounded-2xl p-6 shadow-lg inline-block border border-[#D4653C]/10">
              <p className="text-sm text-[#6B5D4D] mb-2 font-serif">
                Chave PIX {paymentInfo.pixKeyType ? `(${paymentInfo.pixKeyType})` : ''}
              </p>
              {paymentInfo.pixKey ? (
                <div className="flex items-center gap-3">
                  <code className="bg-[#F8F4ED] px-4 py-2 rounded-lg text-[#D4653C] font-mono text-sm max-w-[200px] truncate">
                    {paymentInfo.pixKey}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(paymentInfo.pixKey)}
                    className="p-2 hover:bg-[#D4653C]/10 rounded-lg transition-colors"
                    title="Copiar"
                  >
                    <svg className="w-5 h-5 text-[#D4653C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[#9B8B7A] font-serif">Chave PIX não configurada</p>
              )}
              <p className="text-xs text-[#9B8B7A] mt-3 font-serif">{paymentInfo.coupleNames}</p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Navigation */}
      <section className="py-8 px-4 border-t border-[#D4653C]/10">
        <PageContainer>
          <div className="flex justify-center">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-[#6B5D4D] hover:text-[#D4653C] transition-colors font-serif"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar ao Início</span>
            </a>
          </div>
        </PageContainer>
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
    </PageLayout>
  )
}
