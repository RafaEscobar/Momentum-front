import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { FullPageLoader } from '@/components/common/FullPageLoader'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullPageLoader label="Validando sesión" />
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`

    return <Navigate to="/login" replace state={{ from }} />
  }

  return <Outlet />
}
