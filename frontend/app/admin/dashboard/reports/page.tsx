'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

interface Contribution {
  id: string
  giftId: string
  giftTitle: string
  amount: string
  payerName: string
  payerEmail: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  isAnonymous: boolean
}

interface ReportStats {
  totalCollected: number
  totalContributions: number
  approvedContributions: number
  pendingContributions: number
  averageContribution: number
  pixTotal: number
  cardTotal: number
  contributionsByMonth: { month: string; total: number }[]
  topGifts: { title: string; total: number; count: number }[]
}

interface GiftSummary {
  giftId: string
  title: string
  totalValue: number
  quotaTotal: number
  status: string
  approvedTotal: number
  approvedCount: number
  pendingTotal: number
  pendingCount: number
  rejectedTotal: number
  rejectedCount: number
  remaining: number
  progress: number
  lastContributionAt: string | null
}

export default function ReportsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [gifts, setGifts] = useState<GiftSummary[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    try {
      setError('')
      const res = await fetch('/api/admin/reports')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar relatórios')
      }

      setContributions(data.contributions || [])
      setGifts(data.gifts || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  const filteredContributions = contributions.filter(c => {
    if (statusFilter !== 'all' && c.paymentStatus !== statusFilter) return false
    if (dateFilter.start && new Date(c.createdAt) < new Date(dateFilter.start)) return false
    if (dateFilter.end && new Date(c.createdAt) > new Date(dateFilter.end + 'T23:59:59')) return false
    return true
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportCSV = () => {
    const headers = ['Data', 'Presente', 'Contribuinte', 'Email', 'Valor', 'Método', 'Status', 'Anônimo']
    const rows = filteredContributions.map(c => [
      formatDate(c.createdAt),
      c.giftTitle,
      c.isAnonymous ? 'Anônimo' : c.payerName,
      c.isAnonymous ? '-' : c.payerEmail,
      c.amount,
      c.paymentMethod === 'pix' ? 'PIX' : 'Cartão',
      c.paymentStatus,
      c.isAnonymous ? 'Sim' : 'Não'
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-contribuicoes-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar relatórios</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => { setLoading(true); loadReports() }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-800">Relatórios Financeiros</h1>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
            <p className="text-gray-500 text-sm">Total Arrecadado</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalCollected)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
            <p className="text-gray-500 text-sm">Total de Contribuições</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalContributions}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
            <p className="text-gray-500 text-sm">Média por Contribuição</p>
            <p className="text-3xl font-bold text-yellow-600">{formatCurrency(stats.averageContribution)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
            <p className="text-gray-500 text-sm">Aprovadas / Pendentes</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.approvedContributions} <span className="text-lg text-gray-400">/</span> {stats.pendingContributions}
            </p>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Por Método de Pagamento</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">PIX</span>
                  <span className="font-medium">{formatCurrency(stats.pixTotal)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(stats.pixTotal / stats.totalCollected) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cartão de Crédito</span>
                  <span className="font-medium">{formatCurrency(stats.cardTotal)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(stats.cardTotal / stats.totalCollected) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Top Presentes</h3>
            <div className="space-y-3">
              {stats.topGifts.map((gift, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{gift.title}</p>
                      <p className="text-xs text-gray-500">{gift.count} contribuições</p>
                    </div>
                  </div>
                  <span className="font-medium text-green-600">{formatCurrency(gift.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gifts Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-yellow-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Presentes Recebidos</h2>
            <p className="text-sm text-gray-500">Resumo por presente (aprovados e pendentes)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-yellow-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrecadado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faltam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progresso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhum presente com contribuições ainda
                  </td>
                </tr>
              ) : (
                gifts.map((g) => (
                  <tr key={g.giftId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      <div>
                        <p className="font-medium">{g.title}</p>
                        <p className="text-xs text-gray-400">
                          {g.approvedCount} aprovadas • {g.pendingCount} pendentes
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      {formatCurrency(Number(g.approvedTotal))}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-yellow-700">
                      {formatCurrency(Number(g.pendingTotal))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatCurrency(Number(g.totalValue))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatCurrency(Number(g.remaining))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-40">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{Math.round(Number(g.progress) || 0)}%</span>
                          <span className="text-gray-400">{g.status}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.max(0, Math.min(100, Number(g.progress) || 0))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {g.lastContributionAt ? formatDate(g.lastContributionAt) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Data Início</label>
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Data Fim</label>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">Todos</option>
              <option value="approved">Aprovado</option>
              <option value="pending">Pendente</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-yellow-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contribuinte</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredContributions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma contribuição encontrada
                </td>
              </tr>
            ) : (
              filteredContributions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {c.giftTitle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.isAnonymous ? (
                      <span className="text-gray-400">Anônimo</span>
                    ) : (
                      <div>
                        <p className="font-medium">{c.payerName}</p>
                        <p className="text-xs text-gray-400">{c.payerEmail}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(Number(c.amount))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.paymentMethod === 'pix' ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">PIX</span>
                    ) : (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Cartão</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.paymentStatus === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : c.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {c.paymentStatus === 'approved' ? 'Aprovado' : 
                       c.paymentStatus === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
