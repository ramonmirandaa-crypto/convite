'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Gift = {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  totalValue: any
  quotaTotal: number | null
  status: string
}

function toCents(value: number): number {
  return Math.round((Number(value) || 0) * 100)
}

export default function EditGiftPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [gift, setGift] = useState<Gift | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [totalValue, setTotalValue] = useState('0')
  const [quotaTotal, setQuotaTotal] = useState('10')
  const [status, setStatus] = useState<'available' | 'hidden'>('available')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`/api/admin/gifts/${params.id}`)
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao carregar presente')
        }

        const g: Gift = data.gift
        if (cancelled) return

        setGift(g)
        setTitle(g.title || '')
        setDescription(g.description || '')
        setTotalValue(String(g.totalValue ?? '0'))
        setQuotaTotal(String(g.quotaTotal ?? 10))
        setStatus((g.status === 'hidden' ? 'hidden' : 'available') as any)
        setImageUrl(g.imageUrl || '')
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Erro ao carregar presente')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [params.id])

  const quotaPreview = useMemo(() => {
    const total = Number(totalValue)
    const qt = parseInt(quotaTotal || '1', 10) || 1
    const totalCents = toCents(total)
    const ok = qt >= 1 && totalCents > 0 && totalCents % qt === 0
    const quotaValue = ok ? (totalCents / qt) / 100 : null
    return { ok, quotaValue }
  }, [totalValue, quotaTotal])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      let nextImageUrl: string | null | undefined = undefined

      if (imageFile && imageFile.size > 0) {
        const uploadData = new FormData()
        uploadData.set('file', imageFile)

        const uploadRes = await fetch('/api/admin/uploads', {
          method: 'POST',
          body: uploadData,
        })

        const uploadJson = await uploadRes.json().catch(() => ({}))
        if (!uploadRes.ok) {
          throw new Error(uploadJson?.error || 'Erro ao fazer upload da imagem')
        }

        if (typeof uploadJson?.url === 'string' && uploadJson.url) {
          nextImageUrl = uploadJson.url
        }
      } else {
        const trimmed = imageUrl.trim()
        nextImageUrl = trimmed ? trimmed : null
      }

      const payload = {
        title,
        description: description.trim() ? description : null,
        totalValue: Number(totalValue),
        quotaTotal: parseInt(quotaTotal || '1', 10) || 1,
        imageUrl: nextImageUrl,
        status,
      }

      const res = await fetch(`/api/admin/gifts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar presente')
      }

      router.push('/admin/dashboard/gifts')
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Erro ao atualizar presente')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!gift) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Presente não encontrado</h2>
        <a href="/admin/dashboard/gifts" className="text-red-700 underline">
          Voltar
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/dashboard/gifts" className="text-gray-500 hover:text-gray-700">
          ← Voltar
        </a>
        <h1 className="text-2xl font-bold text-gray-800">Editar Presente</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Presente *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Total (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total de Cotas *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quotaTotal}
                onChange={(e) => setQuotaTotal(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              />
              <p className={`text-xs mt-1 ${quotaPreview.ok ? 'text-gray-500' : 'text-red-600'}`}>
                {quotaPreview.ok && quotaPreview.quotaValue !== null
                  ? `Cada cota: R$ ${quotaPreview.quotaValue.toFixed(2)}`
                  : 'Valor total deve ser divisível pelo total de cotas.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              >
                <option value="available">Disponível</option>
                <option value="hidden">Oculto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem (upload ou URL)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
            <div className="my-2 text-center text-xs text-gray-500">ou</div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se você enviar um arquivo, ele substitui a URL. Se deixar em branco, remove a imagem.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <a
              href="/admin/dashboard/gifts"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition"
            >
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

