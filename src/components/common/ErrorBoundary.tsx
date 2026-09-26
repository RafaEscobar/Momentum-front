import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Component } from 'react'
import type { ErrorInfo, PropsWithChildren } from 'react'

import { Button } from '@/components/common/Button'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-zinc-100 px-4 py-10">
          <section
            aria-labelledby="application-error-title"
            className="w-full max-w-md border border-zinc-200 bg-white p-8 text-center shadow-sm"
            role="alert"
          >
            <AlertTriangle aria-hidden="true" className="mx-auto text-red-600" size={36} />
            <h1
              className="mt-4 text-2xl font-semibold text-zinc-950"
              id="application-error-title"
            >
              Algo salió mal
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Ocurrió un error inesperado. Recarga la aplicación para intentarlo de nuevo.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              <RefreshCw aria-hidden="true" size={17} />
              Recargar
            </Button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
