'use client'

import { useState, useEffect } from 'react'
import {
  useMercadoPago,
  useIdentificationTypes,
  useCardTokenization,
  usePaymentMethods,
} from '@/lib/mercadopago-js'

interface CardPaymentFormProps {
  publicKey: string
  amount: number
  onSubmit: (cardToken: string, paymentMethodId: string, installments: number) => void
  onError: (error: string) => void
}

// Função para formatar número do cartão
function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
    .slice(0, 23)
}

// Função para formatar data de expiração
function formatExpiry(value: string): { month: string; year: string } {
  const clean = value.replace(/\D/g, '').slice(0, 4)
  const month = clean.slice(0, 2)
  const year = clean.slice(2, 4)
  return { month, year }
}

// Detectar bandeira do cartão
function detectCardBrand(bin: string): string {
  if (bin.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(bin)) return 'mastercard'
  if (/^3[47]/.test(bin)) return 'amex'
  if (/^3(?:0[0-5]|[68])/.test(bin)) return 'diners'
  if (/^6(?:011|5)/.test(bin)) return 'discover'
  if (/^(?:2131|1800|35)/.test(bin)) return 'jcb'
  if (/^50/.test(bin)) return 'aura'
  if (/^636/.test(bin)) return 'hipercard'
  if (/^5067/.test(bin)) return 'elo'
  return 'unknown'
}

function fallbackPaymentMethodIdFromBrand(brand: string): string | null {
  // Mercado Pago usa ids como "master" (nao "mastercard").
  const map: Record<string, string> = {
    visa: 'visa',
    mastercard: 'master',
    amex: 'amex',
    diners: 'diners',
    discover: 'discover',
    jcb: 'jcb',
    aura: 'aura',
    hipercard: 'hipercard',
    elo: 'elo',
  }
  return map[brand] || null
}

// Ícones das bandeiras
const cardIcons: Record<string, string> = {
  visa: '💳 Visa',
  mastercard: '💳 Mastercard',
  amex: '💳 Amex',
  diners: '💳 Diners',
  discover: '💳 Discover',
  jcb: '💳 JCB',
  aura: '💳 Aura',
  hipercard: '💳 Hipercard',
  elo: '💳 Elo',
  unknown: '💳 Cartão',
}

export default function CardPaymentForm({
  publicKey,
  amount,
  onSubmit,
  onError,
}: CardPaymentFormProps) {
  const { mp, isLoading: mpLoading, error: mpError } = useMercadoPago()
  const { types: idTypes, isLoading: idTypesLoading } = useIdentificationTypes()
  const { createCardToken, isTokenizing } = useCardTokenization()

  const [cardNumber, setCardNumber] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [idType, setIdType] = useState('CPF')
  const [idNumber, setIdNumber] = useState('')
  const [installments, setInstallments] = useState(1)
  const [cardBrand, setCardBrand] = useState('unknown')
  const [installmentsOptions, setInstallmentsOptions] = useState<any[]>([])
  const bin = cardNumber.replace(/\D/g, '').slice(0, 6)
  const { methods: paymentMethods } = usePaymentMethods(bin)

  // Atualiza a bandeira quando o número muda
  useEffect(() => {
    if (bin.length >= 4) {
      setCardBrand(detectCardBrand(bin))
    } else {
      setCardBrand('unknown')
    }
  }, [bin])

  // Busca parcelas quando tem cartão suficiente
  useEffect(() => {
    if (mp && bin.length >= 6 && amount > 0) {
      mp.getInstallments({
        amount: amount.toString(),
        bin,
      }).then((result) => {
        if (result && result.length > 0) {
          setInstallmentsOptions(result[0].payer_costs || [])
        }
      }).catch(console.error)
    }
  }, [mp, cardNumber, amount])

  // Formata CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mp) {
      onError('Mercado Pago não inicializado')
      return
    }

    const { month, year } = formatExpiry(expiry)
    const cleanIdNumber = idNumber.replace(/\D/g, '')

    try {
      // Resolve o paymentMethodId real do MP (evita usar heuristica "mastercard" que costuma falhar).
      let paymentMethodId: string | null = paymentMethods?.[0]?.id || null
      if (!paymentMethodId && bin.length >= 6) {
        try {
          const result = await mp.getPaymentMethods({ bin })
          paymentMethodId = result?.results?.[0]?.id || null
        } catch {
          // Ignora e tenta fallback abaixo.
        }
      }
      if (!paymentMethodId) {
        paymentMethodId = fallbackPaymentMethodIdFromBrand(cardBrand)
      }
      if (!paymentMethodId) {
        onError('Nao foi possivel identificar o metodo de pagamento do cartao (bandeira).')
        return
      }

      const cardToken = await createCardToken({
        cardNumber: cardNumber.replace(/\D/g, ''),
        cardholderName,
        cardExpirationMonth: month,
        cardExpirationYear: `20${year}`,
        securityCode: cvv,
        identificationType: idType,
        identificationNumber: cleanIdNumber,
      })

      if (cardToken) {
        onSubmit(cardToken, paymentMethodId, installments)
      } else {
        onError('Erro ao gerar token do cartão')
      }
    } catch (err: any) {
      onError(err.message || 'Erro ao processar cartão')
    }
  }

  if (mpLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Carregando...</span>
      </div>
    )
  }

  if (mpError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Erro ao carregar Mercado Pago: {mpError}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Número do Cartão */}
      <div>
        <label className="block text-sm text-gray-600 mb-2">
          Número do Cartão {cardIcons[cardBrand]}
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          maxLength={23}
          required
          disabled={isTokenizing}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
        />
      </div>

      {/* Nome no Cartão */}
      <div>
        <label className="block text-sm text-gray-600 mb-2">
          Nome no Cartão
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
          placeholder="NOME COMO ESTÁ NO CARTÃO"
          required
          disabled={isTokenizing}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
        />
      </div>

      {/* Data de Validade e CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Validade (MM/AA)
          </label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => {
              const clean = e.target.value.replace(/\D/g, '').slice(0, 4)
              if (clean.length >= 2) {
                setExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`)
              } else {
                setExpiry(clean)
              }
            }}
            placeholder="MM/AA"
            maxLength={5}
            required
            disabled={isTokenizing}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            CVV
          </label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            maxLength={4}
            required
            disabled={isTokenizing}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Tipo e Número de Identificação */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Documento
          </label>
          <select
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            disabled={isTokenizing || idTypesLoading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
          >
            <option value="CPF">CPF</option>
            <option value="CNPJ">CNPJ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Número
          </label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(formatCPF(e.target.value))}
            placeholder="000.000.000-00"
            required
            disabled={isTokenizing}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Parcelas */}
      {installmentsOptions.length > 0 && (
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Parcelas
          </label>
          <select
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            disabled={isTokenizing}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none"
          >
            {installmentsOptions.map((option: any) => (
              <option key={option.installments} value={option.installments}>
                {option.installments}x de R$ {option.installment_amount?.toFixed(2)} 
                {option.installments > 1 && option.labels?.includes('zero_interest') && ' (sem juros)'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Botão de Submit */}
      <button
        type="submit"
        disabled={isTokenizing || !cardNumber || !cardholderName || !expiry || !cvv || !idNumber}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTokenizing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processando...
          </span>
        ) : (
          `Pagar R$ ${amount.toFixed(2)}`
        )}
      </button>

      {/* Segurança */}
      <p className="text-xs text-gray-400 text-center">
        🔒 Pagamento seguro processado por Mercado Pago. 
        Seus dados de cartão são criptografados.
      </p>
    </form>
  )
}
