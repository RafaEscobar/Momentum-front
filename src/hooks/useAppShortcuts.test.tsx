import { fireEvent, screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'

import { renderWithProviders } from '@/test/render'
import { useAppShortcuts } from '@/hooks/useAppShortcuts'

function ShortcutHarness({ withInput = false }: { withInput?: boolean }) {
  useAppShortcuts()
  const location = useLocation()

  return (
    <>
      {withInput ? <input aria-label="Buscar" /> : null}
      <output aria-label="Ubicacion">
        {location.pathname}
        {location.search}
      </output>
    </>
  )
}

describe('useAppShortcuts', () => {
  it('navega al dashboard con D', () => {
    renderWithProviders(<ShortcutHarness />, '/projects/7')

    fireEvent.keyDown(window, { key: 'd' })

    expect(screen.getByLabelText('Ubicacion')).toHaveTextContent('/dashboard')
  })

  it('abre backlog y nueva tarea dentro del proyecto actual', () => {
    const { unmount } = renderWithProviders(<ShortcutHarness />, '/projects/7/board')

    fireEvent.keyDown(window, { key: 'b' })
    expect(screen.getByLabelText('Ubicacion')).toHaveTextContent('/projects/7/backlog')

    unmount()
    renderWithProviders(<ShortcutHarness />, '/projects/7')

    fireEvent.keyDown(window, { key: 'n' })
    expect(screen.getByLabelText('Ubicacion')).toHaveTextContent(
      '/projects/7/backlog?create=task',
    )
  })

  it('no activa atajos mientras el usuario escribe', () => {
    renderWithProviders(<ShortcutHarness withInput />, '/projects/7')

    fireEvent.keyDown(screen.getByLabelText('Buscar'), { key: 'd' })

    expect(screen.getByLabelText('Ubicacion')).toHaveTextContent('/projects/7')
  })
})
