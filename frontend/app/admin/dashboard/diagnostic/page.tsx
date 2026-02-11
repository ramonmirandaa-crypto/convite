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

interface StorageStatus {
  bucket: string
  exists: boolean
  bucketInfo: any
  allBuckets: string[]
}

export default function DiagnosticPage() {
  const [status, setStatus] = useState<HealthStatus | null>(null)
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [storageLoading, setStorageLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<any>(null)

  useEffect(() => {
    checkHealth()
    checkStorage()
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

  async function checkStorage() {
    try {
      const res = await fetch('/api/admin/setup-storage')
      const data = await res.json()
      setStorageStatus(data)
    } catch (error) {
      setStorageStatus(null)
    }
  }

  async function setupStorage() {
    setStorageLoading(true)
    setSetupResult(null)
    try {
      const res = await fetch('/api/admin/setup-storage', { method: 'POST' })
      const data = await res.json()
      setSetupResult(data)
      // Recarrega status do storage
      await checkStorage()
    } catch (error: any) {
      setSetupResult({ error: error?.message || 'Erro ao configurar storage' })
    } finally {
      setStorageLoading(false)
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

      {/* Status do Storage */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Status do Supabase Storage</h2>
        
        {storageStatus ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-mono text-sm">Bucket "{storageStatus.bucket}"</span>
              {storageStatus.exists ? (
                <span className="text-green-600 flex items-center gap-1">
                  ✅ Configurado
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  ❌ Não existe
                </span>
              )}
            </div>

            {storageStatus.allBuckets.length > 0 && (
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Buckets disponíveis:</p>
                <p className="font-mono text-xs">{storageStatus.allBuckets.join(', ')}</p>
              </div>
            )}

            {!storageStatus.exists && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm mb-3">
                  <strong>⚠️ Bucket não configurado</strong><br />
                  O upload de imagens não funcionará até que o bucket seja criado.
                </p>
                <button
                  onClick={setupStorage}
                  disabled={storageLoading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {storageLoading ? 'Configurando...' : '🔧 Configurar Storage Automaticamente'}
                </button>
              </div>
            )}

            {storageStatus.exists && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>✅ Storage configurado!</strong><br />
                  O upload de imagens deve funcionar corretamente.
                </p>
              </div>
            )}

            {setupResult && (
              <div className={`p-4 rounded-lg border ${setupResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`font-medium mb-2 ${setupResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {setupResult.success ? '✅ Configuração realizada!' : '❌ Erro na configuração'}
                </h3>
                
                {setupResult.steps && (
                  <div className="space-y-1 text-xs">
                    {setupResult.steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span>
                          {step.status === 'success' && '✅'}
                          {step.status === 'error' && '❌'}
                          {step.status === 'warning' && '⚠️'}
                          {step.status === 'skipped' && '⏭️'}
                        </span>
                        <span className="font-medium">{step.step}:</span>
                        <span className={
                          step.status === 'success' ? 'text-green-700' :
                          step.status === 'error' ? 'text-red-700' :
                          step.status === 'warning' ? 'text-yellow-700' :
                          'text-gray-600'
                        }>
                          {step.status === 'success' && 'Sucesso'}
                          {step.status === 'error' && `Erro: ${step.error}`}
                          {step.status === 'warning' && `Aviso: ${step.warning}`}
                          {step.status === 'skipped' && `Ignorado: ${step.reason}`}
                          {step.status === undefined && (step.exists ? 'Existe' : 'Não existe')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {setupResult.manual_setup_required && (
                  <div className="mt-3 p-3 bg-yellow-100 rounded text-yellow-800 text-sm">
                    <strong>Configuração manual necessária:</strong>
                    <ol className="list-decimal ml-4 mt-1 space-y-1">
                      <li>Acesse o <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                      <li>Vá em Storage → Policies</li>
                      <li>Selecione o bucket "photos"</li>
                      <li>Clique em "New Policy"</li>
                      <li>Crie políticas para SELECT (anon), INSERT/DELETE (service_role)</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">
            <p>Não foi possível verificar o status do storage.</p>
            <button
              onClick={checkStorage}
              className="mt-2 text-yellow-600 hover:text-yellow-700 text-sm underline"
            >
              Tentar novamente
            </button>
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
        onClick={() => { setLoading(true); checkHealth(); checkStorage(); }}
        className="mt-6 btn-premium px-6 py-3 rounded-lg"
      >
        🔄 Verificar Novamente
      </button>
    </div>
  )
}
