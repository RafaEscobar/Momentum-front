import axios from 'axios'

export type LaravelValidationErrors = Record<string, string[]>

interface LaravelErrorResponse {
  message?: string
  errors?: LaravelValidationErrors
}

const statusMessages: Record<number, string> = {
  401: 'Your session is invalid or has expired.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  413: 'The request is larger than the server allows.',
  422: 'Some submitted fields are invalid.',
  429: 'Too many requests. Please try again shortly.',
  500: 'The server could not complete the request.',
}

export class ApiError extends Error {
  readonly status?: number
  readonly validationErrors?: LaravelValidationErrors

  constructor(message: string, status?: number, validationErrors?: LaravelValidationErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.validationErrors = validationErrors
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (!axios.isAxiosError<LaravelErrorResponse>(error)) {
    return new ApiError('An unexpected error occurred.')
  }

  const status = error.response?.status
  const response = error.response?.data
  const fallbackMessage = status
    ? (statusMessages[status] ?? 'The request could not be completed.')
    : 'Could not connect to the server.'

  return new ApiError(response?.message ?? fallbackMessage, status, response?.errors)
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
