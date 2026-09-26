import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, LoaderCircle, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { isApiError } from '@/api/errors'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Textarea } from '@/components/common/Textarea'
import { useCreateSprint, useUpdateSprint } from '@/features/sprints/hooks'
import { sprintSchema } from '@/features/sprints/schemas/sprintSchema'
import type { SprintFormValues } from '@/features/sprints/schemas/sprintSchema'
import type { Sprint } from '@/features/sprints/types'

interface SprintFormModalProps { projectId: number; sprint?: Sprint; onClose: () => void }

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-red-700">{message}</p> : null
}

export function SprintFormModal({ projectId, sprint, onClose }: SprintFormModalProps) {
  const createMutation = useCreateSprint()
  const updateMutation = useUpdateSprint()
  const { clearErrors, formState: { errors, isSubmitting }, handleSubmit, register, setError } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: { name: sprint?.name ?? '', goal: sprint?.goal ?? '', start_date: sprint?.start_date ?? '', end_date: sprint?.end_date ?? '' },
  })
  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root')
    try {
      const payload = { name: values.name.trim(), goal: values.goal.trim() || null, start_date: values.start_date || null, end_date: values.end_date || null }
      if (sprint) {
        await updateMutation.mutateAsync({ projectId, sprintId: sprint.id, payload })
        toast.success('Sprint actualizado')
      } else {
        await createMutation.mutateAsync({ projectId, payload: { ...payload, status: 'planned' } })
        toast.success('Sprint creado')
      }
      onClose()
    } catch (caught) {
      if (!isApiError(caught)) { setError('root.server', { message: 'No fue posible guardar el Sprint.' }); return }
      let fieldError = false
      for (const field of ['name', 'goal', 'start_date', 'end_date'] as const) {
        const message = caught.validationErrors?.[field]?.[0]
        if (message) { setError(field, { message }); fieldError = true }
      }
      if (!fieldError) setError('root.server', { message: caught.message })
    }
  })

  return <Modal onClose={onClose} title={sprint ? 'Editar Sprint' : 'Crear Sprint'}><form noValidate onSubmit={(event) => void onSubmit(event)}>
    <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
      <div className="sm:col-span-2"><label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="sprint-name">Nombre</label><Input {...register('name')} aria-invalid={Boolean(errors.name)} autoFocus id="sprint-name" maxLength={255} /><FieldError message={errors.name?.message} /></div>
      <div className="sm:col-span-2"><label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="sprint-goal">Objetivo</label><Textarea {...register('goal')} aria-invalid={Boolean(errors.goal)} id="sprint-goal" maxLength={10000} /><FieldError message={errors.goal?.message} /></div>
      <div><label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="sprint-start">Fecha inicial</label><Input {...register('start_date')} aria-invalid={Boolean(errors.start_date)} id="sprint-start" type="date" /><FieldError message={errors.start_date?.message} /></div>
      <div><label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="sprint-end">Fecha final</label><Input {...register('end_date')} aria-invalid={Boolean(errors.end_date)} id="sprint-end" type="date" /><FieldError message={errors.end_date?.message} /></div>
      {errors.root?.server?.message && <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:col-span-2"><AlertTriangle className="shrink-0" size={17} />{errors.root.server.message}</div>}
    </div>
    <footer className="flex justify-end gap-3 border-t border-zinc-200 px-5 py-4 sm:px-6"><Button disabled={isSubmitting} onClick={onClose} variant="secondary">Cancelar</Button><Button disabled={isSubmitting} type="submit">{isSubmitting ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}Guardar</Button></footer>
  </form></Modal>
}
