import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'

import { Component as GeneralNotesPage } from '@/pages/GeneralNotesPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

const summary = {
  id: 4,
  title: 'Ideas generales',
  created_at: '2026-09-01T10:00:00Z',
  updated_at: '2026-09-02T10:00:00Z',
}
const detail = {
  ...summary,
  content: '# Ideas\n\n<script>alert("xss")</script>\n\nContenido seguro.',
}

function page(data: unknown[]) {
  return {
    data,
    links: { first: null, last: null, prev: null, next: null },
    meta: { current_page: 1, from: data.length ? 1 : null, last_page: 1, per_page: 15, to: data.length || null, total: data.length },
  }
}

function LocationState() {
  const location = useLocation()
  return <output aria-label="Ubicación actual">{location.search}</output>
}

describe('General notes page', () => {
  it('searches with debounce, loads detail, previews safe Markdown and updates', async () => {
    let listSearch: string | null = null
    let updatePayload: unknown
    server.use(
      http.get('*/api/notes', ({ request }) => {
        listSearch = new URL(request.url).searchParams.get('search')
        return HttpResponse.json(page([summary]))
      }),
      http.get('*/api/notes/4', () => HttpResponse.json({ data: detail })),
      http.patch('*/api/notes/4', async ({ request }) => {
        updatePayload = await request.json()
        return HttpResponse.json({ data: { ...detail, ...(updatePayload as object) } })
      }),
    )
    const { user } = renderWithProviders(<><GeneralNotesPage /><LocationState /></>, '/notes')

    expect(await screen.findByText('Ideas generales')).toBeInTheDocument()
    await user.type(screen.getByRole('searchbox', { name: 'Buscar notas generales' }), 'ideas')
    await waitFor(() => expect(listSearch).toBe('ideas'))
    expect(screen.getByLabelText('Ubicación actual')).toHaveTextContent('?search=ideas')

    await user.click(screen.getByRole('button', { name: 'Editar nota Ideas generales' }))
    expect(await screen.findByLabelText('Contenido')).toHaveValue(detail.content)
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByRole('heading', { name: 'Ideas' })).toBeInTheDocument()
    expect(document.querySelector('script')).not.toBeInTheDocument()
    await user.clear(screen.getByLabelText('Título'))
    await user.type(screen.getByLabelText('Título'), 'Ideas revisadas')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(updatePayload).toMatchObject({ title: 'Ideas revisadas' }))
  })

  it('creates and permanently deletes a general note', async () => {
    let createPayload: unknown
    let deleted = false
    server.use(
      http.get('*/api/notes', () => HttpResponse.json(page([summary]))),
      http.post('*/api/notes', async ({ request }) => {
        createPayload = await request.json()
        return HttpResponse.json({ data: { id: 5, ...(createPayload as object), created_at: null, updated_at: null } }, { status: 201 })
      }),
      http.delete('*/api/notes/4', () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { user } = renderWithProviders(<GeneralNotesPage />, '/notes')

    await user.click(await screen.findByRole('button', { name: 'Nueva nota' }))
    await user.type(screen.getByLabelText('Título'), 'Referencia')
    await user.type(screen.getByLabelText('Contenido'), '## Enlace')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(createPayload).toEqual({ title: 'Referencia', content: '## Enlace' }))

    await user.click(screen.getByRole('button', { name: 'Eliminar nota Ideas generales' }))
    const dialog = screen.getByRole('dialog', { name: 'Eliminar nota general' })
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))
    await waitFor(() => expect(deleted).toBe(true))
  })
})
