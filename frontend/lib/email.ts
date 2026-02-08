import { Resend } from 'resend'

// Inicializa o Resend com a API key
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

// Função genérica para enviar email
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  // Se não tem Resend configurado, apenas loga (modo desenvolvimento)
  if (!resend) {
    console.log('📧 Email (modo desenvolvimento):')
    console.log('  Para:', to)
    console.log('  Assunto:', subject)
    console.log('  HTML:', html.substring(0, 200) + '...')
    return { success: true, mock: true }
  }

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Casamento <casamento@seusite.com>',
      to,
      subject,
      html,
      text,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    throw error
  }
}

// Email de confirmação de pagamento
export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  giftTitle: string,
  amount: number,
  paymentMethod: string
) {
  const subject = `🎉 Confirmação de contribuição - ${giftTitle}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Georgia, serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 30px 20px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 16px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #92400e;
          margin: 0;
          font-size: 24px;
        }
        .header p {
          color: #a16207;
          margin: 10px 0 0 0;
        }
        .content {
          background: #fff;
          padding: 30px;
          border-radius: 16px;
          border: 1px solid #fef3c7;
        }
        .gift-box {
          background: #fef3c7;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin: 20px 0;
        }
        .amount {
          font-size: 32px;
          font-weight: bold;
          color: #92400e;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: #fbbf24;
          color: #92400e;
          padding: 12px 30px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 20px;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="emoji">💕</div>
        <h1>Obrigado pela sua contribuição!</h1>
        <p>Raiana & Raphael</p>
      </div>
      
      <div class="content">
        <p>Olá <strong>${name}</strong>,</p>
        
        <p>Agradecemos de coração pelo seu presente! Sua contribuição será muito especial para nós.</p>
        
        <div class="gift-box">
          <p style="margin: 0 0 10px 0; color: #92400e;">Presente</p>
          <h2 style="margin: 0; color: #78350f;">${giftTitle}</h2>
          <div class="amount">R$ ${amount.toFixed(2)}</div>
          <p style="margin: 0; color: #a16207; font-size: 14px;">
            Pagamento via ${paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}
          </p>
        </div>
        
        <p>Estamos muito felizes em contar com a sua presença e apoio neste momento tão especial das nossas vidas.</p>
        
        <p style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Ver site do casamento</a>
        </p>
      </div>
      
      <div class="footer">
        <p>Com amor,<br><strong>Raiana & Raphael</strong></p>
        <p style="font-size: 12px; margin-top: 10px;">
          Este é um email automático. Por favor, não responda.
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
    Obrigado pela sua contribuição!
    
    Olá ${name},
    
    Agradecemos de coração pelo seu presente: ${giftTitle}
    Valor: R$ ${amount.toFixed(2)}
    Pagamento via ${paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}
    
    Estamos muito felizes em contar com a sua presença!
    
    Com amor,
    Raiana & Raphael
  `

  return sendEmail({ to, subject, html, text })
}

// Email de confirmação de RSVP
export async function sendRSVPConfirmationEmail(
  to: string,
  name: string,
  guestCount: number,
  eventDate: string,
  venue: string
) {
  const subject = '💌 Confirmação de Presença - Casamento Raiana & Raphael'
  
  const formattedDate = new Date(eventDate).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Georgia, serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 30px 20px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 16px;
          margin-bottom: 30px;
        }
        .content {
          background: #fff;
          padding: 30px;
          border-radius: 16px;
          border: 1px solid #fef3c7;
        }
        .info-box {
          background: #fef3c7;
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .emoji {
          font-size: 48px;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="emoji">💕</div>
        <h1 style="color: #92400e; margin: 0;">Presença Confirmada!</h1>
        <p style="color: #a16207; margin: 10px 0 0 0;">Raiana & Raphael</p>
      </div>
      
      <div class="content">
        <p>Olá <strong>${name}</strong>,</p>
        
        <p>Estamos muito felizes em confirmar sua presença no nosso casamento!</p>
        
        <div class="info-box">
          <p style="margin: 0 0 10px 0; color: #92400e;"><strong>Detalhes do Evento</strong></p>
          <p style="margin: 5px 0; color: #78350f;"><strong>Data:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0; color: #78350f;"><strong>Local:</strong> ${venue}</p>
          <p style="margin: 5px 0; color: #78350f;"><strong>Número de convidados:</strong> ${guestCount} pessoa(s)</p>
        </div>
        
        <p>Contamos com a sua presença para tornar este dia ainda mais especial!</p>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/gifts" 
             style="display: inline-block; background: #fbbf24; color: #92400e; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">
            Ver Lista de Presentes
          </a>
        </p>
      </div>
      
      <div class="footer">
        <p>Com amor,<br><strong>Raiana & Raphael</strong></p>
      </div>
    </body>
    </html>
  `

  const text = `
    Presença Confirmada!
    
    Olá ${name},
    
    Estamos muito felizes em confirmar sua presença no nosso casamento!
    
    Data: ${formattedDate}
    Local: ${venue}
    Número de convidados: ${guestCount} pessoa(s)
    
    Contamos com a sua presença!
    
    Com amor,
    Raiana & Raphael
  `

  return sendEmail({ to, subject, html, text })
}

// Email de notificação para os noivos
export async function sendNewContributionNotification(
  giftTitle: string,
  contributorName: string,
  amount: number,
  isAnonymous: boolean
) {
  const to = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL
  if (!to) {
    console.log('Email de notificação não enviado: ADMIN_EMAIL não configurado')
    return { success: false, error: 'ADMIN_EMAIL não configurado' }
  }

  const subject = `🎁 Nova contribuição recebida - ${giftTitle}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #92400e;">Nova Contribuição Recebida! 🎉</h2>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p><strong>Presente:</strong> ${giftTitle}</p>
        <p><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
        <p><strong>De:</strong> ${isAnonymous ? 'Anônimo' : contributorName}</p>
      </div>
      
      <p>Acesse o painel administrativo para mais detalhes:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard" 
         style="display: inline-block; background: #fbbf24; color: #92400e; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 10px;">
        Ver Dashboard
      </a>
    </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}
