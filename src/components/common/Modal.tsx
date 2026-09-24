import { X } from 'lucide-react'
import { useEffect, useId } from 'react'
import type { PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps extends PropsWithChildren {
  title: string
  description?: string
  onClose: () => void
}

export function Modal({ title, description, onClose, children }: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 grid items-end sm:items-center sm:p-6">
      <button
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-zinc-950/50"
        onClick={onClose}
        type="button"
      />
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 mx-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-md bg-white shadow-xl sm:rounded-md"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950" id={titleId}>
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-zinc-600" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <button
            aria-label="Cerrar"
            className="grid size-9 shrink-0 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  )
}
