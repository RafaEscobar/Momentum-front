import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { toApiError } from '@/api/errors'

export const AUTH_TOKEN_STORAGE_KEY = 'token'

export type ApiRequestOptions = Pick<AxiosRequestConfig, 'signal'>

export const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    return Promise.reject(toApiError(error))
  },
)
