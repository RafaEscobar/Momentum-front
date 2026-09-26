import { X } from 'lucide-react'
import { useEffect, useId } from 'react'
import type { PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'

interface DrawerProps extends PropsWithChildren {
  title: string
  onClose: () => void
}

export function Drawer({ title, onClose, children }: DrawerProps) {
  const titleId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button aria-label="Cerrar panel" className="absolute inset-0 bg-zinc-950/45" onClick={onClose} type="button" />
      <section aria-labelledby={titleId} aria-modal="true" className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl" role="dialog">
        <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-zinc-950" id={titleId}>{title}</h2>
          <button aria-label="Cerrar" className="grid size-9 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100" onClick={onClose} type="button">
            <X aria-hidden="true" size={19} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </section>
    </div>,
    document.body,
  )
}
