'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: string
  order: number
  isActive: boolean
  createdAt: Date
}

interface PhotosClientProps {
  initialPhotos: Photo[]
}

export default function PhotosClient({ initialPhotos }: PhotosClientProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      imageUrl: formData.get('imageUrl'),
      category: formData.get('category'),
      order: parseInt(formData.get('order') as string) || 0
    }

    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        const newPhoto = await res.json()
        setPhotos([newPhoto, ...photos])
        e.currentTarget.reset()
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao adicionar foto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return

    try {
      const res = await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPhotos(photos.filter(p => p.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao excluir foto:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Gerenciar Fotos</h1>

      {/* Add Photo Form */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Nova Foto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                placeholder="Ex: Nosso Primeiro Encontro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                name="category"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              >
                <option value="gallery">Galeria</option>
                <option value="banner">Banner</option>
                <option value="couple">Casal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <input
              type="text"
              name="description"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              placeholder="Descrição opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Imagem *
            </label>
            <input
              type="url"
              name="imageUrl"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              placeholder="https://exemplo.com/foto.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cole o link direto da imagem (ex: Imgur, Cloudinary, etc.)
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-premium px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Adicionando...' : 'Adicionar Foto'}
            </button>
          </div>
        </form>
      </div>

      {/* Photos Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Fotos na Galeria ({photos.length})
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-yellow-100"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/><text fill="%239ca3af" x="50" y="50" text-anchor="middle" dy=".3em">📷</text></svg>'
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white font-medium text-sm truncate">{photo.title}</p>
                <p className="text-white/70 text-xs capitalize">{photo.category}</p>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📸</div>
            <p>Nenhuma foto na galeria</p>
            <p className="text-sm mt-1">Adicione fotos usando o formulário acima</p>
          </div>
        )}
      </div>
    </div>
  )
}
