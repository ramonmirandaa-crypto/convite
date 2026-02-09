'use client'

import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/dashboard/gifts', label: 'Presentes', icon: '🎁' },
  { href: '/admin/dashboard/guests', label: 'Convidados', icon: '👥' },
  { href: '/admin/dashboard/photos', label: 'Fotos', icon: '📸' },
  { href: '/admin/dashboard/reports', label: 'Relatórios', icon: '📈' },
  { href: '/admin/dashboard/settings', label: 'Configurações', icon: '⚙️' },
  { href: '/admin/dashboard/diagnostic', label: 'Diagnóstico', icon: '🔧' },
]

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col border-r border-yellow-100`}
      >
        <div className="p-6 border-b border-yellow-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400 flex-shrink-0 relative">
              <Image
                src="/Fotos/IMG_0549.jpeg"
                alt="Raiana e Raphael"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-serif font-bold text-gray-800">Admin</h2>
                <p className="text-xs text-gray-500">R & R</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    pathname === item.href
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-yellow-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b border-yellow-100">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
            >
              Ver site →
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
