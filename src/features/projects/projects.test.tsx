import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'

import { ProjectFormModal } from '@/features/projects/components/ProjectFormModal'
import type { CreateProjectPayload, Project, ProjectSummary } from '@/features/projects/types'
import { Component as ProjectsPage } from '@/pages/ProjectsPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

const project: Project = {
  id: 1,
  name: 'Momentum API',
  description: 'Gestor personal de proyectos',
  status: 'active',
  priority: 'high',
  color: '#059669',
  icon: 'rocket',
  progress: 40,
  tasks_count: 12,
  start_date: '2026-09-01',
  target_date: '2026-10-31',
  created_at: '2026-09-01T12:00:00.000000Z',
  updated_at: '2026-09-24T12:00:00.000000Z',
}

const summary: ProjectSummary = project

function paginatedProjects(items: ProjectSummary[]) {
  return {
    data: items,
    links: { first: '/api/projects?page=1', last: '/api/projects?page=1', prev: null, next: null },
    meta: {
      current_page: 1,
      from: items.length ? 1 : null,
      last_page: 1,
      per_page: 15,
      to: items.length || null,
      total: items.length,
    },
  }
}

describe('projects', () => {
  it('loads and displays projects', async () => {
    server.use(http.get('*/api/projects', () => HttpResponse.json(paginatedProjects([summary]))))

    renderWithProviders(<ProjectsPage />, '/projects')

    expect(await screen.findByRole('heading', { name: 'Momentum API' })).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir proyecto Momentum API' })).toHaveAttribute(
      'href',
      '/projects/1',
    )
  })

  it('sends the create project request', async () => {
    let requestPayload: CreateProjectPayload | undefined
    server.use(
      http.post('*/api/projects', async ({ request }) => {
        requestPayload = (await request.json()) as CreateProjectPayload
        return HttpResponse.json({ data: { ...project, ...requestPayload, id: 2 } }, { status: 201 })
      }),
    )
    const onClose = vi.fn()
    const { user } = renderWithProviders(<ProjectFormModal onClose={onClose} />)

    await user.type(screen.getByLabelText('Nombre'), 'Nuevo proyecto')
    await user.type(screen.getByLabelText('Descripción'), 'Descripción inicial')
    await user.type(screen.getByLabelText('Fecha de inicio'), '2026-09-24')
    await user.type(screen.getByLabelText('Fecha objetivo'), '2026-10-24')
    await user.click(screen.getByRole('button', { name: 'Crear proyecto' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(requestPayload).toMatchObject({
      name: 'Nuevo proyecto',
      description: 'Descripción inicial',
      start_date: '2026-09-24',
      target_date: '2026-10-24',
    })
  })

  it('loads initial values and updates a project', async () => {
    let requestPayload: Partial<CreateProjectPayload> | undefined
    server.use(
      http.get('*/api/projects/1', () => HttpResponse.json({ data: project })),
      http.patch('*/api/projects/1', async ({ request }) => {
        requestPayload = (await request.json()) as Partial<CreateProjectPayload>
        return HttpResponse.json({ data: { ...project, ...requestPayload } })
      }),
    )
    const onClose = vi.fn()
    const { user } = renderWithProviders(<ProjectFormModal onClose={onClose} project={summary} />)
    const nameInput = await screen.findByLabelText('Nombre')

    expect(nameInput).toHaveValue('Momentum API')
    expect(screen.getByLabelText('Descripción')).toHaveValue('Gestor personal de proyectos')

    await user.clear(nameInput)
    await user.type(nameInput, 'Momentum renovado')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(requestPayload).toMatchObject({ name: 'Momentum renovado' })
  })
})
