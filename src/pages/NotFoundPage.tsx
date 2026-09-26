import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Component() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-100 px-6 py-12 text-center">
      <div className="max-w-md">
        <Compass aria-hidden="true" className="mx-auto text-emerald-800" size={42} />
        <p className="mt-5 text-sm font-semibold text-emerald-800">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Página no encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          La dirección que buscas no existe o ya no está disponible.
        </p>
        <Link
          className="mt-7 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          to="/dashboard"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Volver al dashboard
        </Link>
      </div>
    </main>
  )
}
