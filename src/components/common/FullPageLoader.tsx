import { Spinner } from '@/components/common/Spinner'

interface FullPageLoaderProps {
  label?: string
}

export function FullPageLoader({ label = 'Cargando' }: FullPageLoaderProps) {
  return (
    <div className="grid min-h-screen place-items-center bg-zinc-100" role="status">
      <div className="flex items-center gap-3 text-sm font-medium text-zinc-600">
        <Spinner size={20} />
        <span>{label}</span>
      </div>
    </div>
  )
}
