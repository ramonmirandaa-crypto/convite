'use client'

import { useState, useEffect, useCallback } from 'react'

interface Stats {
  totalGuests: number
  confirmedGuests: number
  totalGifts: number
  fulfilledGifts: number
  contributions: number
  totalCollected: number
  messages: number
  error?: string
}

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/dashboard/stats', {
        // Desabilita cache
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar estatísticas')
      }
      
      setStats(data)
      setLastUpdated(new Date())
      setError('')
      
      // Se veio erro no response mas com status 200, mostra warning
      if (data.error) {
        console.warn('Dashboard warning:', data.error)
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    
    // Atualiza automaticamente a cada 30 segundos
    const interval = setInterval(() => {
      fetchStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [fetchStats])



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
        <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar dashboard</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(''); fetchStats() }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
        <p className="text-yellow-700">Nenhum dado disponível</p>
      </div>
    )
  }

  const cards = [
    { 
      title: 'Convidados', 
      value: stats.totalGuests, 
      subtitle: `${stats.confirmedGuests} confirmados`,
      icon: '👥', 
      color: 'bg-blue-100 text-blue-700',
      link: '/admin/dashboard/guests'
    },
    { 
      title: 'Presentes', 
      value: stats.totalGifts, 
      subtitle: `${stats.fulfilledGifts} arrecadados`,
      icon: '🎁', 
      color: 'bg-yellow-100 text-yellow-700',
      link: '/admin/dashboard/gifts'
    },
    { 
      title: 'Contribuições', 
      value: stats.contributions, 
      subtitle: `R$ ${Number(stats.totalCollected).toFixed(2)}`,
      icon: '💰', 
      color: 'bg-green-100 text-green-700',
      link: '#'
    },
    { 
      title: 'Mensagens', 
      value: stats.messages, 
      subtitle: 'não lidas',
      icon: '💬', 
      color: 'bg-purple-100 text-purple-700',
      link: '/admin/dashboard/messages'
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-gray-400">
              Atualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition disabled:opacity-50"
          >
            <svg 
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>
      
      {stats?.error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700 text-sm">⚠️ {stats.error}</p>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <a 
            key={card.title}
            href={card.link}
            className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6 hover:shadow-md transition block"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
            <p className="text-sm text-gray-400 mt-1">{card.subtitle}</p>
          </a>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
        <h2 className="text-lg font-serif text-gray-800 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/admin/dashboard/guests/new"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 transition"
          >
            <span className="text-3xl">➕</span>
            <div>
              <h3 className="font-semibold text-gray-800">Novo Convidado</h3>
              <p className="text-sm text-gray-500">Adicionar convidado manualmente</p>
            </div>
          </a>

          <a 
            href="/admin/dashboard/gifts/new"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 transition"
          >
            <span className="text-3xl">🎁</span>
            <div>
              <h3 className="font-semibold text-gray-800">Novo Presente</h3>
              <p className="text-sm text-gray-500">Adicionar item à lista</p>
            </div>
          </a>

          <a 
            href="/admin/dashboard/photos"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 transition"
          >
            <span className="text-3xl">📸</span>
            <div>
              <h3 className="font-semibold text-gray-800">Upload de Fotos</h3>
              <p className="text-sm text-gray-500">Adicionar fotos à galeria</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
