import { FolderKanban, LayoutDashboard } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
]

export function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold">Momentum</span>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-[220px_1fr]">
        <aside className="min-h-[calc(100vh-61px)] border-r border-zinc-200 bg-white p-4">
          <nav aria-label="Main navigation" className="space-y-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`
                }
              >
                <Icon aria-hidden="true" size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
