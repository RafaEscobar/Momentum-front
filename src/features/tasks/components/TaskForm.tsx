import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, LoaderCircle, Save } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { isApiError } from '@/api/errors'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Textarea } from '@/components/common/Textarea'
import { useSprints } from '@/features/sprints/hooks/useSprints'
import { TagManager } from '@/features/tags/components/TagManager'
import { useSyncTaskTags, useTags } from '@/features/tags/hooks/useTags'
import { useChangeTaskSprint, useCreateTask, useUpdateTask } from '@/features/tasks/hooks'
import { taskFormSchema } from '@/features/tasks/schemas/taskSchema'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'
import type { CreateTaskPayload, StoryPoints, Task } from '@/features/tasks/types'

interface TaskFormProps {
  projectId: number
  task?: Task
  onClose: () => void
}

function defaults(task?: Task): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    type: task?.type ?? 'task',
    priority: task?.priority ?? 'medium',
    status: task?.status ?? 'backlog',
    story_points: task?.story_points ? String(task.story_points) as TaskFormValues['story_points'] : '',
    sprint_id: task?.sprint_id ? String(task.sprint_id) : '',
    tag_ids: task?.tags?.map((tag) => tag.id) ?? [],
  }
}

function payloadFrom(values: TaskFormValues): CreateTaskPayload {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    type: values.type,
    priority: values.priority,
    status: values.status,
    story_points: values.story_points ? Number(values.story_points) as StoryPoints : null,
    sprint_id: values.sprint_id ? Number(values.sprint_id) : null,
  }
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-red-700">{message}</p> : null
}

export function TaskForm({ projectId, task, onClose }: TaskFormProps) {
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const sprintMutation = useChangeTaskSprint()
  const tagsMutation = useSyncTaskTags()
  const tagsQuery = useTags()
  const activeSprintsQuery = useSprints(projectId, { status: 'active' })
  const plannedSprintsQuery = useSprints(projectId, { status: 'planned' })
  const availableSprints = [...(activeSprintsQuery.data?.data ?? []), ...(plannedSprintsQuery.data?.data ?? [])]
    .filter((sprint, index, items) => items.findIndex((item) => item.id === sprint.id) === index)
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaults(task),
  })

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root')

    try {
      const payload = payloadFrom(values)

      if (!task) {
        const created = await createMutation.mutateAsync({ projectId, payload })
        if (values.tag_ids.length > 0) {
          await tagsMutation.mutateAsync({ projectId, taskId: created.id, tagIds: values.tag_ids })
        }
        toast.success('Tarea creada')
      } else {
        const editablePayload = {
          title: payload.title,
          description: payload.description,
          type: payload.type,
          priority: payload.priority,
          status: payload.status,
          story_points: payload.story_points,
        }
        await updateMutation.mutateAsync({ projectId, taskId: task.id, payload: editablePayload })

        const nextSprintId = values.sprint_id ? Number(values.sprint_id) : null
        if (nextSprintId !== task.sprint_id) {
          await sprintMutation.mutateAsync({ projectId, taskId: task.id, sprintId: nextSprintId })
        }

        const currentTagIds = (task.tags ?? []).map((tag) => tag.id).sort((a, b) => a - b)
        const nextTagIds = [...values.tag_ids].sort((a, b) => a - b)
        if (currentTagIds.join(',') !== nextTagIds.join(',')) {
          await tagsMutation.mutateAsync({ projectId, taskId: task.id, tagIds: nextTagIds })
        }
        toast.success('Tarea actualizada')
      }

      onClose()
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setError('root.server', { message: 'No fue posible guardar la tarea.' })
        return
      }

      const fields = ['title', 'description', 'type', 'priority', 'status', 'story_points', 'sprint_id', 'tag_ids'] as const
      let hasFieldError = false
      for (const field of fields) {
        const message = error.validationErrors?.[field]?.[0]
        if (message) {
          setError(field, { message })
          hasFieldError = true
        }
      }
      if (!hasFieldError) setError('root.server', { message: error.message })
    }
  })

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)}>
      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="task-title">Título</label>
          <Input {...register('title')} aria-invalid={Boolean(errors.title)} autoFocus id="task-title" maxLength={255} />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="task-description">Descripción</label>
          <Textarea {...register('description')} aria-invalid={Boolean(errors.description)} id="task-description" maxLength={10000} />
          <FieldError message={errors.description?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="task-type">Tipo</label>
          <Select {...register('type')} id="task-type">
            <option value="task">Tarea</option><option value="story">Historia</option><option value="bug">Bug</option><option value="improvement">Mejora</option>
          </Select>
          <FieldError message={errors.type?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="task-priority">Prioridad</label>
          <Select {...register('priority')} id="task-priority">
            <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option>
          </Select>
          <FieldError message={errors.priority?.message} />
        </div>

        {task && <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="task-status">Estado</label>
          <Select {...register('status')} id="task-status">
            <option value="backlog">Backlog</option><option value="todo">Por hacer</option><option value="in_progress">En progreso</option><option value="blocked">Bloqueada</option><option value="done">Terminada</option>
          </Select>
          <FieldError message={errors.status?.message} />
        </div>}

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="task-points">Story Points</label>
          <Select {...register('story_points')} id="task-points">
            <option value="">Sin estimar</option>{[1, 2, 3, 5, 8, 13].map((point) => <option key={point} value={point}>{point}</option>)}
          </Select>
          <FieldError message={errors.story_points?.message} />
        </div>

        <div className={task ? 'sm:col-span-2' : ''}>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="task-sprint">Sprint</label>
          <Controller control={control} name="sprint_id" render={({ field }) => <Select {...field} disabled={activeSprintsQuery.isPending || plannedSprintsQuery.isPending} id="task-sprint">
              <option value="">Backlog, sin Sprint</option>
              {task?.sprint_id && !availableSprints.some((sprint) => sprint.id === task.sprint_id) && <option value={task.sprint_id}>Sprint actual</option>}
              {availableSprints.map((sprint) => <option key={sprint.id} value={sprint.id}>{sprint.name} ({sprint.status === 'active' ? 'activo' : 'planificado'})</option>)}
            </Select>} />
          <FieldError message={errors.sprint_id?.message ?? (activeSprintsQuery.isError ? activeSprintsQuery.error.message : plannedSprintsQuery.isError ? plannedSprintsQuery.error.message : undefined)} />
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium text-zinc-800">Etiquetas</legend>
          {tagsQuery.isPending ? <p className="text-sm text-zinc-500">Cargando etiquetas...</p> : tagsQuery.isError ? <p className="text-sm text-red-700">{tagsQuery.error.message}</p> : (
            <Controller control={control} name="tag_ids" render={({ field }) => <>{tagsQuery.data.length === 0 ? <p className="text-sm text-zinc-500">No hay etiquetas disponibles.</p> : <div className="flex flex-wrap gap-2">{tagsQuery.data.map((tag) => {
              const selected = field.value.includes(tag.id)
              return <label className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${selected ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-zinc-300 text-zinc-700'}`} key={tag.id}>
                <input checked={selected} className="size-4 accent-emerald-800" onChange={() => field.onChange(selected ? field.value.filter((id) => id !== tag.id) : [...field.value, tag.id])} type="checkbox" />
                <span className="size-2.5 rounded-full" style={{ backgroundColor: tag.color }} />{tag.name}
              </label>
            })}</div>}<TagManager onDeleted={(tagId) => field.onChange(field.value.filter((id) => id !== tagId))} tags={tagsQuery.data} /></>} />
          )}
          <FieldError message={errors.tag_ids?.message} />
        </fieldset>

        {errors.root?.server?.message && <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:col-span-2"><AlertTriangle className="mt-0.5 shrink-0" size={17} />{errors.root.server.message}</div>}
      </div>

      <footer className="flex justify-end gap-3 border-t border-zinc-200 px-5 py-4 sm:px-6">
        <Button disabled={isSubmitting} onClick={onClose} variant="secondary">Cancelar</Button>
        <Button disabled={isSubmitting} type="submit">{isSubmitting ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}Guardar</Button>
      </footer>
    </form>
  )
}
