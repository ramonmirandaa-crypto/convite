'use client'

import { useState, useEffect } from 'react'

interface HealthStatus {
  database: boolean
  env: {
    hasPrismaUrl: boolean
    hasDirectUrl: boolean
    hasAdminUser: boolean
    hasAdminPassword: boolean
    hasEncryptionKey: boolean
  }
  error: string | null
}

export default function DiagnosticPage() {
  const [status, setStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkHealth()
  }, [])

  async function checkHealth() {
    try {
      const res = await fetch('/api/health/db')
      const data = await res.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        database: false,
        env: {
          hasPrismaUrl: false,
          hasDirectUrl: false,
          hasAdminUser: false,
          hasAdminPassword: false,
          hasEncryptionKey: false,
        },
        error: 'Erro ao verificar status'
      })
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

  const allEnvOk = status && Object.values(status.env).every(v => v)

  return (
    <div>
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Diagnóstico do Sistema</h1>

      {/* Status do Banco */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Status do Banco de Dados</h2>
        
        {status?.database ? (
          <div className="flex items-center gap-3 text-green-600">
            <span className="text-2xl">✅</span>
            <span className="font-medium">Conectado com sucesso</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-red-600">
            <span className="text-2xl">❌</span>
            <span className="font-medium">Erro de conexão</span>
          </div>
        )}

        {status?.error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-700 text-sm font-mono">{status.error}</p>
          </div>
        )}
      </div>

      {/* Variáveis de Ambiente */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Variáveis de Ambiente</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">POSTGRES_PRISMA_URL</span>
            {status?.env.hasPrismaUrl ? (
              <span className="text-green-600">✅ Configurada</span>
            ) : (
              <span className="text-red-600">❌ Não configurada</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">POSTGRES_URL_NON_POOLING</span>
            {status?.env.hasDirectUrl ? (
              <span className="text-green-600">✅ Configurada</span>
            ) : (
              <span className="text-red-600">❌ Não configurada</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">ADMIN_USER</span>
            {status?.env.hasAdminUser ? (
              <span className="text-green-600">✅ Configurada</span>
            ) : (
              <span className="text-red-600">❌ Não configurada</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">ADMIN_PASSWORD</span>
            {status?.env.hasAdminPassword ? (
              <span className="text-green-600">✅ Configurada</span>
            ) : (
              <span className="text-red-600">❌ Não configurada</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-sm">ENCRYPTION_KEY</span>
            {status?.env.hasEncryptionKey ? (
              <span className="text-green-600">✅ Configurada</span>
            ) : (
              <span className="text-red-600">❌ Não configurada</span>
            )}
          </div>
        </div>

        {!allEnvOk && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ Atenção:</strong> Algumas variáveis de ambiente não estão configuradas. 
              Configure-as no dashboard da Vercel em Settings → Environment Variables.
            </p>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">Como Configurar</h2>
        
        <ol className="space-y-3 text-blue-700 text-sm">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Acesse <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Vercel Dashboard</a></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Selecione seu projeto</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>Vá em Settings → Environment Variables</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Adicione as variáveis POSTGRES_PRISMA_URL e POSTGRES_URL_NON_POOLING</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">5.</span>
            <span>Faça um novo deploy (Redeploy)</span>
          </li>
        </ol>

        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Onde obter a connection string:</strong><br />
            Supabase Dashboard → Project Settings → Database → Connection String → URI
          </p>
        </div>
      </div>

      <button
        onClick={() => { setLoading(true); checkHealth() }}
        className="mt-6 btn-premium px-6 py-3 rounded-lg"
      >
        🔄 Verificar Novamente
      </button>
    </div>
  )
}
