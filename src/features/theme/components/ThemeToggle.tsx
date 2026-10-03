import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/features/theme/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'

  return (
    <button
      aria-checked={isDark}
      aria-label={label}
      className={`relative h-8 w-14 shrink-0 rounded-full border p-1 shadow-inner transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
        isDark
          ? 'border-emerald-700 bg-emerald-900'
          : 'border-zinc-300 bg-zinc-100'
      }`}
      onClick={toggleTheme}
      role="switch"
      title={label}
      type="button"
    >
      <Sun
        aria-hidden="true"
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity ${
          isDark ? 'opacity-40' : 'opacity-100'
        }`}
        size={13}
      />
      <Moon
        aria-hidden="true"
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-emerald-100 transition-opacity ${
          isDark ? 'opacity-100' : 'opacity-40'
        }`}
        size={13}
      />
      <span
        aria-hidden="true"
        className={`theme-toggle-thumb relative block size-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
