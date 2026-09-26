import { api, AUTH_TOKEN_STORAGE_KEY } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import { authEndpoints } from '@/features/auth/api/authEndpoints'
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  User,
} from '@/features/auth/types'

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export async function login(payload: LoginRequest, options?: ApiRequestOptions) {
  const { data } = await api.post<LoginResponse>(authEndpoints.login, payload, options)

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.token)

  return data
}

export async function getCurrentUser(options?: ApiRequestOptions): Promise<User> {
  const { data } = await api.get<CurrentUserResponse>(authEndpoints.currentUser, options)

  return data.user
}

export async function logout(options?: ApiRequestOptions) {
  try {
    await api.post<void>(authEndpoints.logout, undefined, options)
  } finally {
    clearStoredToken()
  }
}
