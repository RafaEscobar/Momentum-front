import { LoaderCircle, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { GlobalSearchBar } from '@/features/search/components/GlobalSearchBar'
import { ThemeToggle } from '@/features/theme/components/ThemeToggle'

interface TopbarProps {
  onOpenSidebar: () => void
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { logout, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const initial = user?.name.trim().charAt(0).toUpperCase() || 'U'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout().catch(() => undefined)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-3 sm:px-6">
      <button
        aria-controls="app-sidebar"
        aria-label="Abrir navegación"
        className="grid size-10 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 lg:hidden"
        onClick={onOpenSidebar}
        type="button"
      >
        <Menu aria-hidden="true" size={21} />
      </button>

      <div className="mx-2 flex min-w-0 flex-1 justify-center sm:mx-3 lg:mx-0 lg:justify-start">
        <GlobalSearchBar />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <ThemeToggle />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>
        <div
          aria-hidden="true"
          className="hidden size-9 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900 sm:grid"
        >
          {initial}
        </div>
        <button
          aria-label="Cerrar sesión"
          className="grid size-9 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
          title="Cerrar sesión"
          type="button"
        >
          {isLoggingOut ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          ) : (
            <LogOut aria-hidden="true" size={18} />
          )}
        </button>
      </div>
    </header>
  )
}
