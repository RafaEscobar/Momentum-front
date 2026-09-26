import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Spinner } from '@/components/common/Spinner'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  isPending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  isPending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal onClose={isPending ? () => undefined : onCancel} title={title}>
      <div className="flex gap-3 px-5 py-6 sm:px-6">
        <AlertTriangle aria-hidden="true" className="shrink-0 text-amber-600" size={22} />
        <p className="text-sm text-zinc-700">{description}</p>
      </div>
      <footer className="flex justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:px-6">
        <Button disabled={isPending} onClick={onCancel} variant="ghost">
          Cancelar
        </Button>
        <Button disabled={isPending} onClick={onConfirm} variant="danger">
          {isPending && <Spinner size={17} />}
          {confirmLabel}
        </Button>
      </footer>
    </Modal>
  )
}
