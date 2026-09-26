import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { Component as NotesPage } from '@/pages/NotesPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

const summary = { id: 4, project_id: 7, title: 'Arquitectura' }
const detail = { ...summary, content: '# Decisiones\n\n<script>alert("xss")</script>\n\nUsar React Query.' }

function page(data: unknown[]) {
  return {
    data,
    links: { first: '', last: '', prev: null, next: null },
    meta: {
      current_page: 1,
      from: data.length ? 1 : null,
      last_page: 1,
      per_page: 15,
      to: data.length,
      total: data.length,
    },
  }
}

function projectHandler() {
  return http.get('*/api/projects/7', () => HttpResponse.json({ data: {
    id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0,
  } }))
}

describe('Notes page', () => {
  it('loads note details, previews safe Markdown and updates the note', async () => {
    let updatePayload: Record<string, unknown> | undefined
    server.use(
      projectHandler(),
      http.get('*/api/projects/7/notes', () => HttpResponse.json(page([summary]))),
      http.get('*/api/projects/7/notes/4', () => HttpResponse.json({ data: detail })),
      http.patch('*/api/projects/7/notes/4', async ({ request }) => {
        updatePayload = await request.json() as Record<string, unknown>
        return HttpResponse.json({ data: { ...detail, ...updatePayload } })
      }),
    )

    const { user } = renderWithProviders(
      <Routes><Route element={<NotesPage />} path="/projects/:projectId/notes" /></Routes>,
      '/projects/7/notes',
    )

    await user.click(await screen.findByRole('button', { name: 'Editar nota Arquitectura' }))
    expect(await screen.findByLabelText('Contenido')).toHaveValue(detail.content)
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByRole('heading', { name: 'Decisiones' })).toBeInTheDocument()
    expect(document.querySelector('script')).not.toBeInTheDocument()
    await user.clear(screen.getByLabelText('Título'))
    await user.type(screen.getByLabelText('Título'), 'Arquitectura actualizada')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(updatePayload).toMatchObject({
      title: 'Arquitectura actualizada',
      content: detail.content,
    }))
  })

  it('creates and deletes notes', async () => {
    let notes = [summary]
    let createPayload: Record<string, unknown> | undefined
    let deleted = false
    server.use(
      projectHandler(),
      http.get('*/api/projects/7/notes', () => HttpResponse.json(page(notes))),
      http.post('*/api/projects/7/notes', async ({ request }) => {
        createPayload = await request.json() as Record<string, unknown>
        const created = { id: 5, project_id: 7, ...createPayload }
        notes = [...notes, created as typeof summary]
        return HttpResponse.json({ data: created }, { status: 201 })
      }),
      http.delete('*/api/projects/7/notes/4', () => {
        deleted = true
        notes = notes.filter((note) => note.id !== 4)
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { user } = renderWithProviders(
      <Routes><Route element={<NotesPage />} path="/projects/:projectId/notes" /></Routes>,
      '/projects/7/notes',
    )

    await user.click(await screen.findByRole('button', { name: 'Nueva nota' }))
    await user.type(screen.getByLabelText('Título'), 'Runbook')
    await user.type(screen.getByLabelText('Contenido'), '## Deploy')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(createPayload).toEqual({ title: 'Runbook', content: '## Deploy' }))

    await user.click(await screen.findByRole('button', { name: 'Eliminar nota Arquitectura' }))
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    await waitFor(() => expect(deleted).toBe(true))
  })
})
