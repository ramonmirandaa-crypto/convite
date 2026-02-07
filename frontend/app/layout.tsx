import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Ana & Pedro - Convite de Casamento',
  description: 'Com a bênção de Deus e a alegria de nossas famílias, convidamos você para celebrar conosco o dia mais especial de nossas vidas.',
  keywords: ['casamento', 'convite', 'casamento ana e pedro', 'wedding invitation'],
  openGraph: {
    title: 'Ana & Pedro - Convite de Casamento',
    description: '15 de Dezembro de 2025 - Igreja Matriz de São Paulo',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
