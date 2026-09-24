import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LoaderCircle, LockKeyhole, LogIn, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { isApiError } from '@/api/errors'
import { FullPageLoader } from '@/components/common/FullPageLoader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { loginSchema } from '@/features/auth/schemas/loginSchema'
import type { LoginFormValues } from '@/features/auth/schemas/loginSchema'

interface LoginLocationState {
  from?: string
}

export function Component() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const destination = (location.state as LoginLocationState | null)?.from ?? '/dashboard'
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isLoading) {
    return <FullPageLoader label="Validando sesión" />
  }

  if (isAuthenticated) {
    return <Navigate to={destination} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root')

    try {
      await login(values)
      await navigate(destination, { replace: true })
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setError('root.server', { message: 'No fue posible iniciar sesión.' })
        return
      }

      let hasFieldError = false

      for (const field of ['email', 'password'] as const) {
        const message = error.validationErrors?.[field]?.[0]

        if (message) {
          setError(field, { message })
          hasFieldError = true
        }
      }

      if (!hasFieldError) {
        setError('root.server', { message: error.message })
      }
    }
  })

  return (
    <main className="grid min-h-screen bg-zinc-50 lg:grid-cols-[minmax(320px,0.8fr)_minmax(520px,1.2fr)]">
      <section className="hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-emerald-400 text-emerald-950">
            <LogIn aria-hidden="true" size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-semibold">Momentum</span>
        </div>
        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase text-emerald-300">Espacio personal</p>
          <p className="mt-4 text-3xl font-semibold leading-tight">
            Proyectos, sprints y tareas en un solo lugar.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="grid size-9 place-items-center rounded-md bg-emerald-900 text-white">
              <LogIn aria-hidden="true" size={18} />
            </div>
            <span className="text-lg font-semibold text-zinc-900">Momentum</span>
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-zinc-950">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-zinc-600">Accede a tu espacio de trabajo.</p>
          </div>

          <form className="mt-8 space-y-5" noValidate onSubmit={(event) => void onSubmit(event)}>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <input
                  {...register('email')}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 aria-[invalid=true]:border-red-600"
                  id="email"
                  inputMode="email"
                  placeholder="nombre@ejemplo.com"
                  type="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-700" id="email-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <input
                  {...register('password')}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={Boolean(errors.password)}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white pl-10 pr-11 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 aria-[invalid=true]:border-red-600"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-700"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-700" id="password-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errors.root?.server && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">
                {errors.root.server.message}
              </div>
            )}

            <button
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-800/60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
                  Iniciando sesión
                </>
              ) : (
                <>
                  <LogIn aria-hidden="true" size={18} />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
