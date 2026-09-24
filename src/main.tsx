import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { queryClient } from '@/api/queryClient'
import App from '@/App'
import { AuthProvider } from '@/features/auth/context/AuthProvider'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster closeButton position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
