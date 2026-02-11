'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewGiftPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)

      const imageFile = formData.get('imageFile')
      const imageUrlInput = formData.get('imageUrl')

      let imageUrl: string | undefined = undefined

      if (imageFile && typeof imageFile !== 'string' && (imageFile as File).size > 0) {
        const uploadData = new FormData()
        uploadData.set('file', imageFile)

        const uploadRes = await fetch('/api/admin/uploads', {
          method: 'POST',
          body: uploadData,
        })

        const uploadJson = await uploadRes.json()
        if (!uploadRes.ok) {
          setError(uploadJson?.error || 'Erro ao fazer upload da imagem')
          return
        }

        if (typeof uploadJson?.url === 'string' && uploadJson.url) {
          imageUrl = uploadJson.url
        }
      } else if (typeof imageUrlInput === 'string' && imageUrlInput.trim()) {
        imageUrl = imageUrlInput.trim()
      }

      const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        totalValue: parseFloat(formData.get('totalValue') as string),
        quotaTotal: parseInt((formData.get('quotaTotal') as string) || '1', 10) || 1,
        imageUrl,
        status: formData.get('status')
      }

      const res = await fetch('/api/admin/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        router.push('/admin/dashboard/gifts')
        router.refresh()
      } else {
        const err = await res.json()
        setError(err.error || 'Erro ao criar presente')
      }
    } catch {
      setError('Erro ao criar presente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <a 
          href="/admin/dashboard/gifts"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Voltar
        </a>
        <h1 className="text-2xl font-bold text-gray-800">Novo Presente</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">{error}</p>
                {error.includes('storage') || error.includes('bucket') || error.includes('Storage') ? (
                  <p className="text-sm mt-2 text-red-600">
                    📖 <a href="/SETUP-STORAGE.md" target="_blank" className="underline hover:text-red-800">
                      Clique aqui para ver como configurar o Storage
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Presente *
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              placeholder="Ex: Jogo de Panelas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              placeholder="Descrição opcional do presente"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                name="totalValue"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                placeholder="500.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total de Cotas *
              </label>
              <input
                type="number"
                name="quotaTotal"
                min="1"
                step="1"
                defaultValue={10}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                placeholder="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cada cota = valor total dividido pelo total de cotas.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
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
              name="imageFile"
              accept="image/*"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
            />
            <div className="my-2 text-center text-xs text-gray-500">ou</div>
            <input
              type="url"
              name="imageUrl"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se você enviar um arquivo, o link acima pode ficar em branco.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Presente'}
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
