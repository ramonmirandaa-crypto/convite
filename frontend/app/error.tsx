'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-serif text-gray-800 mb-4">Erro na aplicação</h2>
        <p className="text-gray-600 mb-6">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
