import { Link } from 'react-router-dom'

export function Component() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-100 p-6 text-center">
      <div>
        <p className="text-sm font-medium text-emerald-700">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Page not found</h1>
        <Link className="mt-4 inline-block text-sm font-medium text-emerald-700" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}
