import type { Metadata } from 'next'
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
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
        url: '/og-image.jpg',
        width: 940,
        height: 788,
        alt: 'Raiana e Raphael - Convite de Casamento',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raiana & Raphael - Convite de Casamento',
    description: 'Você está convidado para celebrar nosso amor em um dia especial. 16 de Maio de 2026.',
    images: ['/og-image.jpg'],
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
      <body className={`${playfair.variable} ${cormorant.variable} font-sans antialiased bg-[#FDF8F3]`}>
        {children}
      </body>
    </html>
  )
}
