'use client'

import { useState, useEffect } from 'react'

interface Photo {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: string
  order: number
  isActive: boolean
  createdAt: string
}

interface UsePhotosOptions {
  category?: string
  limit?: number
}

export function usePhotos(options: UsePhotosOptions = {}) {
  const { category = 'all', limit = 50 } = options
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPhotos() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (category && category !== 'all') params.set('category', category)
        if (limit) params.set('limit', limit.toString())

        const res = await fetch(`/api/photos?${params.toString()}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao carregar fotos')
        }

        setPhotos(data.photos || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar fotos')
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [category, limit])

  return { photos, loading, error }
}

interface UsePreferredPhotoOptions {
  categories: string[]
}

// Busca a primeira foto ativa baseada em prioridade de categorias.
// Ex: ['couple', 'banner', 'gallery', 'all'] (all = qualquer categoria).
export function usePreferredPhoto({ categories }: UsePreferredPhotoOptions) {
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categoriesKey = categories.join(',')

  useEffect(() => {
    let cancelled = false

    async function fetchPreferred() {
      try {
        setLoading(true)
        setError(null)
        setPhoto(null)

        for (const category of categories) {
          const params = new URLSearchParams()
          if (category && category !== 'all') params.set('category', category)
          params.set('limit', '1')

          const res = await fetch(`/api/photos?${params.toString()}`)
          const data = await res.json().catch(() => ({}))

          if (!res.ok) {
            throw new Error((data as any).error || 'Erro ao carregar fotos')
          }

          const found = Array.isArray((data as any).photos) ? ((data as any).photos as Photo[]) : []
          if (found.length > 0) {
            if (!cancelled) setPhoto(found[0])
            return
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar fotos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // Não faz request se a lista vier vazia por engano.
    if (categories.length === 0) {
      setLoading(false)
      setPhoto(null)
      return
    }

    fetchPreferred()

    return () => {
      cancelled = true
    }
  }, [categoriesKey])

  return { photo, loading, error }
}

// Hook específico para fotos do casal (hero)
export function useCouplePhotos(limit = 5) {
  return usePhotos({ category: 'couple', limit })
}

// Hook específico para galeria
export function useGalleryPhotos(limit = 50) {
  return usePhotos({ category: 'gallery', limit })
}

// Hook para todas as fotos ativas
export function useAllPhotos(limit = 50) {
  return usePhotos({ category: 'all', limit })
}
