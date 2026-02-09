'use client'

import { useState } from 'react'

export default function DeleteButton({ guestId }: { guestId: string }) {
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="button"
      disabled={loading}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
      onClick={async () => {
        if (loading) return
        if (!confirm('Tem certeza que deseja excluir este convidado?')) return

        try {
          setLoading(true)
          const res = await fetch(`/api/admin/guests/${guestId}/delete`, { method: 'POST' })
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            alert(data.error || 'Erro ao excluir convidado')
            return
          }
          window.location.reload()
        } catch (e) {
          console.error('Erro ao excluir convidado:', e)
          alert('Erro ao excluir convidado')
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
