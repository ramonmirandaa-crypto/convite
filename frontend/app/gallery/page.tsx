'use client'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { FloralDivider } from '@/components/FloralDecoration'

// Placeholder photos - em produção, substituir por fotos reais
const photos = [
  { id: 1, title: 'Nosso Primeiro Encontro', date: '2022' },
  { id: 2, title: 'Primeira Viagem', date: '2022' },
  { id: 3, title: 'Aniversário de Namoro', date: '2023' },
  { id: 4, title: 'Pedido de Casamento', date: '2024' },
  { id: 5, title: 'Ensaio Pré-Wedding', date: '2025' },
  { id: 6, title: 'Chá de Panela', date: '2025' },
]

export default function Gallery() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      {/* Header */}
      <section className="pt-16 pb-8 px-4 text-center">
        <p className="text-rose-500 text-lg tracking-widest uppercase mb-4">
          Galeria
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          Nossa História
        </h1>
        <FloralDivider />
        <p className="text-gray-600 max-w-2xl mx-auto">
          Momentos especiais que marcaram nossa jornada de amor até aqui.
        </p>
      </section>

      {/* Gallery Grid */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <Card 
                key={photo.id} 
                className={`group overflow-hidden cursor-pointer ${
                  index === 0 || index === 3 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="aspect-[4/5] bg-gradient-to-br from-rose-100 to-amber-100 relative overflow-hidden">
                  {/* Placeholder - substituir por img real */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-20 h-20 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold">{photo.title}</p>
                    <p className="text-white/80 text-sm">{photo.date}</p>
                  </div>

                  {/* Corner decoration */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Upload CTA */}
          <Card className="mt-12 bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-dashed border-rose-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Envie suas fotos do casamento!
              </h3>
              <p className="text-gray-600 mb-4">
                Após o evento, envie suas fotos para nossa galeria.
              </p>
              <Button variant="outline">
                Enviar Fotos
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto flex justify-center">
          <Button href="/" variant="ghost" icon="←">
            Voltar ao Início
          </Button>
        </div>
      </section>
    </main>
  )
}
