import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
})

const FROM = process.env.EMAIL_FROM || 'casamento@exemplo.com'

export async function sendRSVPConfirmation(to: string, guestName: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL SKIP] RSVP confirmation to ${to} (SMTP not configured)`)
    return
  }

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Presença Confirmada!',
    html: `
      <h2>Olá, ${guestName}!</h2>
      <p>Sua presença foi confirmada com sucesso. Estamos muito felizes em contar com você!</p>
      <p>Nos vemos na cerimônia!</p>
    `,
  })
}

export async function sendContributionConfirmation(to: string, payerName: string, giftTitle: string, amount: number) {
  if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL SKIP] Contribution confirmation to ${to} (SMTP not configured)`)
    return
  }

  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Contribuição Recebida!',
    html: `
      <h2>Obrigado, ${payerName}!</h2>
      <p>Recebemos sua contribuição de <strong>${formatted}</strong> para <strong>${giftTitle}</strong>.</p>
      <p>Agradecemos de coração pela sua generosidade!</p>
    `,
  })
}
