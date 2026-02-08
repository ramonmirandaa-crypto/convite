'use client'

import { useState, useEffect } from 'react'
import PhotosClient from './PhotosClient'

interface PhotoFromAPI {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: string
  order: number
  isActive: boolean
  createdAt: string
}

export const dynamic = 'force-dynamic'

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoFromAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPhotos()
  }, [])

  async function fetchPhotos() {
    try {
      const res = await fetch('/api/admin/photos')
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar fotos')
      }
      
      setPhotos(data.photos || [])
    } catch (err) {
      console.error('Photos error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar fotos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar fotos</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(''); fetchPhotos() }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // Converter as datas string para Date objects
  const photosWithDates = photos.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt)
  }))

  return <PhotosClient initialPhotos={photosWithDates} />
}
