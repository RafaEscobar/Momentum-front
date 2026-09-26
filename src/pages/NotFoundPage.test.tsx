import { screen } from '@testing-library/react'

import { Component as NotFoundPage } from '@/pages/NotFoundPage'
import { renderWithProviders } from '@/test/render'

describe('NotFoundPage', () => {
  it('muestra el error 404 y permite volver al dashboard', () => {
    renderWithProviders(<NotFoundPage />, '/ruta-inexistente')

    expect(screen.getByText('Error 404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    )
  })
})
