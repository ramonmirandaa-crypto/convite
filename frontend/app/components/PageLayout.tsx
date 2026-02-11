'use client'

import Link from 'next/link'
import { FloralDivider, FloralPattern, RedRose, OrangeFlower, YellowFlower, FloralCorner } from './FloralElements'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  hideFooter?: boolean
}

export function PageLayout({ children, className = '', hideFooter = false }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-[#F8F4ED] relative ${className}`}>
      {/* Pattern de fundo sutil */}
      <FloralPattern />
      
      {children}
      
      {!hideFooter && <SimpleFooter />}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  icon?: string
  imageUrl?: string | null
  showBackButton?: boolean
  children?: React.ReactNode
}

export function PageHeader({ 
  title, 
  subtitle, 
  description, 
  icon = '💍',
  imageUrl,
  showBackButton = true,
  children
}: PageHeaderProps) {
  return (
    <section className="relative pt-24 pb-12 px-4">
      {/* Elementos florais decorativos */}
      <div className="absolute top-10 left-10 opacity-20 float">
        <RedRose size={50} />
      </div>
      <div className="absolute top-20 right-10 opacity-15 float-slow">
        <OrangeFlower size={40} />
      </div>
      <div className="absolute bottom-10 left-[5%] opacity-15">
        <YellowFlower size={35} />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Foto do casal */}
        {imageUrl && (
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#D4653C]/30 shadow-xl">
            <img
              src={imageUrl}
              alt="Raiana e Raphael"
              className="object-cover w-full h-full"
            />
          </div>
        )}
        
        {/* Ícone quando não há imagem */}
        {!imageUrl && (
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#F8F4ED] to-[#FDF9F3] flex items-center justify-center border-2 border-[#D4653C]/20 shadow-lg">
            <span className="text-3xl">{icon}</span>
          </div>
        )}
        
        {/* Subtítulo */}
        {subtitle && (
          <p className="text-[#D4653C] text-sm uppercase tracking-[0.3em] mb-4 font-serif">
            {subtitle}
          </p>
        )}
        
        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-serif text-[#3D3429] mb-4">
          {title}
        </h1>
        
        {/* Divider floral */}
        <FloralDivider className="my-6" />
        
        {/* Descrição */}
        {description && (
          <p className="text-[#6B5D4D] max-w-2xl mx-auto font-serif">
            {description}
          </p>
        )}
        
        {/* Conteúdo adicional */}
        {children}
        
        {/* Botão voltar */}
        {showBackButton && (
          <div className="mt-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[#6B5D4D] hover:text-[#D4653C] transition-colors font-serif"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar ao Início</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export function SimpleFooter() {
  return (
    <footer className="relative py-8 px-4 border-t border-[#D4653C]/10 bg-[#FFFCF8]">
      <FloralPattern />
      
      <div className="relative max-w-4xl mx-auto">
        {/* Divider floral */}
        <div className="flex justify-center mb-6">
          <FloralDivider />
        </div>
        
        <div className="text-center">
          <Link href="/" className="text-3xl font-serif text-gradient-warm hover:opacity-80 transition-opacity">
            R & R
          </Link>
          <p className="text-[#9B8B7A] text-sm mt-2 font-serif">
            Raiana & Raphael ❤️ 16 de Maio de 2026
          </p>
        </div>
      </div>
    </footer>
  )
}

export function PageContainer({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`relative max-w-6xl mx-auto px-4 ${className}`}>
      {children}
    </div>
  )
}

export function Card({ 
  children, 
  className = '',
  hover = true 
}: { 
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={`
      bg-[#FFFCF8] rounded-2xl 
      border border-[#D4653C]/10 
      shadow-lg shadow-[#D4653C]/5
      ${hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

export function Button({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline'
}) {
  const variants = {
    primary: 'btn-premium',
    secondary: 'bg-[#F8F4ED] text-[#D4653C] hover:bg-[#FDF9F3] border border-[#D4653C]/20',
    outline: 'border-2 border-[#D4653C] text-[#D4653C] hover:bg-[#D4653C]/5'
  }
  
  return (
    <button 
      className={`px-6 py-3 rounded-full font-serif font-medium transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({ 
  className = '',
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`
        w-full px-4 py-3 
        bg-[#FFFCF8] 
        border border-[#D4653C]/20 
        rounded-xl 
        text-[#3D3429] placeholder-[#9B8B7A]
        focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10
        transition-all font-serif
        ${className}
      `}
      {...props}
    />
  )
}

export function TextArea({ 
  className = '',
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`
        w-full px-4 py-3 
        bg-[#FFFCF8] 
        border border-[#D4653C]/20 
        rounded-xl 
        text-[#3D3429] placeholder-[#9B8B7A]
        focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10
        transition-all font-serif resize-none
        ${className}
      `}
      {...props}
    />
  )
}
