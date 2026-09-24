import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import { isApiError } from '@/api/errors'
import { queryClient } from '@/api/queryClient'
import { subscribeToUnauthorized } from '@/api/sessionEvents'
import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  login as loginRequest,
  logout as logoutRequest,
} from '@/features/auth/api/authApi'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'
import type { LoginRequest, User } from '@/features/auth/types'

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState(token !== null)

  const clearSession = useCallback(() => {
    clearStoredToken()
    setUser(null)
    setToken(null)
    queryClient.clear()
  }, [])

  useEffect(() => subscribeToUnauthorized(clearSession), [clearSession])

  useEffect(() => {
    if (!token || user) {
      return
    }

    const controller = new AbortController()

    void getCurrentUser({ signal: controller.signal })
      .then(setUser)
      .catch((error: unknown) => {
        if (!controller.signal.aborted && isApiError(error) && error.status === 401) {
          clearSession()
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [clearSession, token, user])

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await loginRequest(credentials)

    setUser(response.user)
    setToken(response.token)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: user !== null && token !== null,
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
