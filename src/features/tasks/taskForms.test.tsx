import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import { TaskCreateModal } from '@/features/tasks/components/TaskCreateModal'
import { TaskDetailDrawer } from '@/features/tasks/components/TaskDetailDrawer'
import type { CreateTaskPayload, Task, UpdateTaskPayload } from '@/features/tasks/types'
import { Component as BoardPage } from '@/pages/BoardPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'
import { backlogKeys, boardKeys, projectKeys, taskKeys } from '@/api/queryKeys'

const task: Task = {
  id: 10,
  project_id: 7,
  sprint_id: null,
  title: 'Documentar API',
  description: 'Revisar contratos.',
  type: 'task',
  priority: 'high',
  status: 'backlog',
  story_points: 3,
  position: 0,
  completed_at: null,
  created_at: '2026-09-24T18:30:00.000000Z',
  updated_at: '2026-09-24T18:30:00.000000Z',
  tags: [],
  checklist: [],
}

const paginatedSprints = {
  data: [{ id: 3, project_id: 7, name: 'Sprint 1', start_date: null, end_date: null, status: 'active', planned_points: 8, completed_points: 3, progress_percentage: 37.5, completed_at: null }],
  links: { first: '/page=1', last: '/page=1', prev: null, next: null },
  meta: { current_page: 1, from: 1, last_page: 1, per_page: 15, to: 1, total: 1 },
}

function supportingHandlers() {
  return [
    http.get('*/api/tags', () => HttpResponse.json({ data: [{ id: 4, name: 'backend', color: '#22C55E', created_at: '', updated_at: '' }] })),
    http.get('*/api/projects/7/sprints', () => HttpResponse.json(paginatedSprints)),
  ]
}

function ClosableTaskDrawer({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <TaskDetailDrawer
      onClose={() => {
        setIsOpen(false)
        onClose()
      }}
      projectId={7}
      taskId={10}
    />
  )
}

describe('task forms', () => {
  it('creates a backlog task and synchronizes selected tags', async () => {
    let createPayload: CreateTaskPayload | undefined
    let tagIds: number[] | undefined
    server.use(
      ...supportingHandlers(),
      http.post('*/api/projects/7/tasks', async ({ request }) => {
        createPayload = await request.json() as CreateTaskPayload
        return HttpResponse.json({ data: { ...task, ...createPayload } }, { status: 201 })
      }),
      http.put('*/api/tasks/10/tags', async ({ request }) => {
        tagIds = ((await request.json()) as { tag_ids: number[] }).tag_ids
        return HttpResponse.json({ data: [] })
      }),
    )

    const onClose = vi.fn()
    const { user } = renderWithProviders(<TaskCreateModal onClose={onClose} projectId={7} />)

    await user.type(screen.getByLabelText('Título'), 'Nueva tarea')
    await user.selectOptions(screen.getByLabelText('Story Points'), '5')
    await user.click(await screen.findByRole('checkbox', { name: 'backend' }))
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(createPayload).toMatchObject({ title: 'Nueva tarea', status: 'backlog', story_points: 5 })
    expect(tagIds).toEqual([4])
  })

  it('edits task fields and changes sprint through the dedicated endpoint', async () => {
    let updatePayload: UpdateTaskPayload | undefined
    let sprintId: number | null | undefined
    server.use(
      ...supportingHandlers(),
      http.get('*/api/projects/7/tasks/10', () => HttpResponse.json({ data: task })),
      http.patch('*/api/projects/7/tasks/10', async ({ request }) => {
        updatePayload = await request.json() as UpdateTaskPayload
        return HttpResponse.json({ data: { ...task, ...updatePayload } })
      }),
      http.patch('*/api/projects/7/tasks/10/sprint', async ({ request }) => {
        sprintId = ((await request.json()) as { sprint_id: number | null }).sprint_id
        return HttpResponse.json({ data: { ...task, sprint_id: sprintId, status: 'todo' } })
      }),
    )

    const onClose = vi.fn()
    const { user } = renderWithProviders(<TaskDetailDrawer onClose={onClose} projectId={7} taskId={10} />)

    const title = await screen.findByLabelText('Título')
    await user.clear(title)
    await user.type(title, 'API documentada')
    await user.selectOptions(screen.getByLabelText('Sprint'), '3')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(updatePayload).toMatchObject({ title: 'API documentada', priority: 'high', type: 'task', story_points: 3 })
    expect(updatePayload).not.toHaveProperty('sprint_id')
    expect(sprintId).toBe(3)
  })

  it('opens task detail from a board URL', async () => {
    server.use(
      ...supportingHandlers(),
      http.get('*/api/projects/7/tasks/10', () => HttpResponse.json({ data: task })),
    )

    renderWithProviders(
      <Routes><Route element={<BoardPage />} path="/projects/:projectId/board" /></Routes>,
      '/projects/7/board?task=10',
    )

    expect(await screen.findByRole('dialog', { name: 'Detalle de tarea' })).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Documentar API')).toBeInTheDocument()
  })

  it('toggles checklist items and updates visible progress', async () => {
    const checklistItem = { id: 20, task_id: 10, title: 'Controller', is_completed: false, position: 0, created_at: '', updated_at: '' }
    server.use(
      ...supportingHandlers(),
      http.get('*/api/projects/7/tasks/10', () => HttpResponse.json({ data: { ...task, checklist: [checklistItem] } })),
      http.patch('*/api/tasks/10/checklist/20', async ({ request }) => {
        expect(await request.json()).toEqual({ is_completed: true })
        return HttpResponse.json({ data: { ...checklistItem, is_completed: true } })
      }),
    )

    const { user } = renderWithProviders(<TaskDetailDrawer onClose={vi.fn()} projectId={7} taskId={10} />)
    await user.click(await screen.findByRole('button', { name: 'Marcar Controller' }))

    expect(await screen.findByRole('progressbar', { name: 'Progreso del checklist: 100%' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desmarcar Controller' })).toBeInTheDocument()
  })

  it('moves a Sprint task back to backlog and invalidates related cache', async () => {
    const sprintTask = { ...task, sprint_id: 3, status: 'todo' as const }
    let sprintId: number | null | undefined
    server.use(
      ...supportingHandlers(),
      http.get('*/api/projects/7/tasks/10', () => HttpResponse.json({ data: sprintTask })),
      http.patch('*/api/projects/7/tasks/10', async ({ request }) => HttpResponse.json({ data: { ...sprintTask, ...(await request.json() as object) } })),
      http.patch('*/api/projects/7/tasks/10/sprint', async ({ request }) => {
        sprintId = ((await request.json()) as { sprint_id: number | null }).sprint_id
        return HttpResponse.json({ data: { ...sprintTask, sprint_id: null, status: 'backlog' } })
      }),
    )
    const { user, queryClient } = renderWithProviders(<TaskDetailDrawer onClose={vi.fn()} projectId={7} taskId={10} />)
    queryClient.setQueryData(projectKeys.stats(7), { progress: 10 })
    queryClient.setQueryData(backlogKeys.list(7), { data: [] })

    const sprintSelect = await screen.findByLabelText('Sprint')
    await waitFor(() => expect(sprintSelect).toBeEnabled())
    expect(sprintSelect).toHaveValue('3')
    await user.selectOptions(sprintSelect, '')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => expect(sprintId).toBeNull())
    expect(queryClient.getQueryData(taskKeys.detail(7, 10))).toMatchObject({ sprint_id: null, status: 'backlog' })
    expect(queryClient.getQueryState(projectKeys.stats(7))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(backlogKeys.list(7))?.isInvalidated).toBe(true)
  })

  it('confirms task deletion, closes the drawer and invalidates related cache', async () => {
    let deleted = false
    server.use(
      ...supportingHandlers(),
      http.get('*/api/projects/7/tasks/10', () => HttpResponse.json({ data: task })),
      http.delete('*/api/projects/7/tasks/10', () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const onClose = vi.fn()
    const { user, queryClient } = renderWithProviders(
      <ClosableTaskDrawer onClose={onClose} />,
    )
    queryClient.setQueryData(backlogKeys.list(7), { data: [task] })
    queryClient.setQueryData(boardKeys.detail(7), { todo: [task] })
    queryClient.setQueryData(projectKeys.stats(7), { progress: 10 })

    await user.click(await screen.findByRole('button', { name: 'Eliminar tarea' }))
    const dialog = screen.getByRole('dialog', { name: 'Eliminar tarea' })
    expect(within(dialog).getByText(/Documentar API/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar tarea' }))

    await waitFor(() => expect(deleted).toBe(true))
    expect(onClose).toHaveBeenCalledOnce()
    expect(queryClient.getQueryData(taskKeys.detail(7, 10))).toBeUndefined()
    expect(queryClient.getQueryState(backlogKeys.list(7))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(boardKeys.detail(7))?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(projectKeys.stats(7))?.isInvalidated).toBe(true)
  })
})
