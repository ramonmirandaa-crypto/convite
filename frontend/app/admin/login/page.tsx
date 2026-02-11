'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCouplePhotos } from '@/lib/usePhotos'
import { FloralDivider, FloralCorner } from '../../components/FloralElements'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { photos: couplePhotos } = useCouplePhotos(1)
  const avatarUrl = couplePhotos.length > 0 ? couplePhotos[0].imageUrl : null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (res.ok) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
        setError(data.error || 'Usuário ou senha incorretos')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4ED] p-4 relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 opacity-30">
        <FloralCorner position="top-left" />
      </div>
      <div className="absolute top-4 right-4 opacity-30">
        <FloralCorner position="top-right" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-30">
        <FloralCorner position="bottom-left" />
      </div>
      <div className="absolute bottom-4 right-4 opacity-30">
        <FloralCorner position="bottom-right" />
      </div>

      <div className="bg-[#FFFCF8] p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-[#D4653C]/10 relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#D4653C]/30 relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Raiana e Raphael"
                fill
                className="object-cover"
                sizes="80px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#F8F4ED] to-[#FDF9F3] flex items-center justify-center">
                <span className="text-3xl">💍</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-serif text-gradient-warm mb-2">Área Administrativa</h1>
          <p className="text-[#6B5D4D] text-sm font-serif">Raiana & Raphael - 16/05/2026</p>
          
          <FloralDivider className="mt-4" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#3D3429] mb-2 font-serif">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all font-serif"
              placeholder="admin"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#3D3429] mb-2 font-serif">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F4ED] border border-[#D4653C]/20 rounded-xl text-[#3D3429] placeholder-[#9B8B7A] focus:border-[#D4653C] focus:outline-none focus:ring-2 focus:ring-[#D4653C]/10 transition-all font-serif"
              placeholder="••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-premium disabled:opacity-50 font-serif"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-[#9B8B7A] hover:text-[#D4653C] transition-colors font-serif">
            ← Voltar ao site
          </a>
        </div>
      </div>
    </div>
  )
}
