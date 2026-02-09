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

  // Fotos padrão de fallback
  const fallbackPhotos = [
    { id: '1', src: '/Fotos/IMG_0544.png', title: 'Nosso Amor', category: 'Casal' },
    { id: '2', src: '/Fotos/IMG_0548.jpeg', title: 'Momento Especial', category: 'Ensaio' },
    { id: '3', src: '/Fotos/IMG_0549.jpeg', title: 'Juntos Para Sempre', category: 'Casal' },
    { id: '4', src: '/Fotos/IMG_0550.jpeg', title: 'Sorriso de Felicidade', category: 'Ensaio' },
    { id: '5', src: '/Fotos/5e17a544-5f8d-4169-b912-6ac1de30787f.jpeg', title: 'Dia Inesquecível', category: 'Casal' },
    { id: '6', src: '/Fotos/603d0296-8ce6-47ba-8576-05bda785aa80.jpeg', title: 'Amor Verdadeiro', category: 'Ensaio' },
    { id: '7', src: '/Fotos/67695956-b0e1-4c97-a7ba-f37006a2a9ab.jpeg', title: 'Completude', category: 'Casal' },
    { id: '8', src: '/Fotos/9a046fed-3acc-41c3-902e-d7e5f17fc680.jpeg', title: 'Dois Corações', category: 'Ensaio' },
    { id: '9', src: '/Fotos/0abd5f16-6d62-47bb-a804-89a3ad11748b.jpeg', title: 'Carinho', category: 'Casal' },
    { id: '10', src: '/Fotos/166dcb0a-2b44-4547-91c3-7f1f733a9ca6.jpeg', title: 'Ternura', category: 'Ensaio' },
    { id: '11', src: '/Fotos/2bf3d2c2-6041-4450-8eb4-bd41cbb0e891.jpeg', title: 'Harmonia', category: 'Casal' },
    { id: '12', src: '/Fotos/40111ddd-7108-48c6-b256-63ee117fa43e.jpeg', title: 'União', category: 'Ensaio' },
  ]

  // Converte fotos do painel para o formato usado
  const photosFromPanel: Photo[] = galleryPhotos.map(p => ({
    id: p.id,
    src: p.imageUrl,
    title: p.title,
    category: p.category === 'couple' ? 'Casal' : 'Ensaio'
  }))

  // Usa fotos do painel ou fallback
  const photos = galleryPhotos.length > 0 ? photosFromPanel : fallbackPhotos

  const categories = ['Todas', ...Array.from(new Set(photos.map(p => p.category)))]
  
  const filteredPhotos = filter === 'Todas' 
    ? photos 
    : photos.filter(p => p.category === filter)

  const headerImage = couplePhotos.length > 0 
    ? couplePhotos[0].imageUrl 
    : '/Fotos/IMG_0549.jpeg'

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      
      {/* Header */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
            <Image
              src={headerImage}
              alt="Raiana e Raphael"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
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
