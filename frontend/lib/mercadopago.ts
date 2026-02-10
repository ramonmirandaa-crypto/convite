import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

// Configuração do Mercado Pago
export function getMercadoPagoClient(accessToken?: string) {
  const token =
    accessToken ||
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    process.env.MP_ACCESS_TOKEN
  
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

function getWebhookUrl(): string | undefined {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

  if (!appUrl) {
    // Sem URL pública, omite notification_url. O pagamento funciona,
    // mas não receberemos webhooks — o polling de status ainda funciona.
    console.warn('[MP] NEXT_PUBLIC_APP_URL não configurado — webhook de pagamento desabilitado')
    return undefined
  }

  // Garante que não envia localhost (MP rejeita URLs não-públicas)
  if (appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
    console.warn('[MP] NEXT_PUBLIC_APP_URL aponta para localhost — webhook omitido')
    return undefined
  }

  return `${appUrl}/api/payments/webhook`
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

  const webhookUrl = getWebhookUrl()
  const body: any = {
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
  }
  if (webhookUrl) {
    body.notification_url = webhookUrl
  }

  const result = await payment.create({ body })
  return result
}

// Criar pagamento com cartão
export async function createCardPayment(data: CreateCardPaymentData, accessToken?: string) {
  const client = getMercadoPagoClient(accessToken)
  const payment = new Payment(client)

  const webhookUrl = getWebhookUrl()
  const body: any = {
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
  }
  if (webhookUrl) {
    body.notification_url = webhookUrl
  }

  const result = await payment.create({ body })
  return result
}

// Buscar status do pagamento
export async function getPaymentStatus(paymentId: string, accessToken?: string) {
  const client = getMercadoPagoClient(accessToken)
  const payment = new Payment(client)

  // O SDK do MP espera id como string, mas garante que é um ID válido
  const cleanId = paymentId.trim()
  if (!cleanId || cleanId.startsWith('pending_')) {
    throw new Error('ID de pagamento inválido ou pendente')
  }

  const result = await payment.get({ id: cleanId })
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
