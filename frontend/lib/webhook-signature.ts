import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'

interface SignatureResult {
  valid: boolean
  reason?: string
}

/**
 * Verifica a assinatura HMAC-SHA256 do webhook do Mercado Pago.
 *
 * O MP envia:
 *   Header x-signature: "ts=1704908010,v1=618c853..."
 *   Header x-request-id: "uuid"
 *   Query param data.id: "payment-id"
 *
 * Manifest: "id:{data.id};request-id:{x-request-id};ts:{ts};"
 * HMAC-SHA256(secret, manifest) deve bater com v1.
 */
export function verifyWebhookSignature(
  request: NextRequest,
  secret: string,
): SignatureResult {
  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')

  if (!xSignature || !xRequestId) {
    return { valid: false, reason: 'Missing x-signature or x-request-id headers' }
  }

  // Extrai ts e v1 do header x-signature
  let ts: string | null = null
  let hashReceived: string | null = null

  for (const part of xSignature.split(',')) {
    const [key, ...valueParts] = part.split('=')
    const value = valueParts.join('=') // preserva '=' no hash
    const trimmedKey = key?.trim()
    const trimmedValue = value?.trim()

    if (trimmedKey === 'ts') ts = trimmedValue
    else if (trimmedKey === 'v1') hashReceived = trimmedValue
  }

  if (!ts || !hashReceived) {
    return { valid: false, reason: 'Invalid x-signature format (missing ts or v1)' }
  }

  // Extrai data.id do query string
  const { searchParams } = new URL(request.url)
  const dataId = searchParams.get('data.id') || ''

  // Constrói o manifest conforme documentação do MP
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

  // Calcula HMAC-SHA256
  const hashCalculated = createHmac('sha256', secret)
    .update(manifest)
    .digest('hex')

  // Comparação segura (timing-safe)
  try {
    const bufReceived = Buffer.from(hashReceived, 'hex')
    const bufCalculated = Buffer.from(hashCalculated, 'hex')
    if (bufReceived.length !== bufCalculated.length) {
      return { valid: false, reason: 'Signature length mismatch' }
    }
    const isValid = timingSafeEqual(bufReceived, bufCalculated)
    return isValid
      ? { valid: true }
      : { valid: false, reason: 'Signature mismatch' }
  } catch {
    return { valid: false, reason: 'Invalid signature encoding' }
  }
}
