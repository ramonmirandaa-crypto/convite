'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useGalleryPhotos, useCouplePhotos } from '@/lib/usePhotos'
import { PageLayout, PageContainer } from '../components/PageLayout'
import { FloralDivider, RedRose, OrangeFlower, YellowFlower, GreenLeaf } from '../components/FloralElements'

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
    <PageLayout hideFooter>
      
      {/* Header */}
      <section className="relative pt-24 pb-12 px-4">
        {/* Elementos florais */}
        <div className="absolute top-10 left-[10%] opacity-20 float">
          <RedRose size={60} />
        </div>
        <div className="absolute top-20 right-[8%] opacity-15 float-slow">
          <OrangeFlower size={50} />
        </div>
        <div className="absolute bottom-10 left-[5%] opacity-15">
          <YellowFlower size={40} />
        </div>
        <div className="absolute bottom-20 right-[10%] opacity-10">
          <GreenLeaf size={60} />
        </div>
        
        <PageContainer>
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#D4653C]/30 shadow-xl">
              {headerImage ? (
                <Image
                  src={headerImage}
                  alt="Raiana e Raphael"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#F8F4ED] to-[#FDF9F3] flex items-center justify-center">
                  <span className="text-4xl">💍</span>
                </div>
              )}
            </div>
            <p className="text-[#D4653C] text-sm uppercase tracking-[0.3em] mb-4 font-serif">
              Nossa História em Imagens
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-[#3D3429] mb-4">
              Galeria de Amor
            </h1>
            
            {/* Divider floral */}
            <FloralDivider className="my-6" />
            
            <p className="text-[#6B5D4D] max-w-2xl mx-auto font-serif">
              Cada foto conta um pedaço da nossa história, cada olhar revela o amor que nos une.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Filtros */}
      <section className="px-4 mb-8">
        <PageContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full text-sm transition-all duration-300 font-serif ${
                  filter === category
                    ? 'bg-gradient-to-r from-[#D4653C] to-[#B8333C] text-white shadow-lg'
                    : 'bg-white text-[#6B5D4D] hover:bg-[#F8F4ED] border border-[#D4653C]/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Grid de Fotos */}
      <section className="px-4 pb-24">
        <PageContainer>
          {galleryLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-2 border-[#D4653C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border border-[#D4653C]/10"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D3429]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Info */}
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="font-serif">{photo.title}</p>
                    <p className="text-[#E8B84A] text-sm font-serif">{photo.category}</p>
                  </div>

                  {/* Borda no hover */}
                  <div className="absolute inset-0 border-2 border-[#D4653C]/0 group-hover:border-[#D4653C]/70 rounded-xl transition-colors duration-300" />
                </div>
              ))}
            </div>
          )}

          {!galleryLoading && filteredPhotos.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#F8F4ED] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📷</span>
              </div>
              <p className="text-[#6B5D4D] font-serif">Nenhuma foto encontrada nesta categoria.</p>
            </div>
          )}
        </PageContainer>
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
            <p className="text-white text-xl font-serif">{selectedPhoto.title}</p>
            <p className="text-[#E8B84A] font-serif">{selectedPhoto.category}</p>
          </div>
        </div>
      )}

      {/* Navegação */}
      <section className="py-8 px-4 border-t border-[#D4653C]/10">
        <PageContainer>
          <div className="flex justify-center">
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
        </PageContainer>
      </section>
    </PageLayout>
  )
}
