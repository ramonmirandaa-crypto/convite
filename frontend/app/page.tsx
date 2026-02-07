import { Button } from '@/components/ui/Button'
import { FloralDivider, HeartDecoration } from '@/components/FloralDecoration'

export default function Home() {
  const navItems = [
    { href: '/welcome', label: 'Bem-vindos', icon: '💕', description: 'Conheça nossa história' },
    { href: '/rsvp', label: 'Confirmar Presença', icon: '✉️', description: 'Reserve sua vaga' },
    { href: '/gifts', label: 'Lista de Presentes', icon: '🎁', description: 'Escolha seu presente' },
    { href: '/gallery', label: 'Galeria', icon: '📸', description: 'Nossos momentos' },
    { href: '/contact', label: 'Contato', icon: '💌', description: 'Envie uma mensagem' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Pre-title */}
          <p className="text-rose-500 text-lg sm:text-xl font-medium tracking-widest uppercase mb-4">
            Convite de Casamento
          </p>

          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl font-bold text-gray-800 mb-6">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-amber-400">
              Ana & Pedro
            </span>
          </h1>

          <FloralDivider />

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
            Com a bênção de Deus e a alegria de nossas famílias, 
            convidamos você para celebrar conosco o dia mais especial de nossas vidas
          </p>

          {/* Date highlight */}
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg mb-12">
            <HeartDecoration className="w-5 h-5" />
            <span className="text-gray-700 font-medium">15 de Dezembro de 2025</span>
            <HeartDecoration className="w-5 h-5" />
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block">{item.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-rose-600 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <Button href="/rsvp" size="lg" icon="💌">
              Confirmar Minha Presença
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <FloralDivider />
          <blockquote className="text-2xl sm:text-3xl text-gray-700 italic font-light leading-relaxed">
            "O amor é paciente, o amor é bondoso. 
            Não inveja, não se vangloria, não se orgulha."
          </blockquote>
          <p className="mt-4 text-rose-500 font-medium">— 1 Coríntios 13:4-8</p>
          <FloralDivider />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gradient-to-t from-rose-100 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">
            Feito com <HeartDecoration className="w-4 h-4 inline" /> por Ana & Pedro
          </p>
          <p className="text-sm text-gray-500 mt-2">
            15 de Dezembro de 2025
          </p>
        </div>
      </footer>
    </main>
  )
}
