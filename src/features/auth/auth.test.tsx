import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

import { api } from '@/api/client'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Component as LoginPage } from '@/pages/LoginPage'
import { createTestQueryClient } from '@/test/render'
import { server } from '@/test/server'

function renderLogin() {
  const queryClient = createTestQueryClient()

  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route element={<LoginPage />} path="/login" />
              <Route element={<h1>Dashboard privado</h1>} path="/dashboard" />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    ),
  }
}

function SessionProbe() {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      <span>{isAuthenticated ? 'Sesión activa' : 'Sesión cerrada'}</span>
      <button onClick={() => void api.get('/private-check').catch(() => undefined)} type="button">
        Consultar endpoint
      </button>
    </div>
  )
}

describe('authentication', () => {
  it('renders the login form', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
  })

  it('redirects to the dashboard after a valid login', async () => {
    server.use(
      http.post('*/api/login', () =>
        HttpResponse.json({
          user: { id: 1, name: 'Ada', email: 'ada@example.test' },
          token: 'valid-token',
        }),
      ),
    )
    const { user } = renderLogin()

    await user.type(screen.getByLabelText('Correo electrónico'), 'ada@example.test')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard privado' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBe('valid-token')
  })

  it('redirects unauthenticated users away from protected routes', () => {
    const value: AuthContextValue = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    }

    render(
      <AuthContext.Provider value={value}>
        <MemoryRouter initialEntries={['/projects/1']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<h1>Proyecto privado</h1>} path="/projects/:projectId" />
            </Route>
            <Route element={<h1>Acceso requerido</h1>} path="/login" />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(screen.getByRole('heading', { name: 'Acceso requerido' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Proyecto privado' })).not.toBeInTheDocument()
  })

  it('clears the active session when any endpoint responds with 401', async () => {
    localStorage.setItem('token', 'expired-token')
    server.use(
      http.get('*/api/user', () =>
        HttpResponse.json({ user: { id: 1, name: 'Ada', email: 'ada@example.test' } }),
      ),
      http.get('*/api/private-check', () =>
        HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
      ),
    )
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['private-projects'], [{ id: 7, name: 'Momentum' }])
    const user = userEvent.setup()

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/private']}>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route element={<SessionProbe />} path="/private" />
              </Route>
              <Route element={<h1>Iniciar sesión de nuevo</h1>} path="/login" />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    )

    expect(await screen.findByText('Sesión activa')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Consultar endpoint' }))

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión de nuevo' })).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
    expect(queryClient.getQueryData(['private-projects'])).toBeUndefined()
  })
})
