import { CircleGauge, FileText, FolderKanban, LayoutDashboard, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Proyectos', icon: FolderKanban, end: false },
  { to: '/notes', label: 'Notas generales', icon: FileText, end: true },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-30 bg-zinc-950/40 lg:hidden"
          onClick={onClose}
          type="button"
        />
      )}

      <aside
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        id="app-sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-emerald-900 text-white">
              <CircleGauge aria-hidden="true" size={19} />
            </div>
            <span className="text-lg font-semibold text-zinc-950">Momentum</span>
          </div>
          <button
            aria-label="Cerrar navegación"
            className="grid size-9 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                }`
              }
              end={end}
              onClick={onClose}
              to={to}
            >
              <Icon aria-hidden="true" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
