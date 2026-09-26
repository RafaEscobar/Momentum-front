function readRequiredEnv(value: string | undefined, name: string) {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return normalizedValue
}

export const env = Object.freeze({
  apiUrl: readRequiredEnv(import.meta.env.VITE_API_URL, 'VITE_API_URL').replace(/\/+$/, ''),
})
