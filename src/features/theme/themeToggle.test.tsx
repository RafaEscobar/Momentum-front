import { fireEvent, render, screen } from '@testing-library/react'

import { ThemeToggle } from '@/features/theme/components/ThemeToggle'
import { THEME_STORAGE_KEY } from '@/features/theme/hooks/useTheme'

describe('ThemeToggle', () => {
  it('aplica y conserva la preferencia de tema', () => {
    document.documentElement.dataset.theme = 'light'
    render(<ThemeToggle />)

    const toggle = screen.getByRole('switch', { name: 'Cambiar a tema oscuro' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(toggle)

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(screen.getByRole('switch', { name: 'Cambiar a tema claro' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})
