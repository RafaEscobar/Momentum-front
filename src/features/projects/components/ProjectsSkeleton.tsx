export function ProjectsSkeleton() {
  return (
    <div aria-label="Cargando proyectos" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="h-56 animate-pulse rounded-md border border-zinc-200 bg-white p-5" key={index}>
          <div className="flex gap-3">
            <div className="size-10 rounded-md bg-zinc-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-zinc-200" />
              <div className="h-3 w-1/3 rounded bg-zinc-100" />
            </div>
          </div>
          <div className="mt-8 h-2 rounded-full bg-zinc-100" />
          <div className="mt-16 h-9 w-24 rounded-md bg-zinc-100" />
        </div>
      ))}
    </div>
  )
}
