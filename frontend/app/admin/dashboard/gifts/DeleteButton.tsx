'use client'

import { useState } from 'react'

export default function DeleteButton({ giftId }: { giftId: string }) {
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="button"
      disabled={loading}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
      onClick={async () => {
        if (loading) return
        if (!confirm('Tem certeza que deseja excluir este presente?')) return

        try {
          setLoading(true)
          const res = await fetch(`/api/admin/gifts/${giftId}/delete`, { method: 'POST' })
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            alert(data.error || 'Erro ao excluir presente')
            return
          }
          // Página é client-only e busca dados via fetch() no useEffect;
          // o reload garante que o item some da lista.
          window.location.reload()
        } catch (e) {
          console.error('Erro ao excluir presente:', e)
          alert('Erro ao excluir presente')
        } finally {
          setLoading(false)
        }
      }}
      title="Excluir"
    >
      🗑️
    </button>
  )
}
