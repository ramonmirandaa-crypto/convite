'use client'

import { useEffect, useRef, useState, createContext, useContext, ReactNode } from 'react'

// Tipos do Mercado Pago
interface MercadoPagoInstance {
  bricks: () => Promise<any>
  cardForm: (config: any) => any
  getIdentificationTypes: () => Promise<any[]>
  getPaymentMethods: (config: { bin: string }) => Promise<any>
  getIssuers: (config: { paymentMethodId: string; bin: string }) => Promise<any[]>
  getInstallments: (config: { amount: string; bin: string }) => Promise<any[]>
  createCardToken: (cardData: CardTokenData) => Promise<{ id: string }>
}

interface CardTokenData {
  cardNumber: string
  cardholderName: string
  cardExpirationMonth: string
  cardExpirationYear: string
  securityCode: string
  identificationType: string
  identificationNumber: string
}

// Contexto do Mercado Pago
interface MercadoPagoContextType {
  mp: MercadoPagoInstance | null
  isLoading: boolean
  error: string | null
}

const MercadoPagoContext = createContext<MercadoPagoContextType>({
  mp: null,
  isLoading: true,
  error: null,
})

export const useMercadoPago = () => useContext(MercadoPagoContext)

// Provider Component
interface MercadoPagoProviderProps {
  children: ReactNode
  publicKey: string
}

export function MercadoPagoProvider({ children, publicKey }: MercadoPagoProviderProps) {
  const [mp, setMp] = useState<MercadoPagoInstance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current || !publicKey) {
      setIsLoading(false)
      return
    }

    const loadMercadoPago = async () => {
      try {
        // Verifica se o script já existe
        if (document.getElementById('mercadopago-sdk')) {
          if (window.MercadoPago) {
            setMp(new window.MercadoPago(publicKey))
            setIsLoading(false)
          }
          return
        }

        // Carrega o script
        const script = document.createElement('script')
        script.id = 'mercadopago-sdk'
        script.src = 'https://sdk.mercadopago.com/js/v2'
        script.async = true
        script.onload = () => {
          if (window.MercadoPago) {
            setMp(new window.MercadoPago(publicKey))
            scriptLoaded.current = true
          } else {
            setError('Falha ao carregar SDK do Mercado Pago')
          }
          setIsLoading(false)
        }
        script.onerror = () => {
          setError('Erro ao carregar SDK do Mercado Pago')
          setIsLoading(false)
        }

        document.body.appendChild(script)
      } catch (err) {
        setError('Erro ao inicializar Mercado Pago')
        setIsLoading(false)
      }
    }

    loadMercadoPago()
  }, [publicKey])

  return (
    <MercadoPagoContext.Provider value={{ mp, isLoading, error }}>
      {children}
    </MercadoPagoContext.Provider>
  )
}

// Hook para tokenização de cartão
export function useCardTokenization() {
  const { mp, isLoading, error } = useMercadoPago()
  const [isTokenizing, setIsTokenizing] = useState(false)

  const createCardToken = async (cardData: CardTokenData): Promise<string | null> => {
    if (!mp) {
      throw new Error('Mercado Pago não inicializado')
    }

    setIsTokenizing(true)
    try {
      const result = await mp.createCardToken(cardData)
      return result.id
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao tokenizar cartão')
    } finally {
      setIsTokenizing(false)
    }
  }

  return {
    createCardToken,
    isTokenizing,
    isLoading,
    error,
  }
}

// Hook para buscar tipos de identificação
export function useIdentificationTypes() {
  const { mp } = useMercadoPago()
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!mp) return

    const fetchTypes = async () => {
      setIsLoading(true)
      try {
        const result = await mp.getIdentificationTypes()
        setTypes(result)
      } catch (error) {
        console.error('Erro ao buscar tipos de identificação:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTypes()
  }, [mp])

  return { types, isLoading }
}

// Hook para buscar métodos de pagamento
export function usePaymentMethods(bin: string) {
  const { mp } = useMercadoPago()
  const [methods, setMethods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!mp || bin.length < 6) {
      setMethods([])
      return
    }

    const fetchMethods = async () => {
      setIsLoading(true)
      try {
        const result = await mp.getPaymentMethods({ bin })
        setMethods(result.results || [])
      } catch (error) {
        console.error('Erro ao buscar métodos de pagamento:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMethods()
  }, [mp, bin])

  return { methods, isLoading }
}

// Hook para buscar parcelas
export function useInstallments(amount: number, bin: string) {
  const { mp } = useMercadoPago()
  const [installments, setInstallments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!mp || bin.length < 6 || amount <= 0) {
      setInstallments([])
      return
    }

    const fetchInstallments = async () => {
      setIsLoading(true)
      try {
        const result = await mp.getInstallments({
          amount: amount.toString(),
          bin,
        })
        if (result && result.length > 0) {
          setInstallments(result[0].payer_costs || [])
        }
      } catch (error) {
        console.error('Erro ao buscar parcelas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstallments()
  }, [mp, amount, bin])

  return { installments, isLoading }
}

// Declaração global para TypeScript
declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: any) => MercadoPagoInstance
  }
}
