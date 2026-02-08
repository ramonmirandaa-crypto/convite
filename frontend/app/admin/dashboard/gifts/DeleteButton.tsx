'use client'

export default function DeleteButton({ giftId }: { giftId: string }) {
  return (
    <form action={`/api/admin/gifts/${giftId}/delete`} method="POST">
      <button 
        type="submit"
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        onClick={(e) => {
          if (!confirm('Tem certeza que deseja excluir este presente?')) {
            e.preventDefault()
          }
        }}
      >
        🗑️
      </button>
    </form>
  )
}
