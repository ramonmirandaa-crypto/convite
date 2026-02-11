import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://weending.vercel.app'),
  title: 'Raiana & Raphael - Convite de Casamento',
  description: 'Com imensa alegria, convidamos você para celebrar conosco o início da nossa eternidade. Um dia de amor, união e bênçãos.',
  keywords: ['casamento', 'Raiana', 'Raphael', 'convite', 'wedding', '16 de maio de 2026'],
  authors: [{ name: 'Raiana & Raphael' }],
  creator: 'Raiana & Raphael',
  publisher: 'Raiana & Raphael',
  robots: 'index, follow',
  openGraph: {
    title: 'Raiana & Raphael - Convite de Casamento',
    description: 'Você está convidado para celebrar nosso amor em um dia especial. 16 de Maio de 2026.',
    type: 'website',
    url: 'https://weending.vercel.app',
    siteName: 'Raiana & Raphael - Casamento',
    locale: 'pt_BR',
    images: [
      {
        url: 'https://weending.vercel.app/og-image.png',
        width: 1536,
        height: 1024,
        alt: 'Raiana e Raphael - Convite de Casamento',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raiana & Raphael - Convite de Casamento',
    description: 'Você está convidado para celebrar nosso amor em um dia especial. 16 de Maio de 2026.',
    images: ['https://weending.vercel.app/og-image.png'],
    creator: '@raianaeraphael',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'weending-verification',
  },
  alternates: {
    canonical: 'https://weending.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${cormorant.variable} font-serif antialiased bg-[#F8F4ED] text-[#3D3429]`}>
        {children}
      </body>
    </html>
  )
}
