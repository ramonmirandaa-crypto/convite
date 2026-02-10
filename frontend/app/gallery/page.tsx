'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useGalleryPhotos, useCouplePhotos } from '@/lib/usePhotos'

interface Photo {
  id: string
  src: string
  title: string
  category: string
}

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [filter, setFilter] = useState('Todas')
  
  const { photos: galleryPhotos, loading: galleryLoading } = useGalleryPhotos(50)
  const { photos: couplePhotos } = useCouplePhotos(1)

  // Fotos vindas do painel de controle
  const photos: Photo[] = galleryPhotos.map(p => ({
    id: p.id,
    src: p.imageUrl,
    title: p.title,
    category: p.category === 'couple' ? 'Casal' : 'Ensaio'
  }))

  const categories = ['Todas', ...Array.from(new Set(photos.map(p => p.category)))]
  
  const filteredPhotos = filter === 'Todas' 
    ? photos 
    : photos.filter(p => p.category === filter)

  const headerImage = couplePhotos.length > 0 ? couplePhotos[0].imageUrl : null

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      
      {/* Header */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
            {headerImage ? (
              <Image
                src={headerImage}
                alt="Raiana e Raphael"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-300 flex items-center justify-center">
                <span className="text-4xl">💍</span>
              </div>
            )}
          </div>
          <p className="text-yellow-600 text-sm uppercase tracking-[0.3em] mb-4">
            Nossa História em Imagens
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
            Galeria de Amor
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Cada foto conta um pedaço da nossa história, cada olhar revela o amor que nos une.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="px-4 mb-8">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full text-sm transition-all duration-300 ${
                filter === category
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-yellow-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de Fotos */}
      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {galleryLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Info */}
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="font-medium">{photo.title}</p>
                    <p className="text-yellow-300 text-sm">{photo.category}</p>
                  </div>

                  {/* Borda dourada no hover */}
                  <div className="absolute inset-0 border-2 border-yellow-400/0 group-hover:border-yellow-400/70 rounded-xl transition-colors duration-300" />
                </div>
              ))}
            </div>
          )}

          {!galleryLoading && filteredPhotos.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📷</span>
              </div>
              <p className="text-gray-500">Nenhuma foto encontrada nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div 
            className="relative max-w-5xl max-h-[85vh] aspect-[3/4] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              fill
              className="object-contain rounded-lg"
            />
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-white text-xl font-medium">{selectedPhoto.title}</p>
            <p className="text-yellow-400">{selectedPhoto.category}</p>
          </div>
        </div>
      )}

      {/* Navegação */}
      <section className="py-8 px-4 border-t border-yellow-100">
        <div className="max-w-4xl mx-auto flex justify-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
