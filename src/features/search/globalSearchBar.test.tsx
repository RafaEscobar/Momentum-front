import { screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'

import { GlobalSearchBar } from '@/features/search/components/GlobalSearchBar'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

function LocationState() {
  const location = useLocation()
  return <output aria-label="URL actual">{location.search}</output>
}

describe('GlobalSearchBar', () => {
  it('persists submitted searches in query params and clears them', async () => {
    const { user } = renderWithProviders(<><GlobalSearchBar /><LocationState /></>, '/dashboard?status=active')

    const input = screen.getByRole('searchbox', { name: 'Búsqueda global' })
    await user.type(input, 'chapter')
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('?status=active&q=chapter')

    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(screen.getByLabelText('URL actual')).toHaveTextContent('?status=active')
    expect(input).toHaveValue('')
  })

  it('hydrates its value from the current URL', () => {
    renderWithProviders(<GlobalSearchBar />, '/dashboard?q=momentum')
    expect(screen.getByRole('searchbox', { name: 'Búsqueda global' })).toHaveValue('momentum')
  })

  it('debounces, cancels stale requests and navigates grouped results', async () => {
    const queries: string[] = []
    server.use(http.get('*/api/search', async ({ request }) => {
      const query = new URL(request.url).searchParams.get('q') ?? ''
      queries.push(query)
      if (query === 'ch') {
        await delay(1_000)
      }
      return HttpResponse.json({
        projects: [{ id: 7, name: 'Chapters', status: 'active', priority: 'high', color: null, icon: null, progress: 0, created_at: '', updated_at: '' }],
        tasks: [{ id: 10, project_id: 7, sprint_id: 3, title: 'Migrate Chapters', type: 'task', priority: 'high', status: 'todo', story_points: 3, position: 0, completed_at: null, created_at: '', updated_at: '' }],
        notes: [{ id: 4, project_id: 7, title: 'Chapter migration notes' }],
        meta: {
          projects: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
          tasks: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
          notes: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
        },
      })
    }))

    const { user } = renderWithProviders(<GlobalSearchBar />, '/dashboard')
    const input = screen.getByRole('searchbox', { name: 'Búsqueda global' })
    await user.type(input, 'ch')
    expect(screen.getByText('Buscando')).toBeInTheDocument()
    await screen.findByText('Buscando')
    await waitFor(() => expect(queries).toContain('ch'))
    await user.type(input, 'apter')

    expect(await screen.findByRole('link', { name: 'Chapters' })).toHaveAttribute('href', '/projects/7')
    expect(screen.getByRole('link', { name: 'Migrate Chapters' })).toHaveAttribute('href', '/projects/7/board?task=10&action=edit')
    expect(screen.getByRole('link', { name: 'Chapter migration notes' })).toHaveAttribute('href', '/projects/7/notes?note=4')
    expect(queries).toEqual(['ch', 'chapter'])
  })
})
