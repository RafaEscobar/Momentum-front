import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, LoaderCircle, Save } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { isApiError } from '@/api/errors'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Select } from '@/components/common/Select'
import { Spinner } from '@/components/common/Spinner'
import { Textarea } from '@/components/common/Textarea'
import { useCreateProject, useProject, useUpdateProject } from '@/features/projects/hooks'
import { projectSchema } from '@/features/projects/schemas/projectSchema'
import type { ProjectFormValues } from '@/features/projects/schemas/projectSchema'
import type { CreateProjectPayload, Project, ProjectSummary } from '@/features/projects/types'

interface ProjectFormModalProps {
  project?: ProjectSummary
  onClose: () => void
}

interface ProjectFormProps {
  project?: Project
  onClose: () => void
}

function toDefaultValues(project?: Project): ProjectFormValues {
  return {
    name: project?.name ?? '',
    description: project?.description ?? '',
    status: project?.status ?? 'active',
    priority: project?.priority ?? 'medium',
    color: project?.color ?? '#059669',
    icon: project?.icon ?? '',
    start_date: project?.start_date ?? '',
    target_date: project?.target_date ?? '',
  }
}

function toPayload(values: ProjectFormValues): CreateProjectPayload {
  return {
    name: values.name,
    description: values.description.trim() || null,
    status: values.status,
    priority: values.priority,
    color: values.color,
    icon: values.icon || null,
    start_date: values.start_date || null,
    target_date: values.target_date || null,
  }
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-red-700">{message}</p> : null
}

function ProjectForm({ project, onClose }: ProjectFormProps) {
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: toDefaultValues(project),
  })
  const selectedColor = useWatch({ control, name: 'color' })

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root')

    try {
      const payload = toPayload(values)

      if (project) {
        await updateMutation.mutateAsync({ projectId: project.id, payload })
        toast.success('Proyecto actualizado')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Proyecto creado')
      }

      onClose()
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setError('root.server', { message: 'No fue posible guardar el proyecto.' })
        return
      }

      let hasFieldError = false
      const fields = [
        'name',
        'description',
        'status',
        'priority',
        'color',
        'icon',
        'start_date',
        'target_date',
      ] as const

      for (const field of fields) {
        const message = error.validationErrors?.[field]?.[0]

        if (message) {
          setError(field, { message })
          hasFieldError = true
        }
      }

      if (!hasFieldError) {
        setError('root.server', { message: error.message })
      }
    }
  })

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)}>
      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="project-name">
            Nombre
          </label>
          <Input
            {...register('name')}
            aria-invalid={Boolean(errors.name)}
            autoFocus
            id="project-name"
            maxLength={255}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="project-description">
            Descripción
          </label>
          <Textarea
            {...register('description')}
            aria-invalid={Boolean(errors.description)}
            id="project-description"
            maxLength={10000}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="project-status">
            Estado
          </label>
          <Select {...register('status')} id="project-status">
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
            <option value="completed">Completado</option>
            <option value="archived">Archivado</option>
          </Select>
          <FieldError message={errors.status?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="project-priority">
            Prioridad
          </label>
          <Select {...register('priority')} id="project-priority">
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </Select>
          <FieldError message={errors.priority?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="project-color">
            Color
          </label>
          <div className="flex h-10 items-center gap-3 rounded-md border border-zinc-300 bg-white px-2">
            <input
              {...register('color')}
              aria-label="Seleccionar color"
              className="size-7 cursor-pointer border-0 bg-transparent p-0"
              id="project-color"
              type="color"
            />
            <span className="text-sm font-medium uppercase text-zinc-600">{selectedColor}</span>
          </div>
          <FieldError message={errors.color?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="project-icon">
            Icono
          </label>
          <Input
            {...register('icon')}
            aria-invalid={Boolean(errors.icon)}
            id="project-icon"
            maxLength={50}
            placeholder="rocket"
          />
          <FieldError message={errors.icon?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="project-start-date">
            Fecha de inicio
          </label>
          <Input
            {...register('start_date')}
            aria-invalid={Boolean(errors.start_date)}
            id="project-start-date"
            type="date"
          />
          <FieldError message={errors.start_date?.message} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="project-target-date">
            Fecha objetivo
          </label>
          <Input
            {...register('target_date')}
            aria-invalid={Boolean(errors.target_date)}
            id="project-target-date"
            type="date"
          />
          <FieldError message={errors.target_date?.message} />
        </div>

        {errors.root?.server && (
          <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 sm:col-span-2" role="alert">
            <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={17} />
            {errors.root.server.message}
          </div>
        )}
      </div>

      <footer className="flex justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:px-6">
        <Button
          disabled={isSubmitting}
          onClick={onClose}
          variant="ghost"
        >
          Cancelar
        </Button>
        <Button
          className="min-w-32"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Spinner size={17} />
          ) : (
            <Save aria-hidden="true" size={17} />
          )}
          {project ? 'Guardar cambios' : 'Crear proyecto'}
        </Button>
      </footer>
    </form>
  )
}

export function ProjectFormModal({ project, onClose }: ProjectFormModalProps) {
  const projectQuery = useProject(project?.id ?? 0)
  const isEditing = Boolean(project)

  return (
    <Modal
      description={isEditing ? 'Actualiza la información y planificación del proyecto.' : 'Define la información inicial del proyecto.'}
      onClose={onClose}
      title={isEditing ? 'Editar proyecto' : 'Crear proyecto'}
    >
      {isEditing && projectQuery.isPending ? (
        <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-zinc-600" role="status">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={19} />
          Cargando proyecto
        </div>
      ) : isEditing && projectQuery.isError ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <AlertTriangle aria-hidden="true" className="text-red-600" size={26} />
          <p className="mt-3 text-sm text-zinc-700">{projectQuery.error.message}</p>
          <button
            className="mt-4 h-9 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white"
            onClick={() => void projectQuery.refetch()}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ProjectForm onClose={onClose} project={projectQuery.data} />
      )}
    </Modal>
  )
}
