import { Skeleton } from '@/components/common/Skeleton'

export function DashboardSkeleton() {
  return (
    <div aria-label="Cargando dashboard" className="space-y-8" role="status">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="rounded-md border border-zinc-200 bg-white p-4" key={index}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-7 w-12" />
          </div>
        ))}
      </div>
      <div>
        <Skeleton className="h-5 w-28" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="h-64 rounded-md" key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
