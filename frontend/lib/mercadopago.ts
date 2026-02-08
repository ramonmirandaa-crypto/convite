import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

// Configuração do Mercado Pago
export function getMercadoPagoClient(accessToken?: string) {
  const token = accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN
  
  if (!token) {
    throw new Error('Access token do Mercado Pago não configurado')
  }

  return new MercadoPagoConfig({ 
    accessToken: token,
    options: {
      timeout: 5000,
    }
  })
}

// Interface para criação de pagamento PIX
export interface CreatePixPaymentData {
  amount: number
  description: string
  payerEmail: string
  payerName: string
  payerCPF: string
  externalReference: string
}

// Interface para criação de pagamento com cartão
export interface CreateCardPaymentData {
  amount: number
  description: string
  payerEmail: string
  payerName: string
  payerCPF: string
  token: string // Token do cartão gerado no frontend
  installments: number
  paymentMethodId: string
  issuerId?: string
  externalReference: string
}

// Criar pagamento PIX
export async function createPixPayment(data: CreatePixPaymentData, accessToken?: string) {
  const client = getMercadoPagoClient(accessToken)
  const payment = new Payment(client)

  const result = await payment.create({
    body: {
      transaction_amount: data.amount,
      description: data.description,
      payment_method_id: 'pix',
      payer: {
        email: data.payerEmail,
        first_name: data.payerName.split(' ')[0],
        last_name: data.payerName.split(' ').slice(1).join(' ') || ' ',
        identification: {
          type: 'CPF',
          number: data.payerCPF.replace(/\D/g, ''),
        },
      },
      external_reference: data.externalReference,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    },
  })

  return result
}

// Criar pagamento com cartão
export async function createCardPayment(data: CreateCardPaymentData, accessToken?: string) {
  const client = getMercadoPagoClient(accessToken)
  const payment = new Payment(client)

  const result = await payment.create({
    body: {
      transaction_amount: data.amount,
      description: data.description,
      payment_method_id: data.paymentMethodId,
      token: data.token,
      installments: data.installments,
      issuer_id: data.issuerId ? parseInt(data.issuerId, 10) : undefined,
      payer: {
        email: data.payerEmail,
        first_name: data.payerName.split(' ')[0],
        last_name: data.payerName.split(' ').slice(1).join(' ') || ' ',
        identification: {
          type: 'CPF',
          number: data.payerCPF.replace(/\D/g, ''),
        },
      },
      external_reference: data.externalReference,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    },
  })

  return result
}

// Buscar status do pagamento
export async function getPaymentStatus(paymentId: string, accessToken?: string) {
  const client = getMercadoPagoClient(accessToken)
  const payment = new Payment(client)

  const result = await payment.get({ id: paymentId })
  return result
}

// Processar webhook do Mercado Pago
export function processWebhook(body: any) {
  // Tipos de notificação
  const topic = body.topic || body.type
  
  if (topic === 'payment') {
    const paymentId = body.data?.id || body.id
    return {
      type: 'payment',
      paymentId: String(paymentId),
    }
  }

  return { type: 'unknown', data: body }
}

// Mapear status do MP para nosso sistema
export function mapPaymentStatus(mpStatus: string): string {
  const statusMap: Record<string, string> = {
    'approved': 'approved',
    'authorized': 'approved',
    'pending': 'pending',
    'in_process': 'pending',
    'in_mediation': 'pending',
    'rejected': 'rejected',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
    'charged_back': 'refunded',
  }

  return statusMap[mpStatus] || 'pending'
}
