import { AlertTriangle, ArchiveRestore, CheckCircle2, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { isApiError } from '@/api/errors'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Select } from '@/components/common/Select'
import { Skeleton } from '@/components/common/Skeleton'
import { useBoard } from '@/features/board/hooks/useBoard'
import { useCompleteSprint, useSprints } from '@/features/sprints/hooks/useSprints'
import type { SprintSummary, UnfinishedAction } from '@/features/sprints/types'
import { sprintCompletionMessage } from '@/features/sprints/utils/sprintCompletion'

interface CompleteSprintModalProps {
  sprint: SprintSummary
  onClose: () => void
}

export function CompleteSprintModal({ sprint, onClose }: CompleteSprintModalProps) {
  const [unfinishedAction, setUnfinishedAction] = useState<UnfinishedAction>('backlog')
  const [nextSprintId, setNextSprintId] = useState('')
  const [selectionError, setSelectionError] = useState('')
  const boardQuery = useBoard(sprint.project_id, sprint.id)
  const plannedSprintsQuery = useSprints(sprint.project_id, { status: 'planned' })
  const completeMutation = useCompleteSprint()
  const plannedSprints = (plannedSprintsQuery.data?.data ?? []).filter((item) => item.id !== sprint.id)
  const completedTasks = boardQuery.data?.done.length ?? 0
  const unfinishedTasks = boardQuery.data
    ? boardQuery.data.todo.length + boardQuery.data.in_progress.length + boardQuery.data.blocked.length
    : 0

  const handleComplete = async () => {
    if (unfinishedAction === 'next_sprint' && !nextSprintId) {
      setSelectionError('Selecciona el Sprint de destino.')
      return
    }

    try {
      const selectedSprint = plannedSprints.find((item) => item.id === Number(nextSprintId))
      const result = await completeMutation.mutateAsync({
        projectId: sprint.project_id,
        sprintId: sprint.id,
        payload: unfinishedAction === 'backlog'
          ? { unfinished_action: 'backlog' }
          : { unfinished_action: 'next_sprint', next_sprint_id: Number(nextSprintId) },
      })
      toast.success('Sprint completado', {
        description: sprintCompletionMessage(result, unfinishedAction, selectedSprint?.name),
      })
      onClose()
    } catch (error: unknown) {
      toast.error(isApiError(error) ? error.message : 'No fue posible completar el Sprint.')
    }
  }

  return (
    <Modal
      description="Revisa el Sprint antes de elegir qué ocurrirá con el trabajo pendiente."
      onClose={completeMutation.isPending ? () => undefined : onClose}
      title="Completar Sprint"
    >
      <div className="px-5 py-6 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-800">
            <CheckCircle2 aria-hidden="true" size={21} />
          </div>
          <div>
            <p className="font-semibold text-zinc-950">{sprint.name}</p>
            <p className="mt-1 text-sm text-zinc-600">Resumen previo al cierre.</p>
          </div>
        </div>

        {boardQuery.isPending ? (
          <div aria-label="Cargando resumen del Sprint" className="mt-6 grid grid-cols-2 gap-3" role="status">
            {[0, 1, 2, 3].map((item) => <Skeleton className="h-20" key={item} />)}
          </div>
        ) : boardQuery.isError ? (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
            <span className="flex items-center gap-2"><AlertTriangle size={17} />{boardQuery.error.message}</span>
            <Button onClick={() => void boardQuery.refetch()} size="sm" variant="ghost">Reintentar</Button>
          </div>
        ) : (
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-zinc-50 p-4"><dt className="text-xs text-zinc-500">Planificados</dt><dd className="mt-1 text-xl font-semibold text-zinc-950">{sprint.planned_points} pts</dd></div>
            <div className="rounded-md bg-zinc-50 p-4"><dt className="text-xs text-zinc-500">Completados</dt><dd className="mt-1 text-xl font-semibold text-zinc-950">{sprint.completed_points} pts</dd></div>
            <div className="rounded-md bg-zinc-50 p-4"><dt className="text-xs text-zinc-500">Tareas completadas</dt><dd className="mt-1 text-xl font-semibold text-zinc-950">{completedTasks}</dd></div>
            <div className="rounded-md bg-zinc-50 p-4"><dt className="text-xs text-zinc-500">Tareas pendientes</dt><dd className="mt-1 text-xl font-semibold text-zinc-950">{unfinishedTasks}</dd></div>
          </dl>
        )}

        <fieldset className="mt-6" disabled={completeMutation.isPending || boardQuery.isPending || boardQuery.isError}>
          <legend className="text-sm font-semibold text-zinc-900">¿Qué debe ocurrir con las tareas pendientes?</legend>
          <label className={`mt-3 flex cursor-pointer items-start gap-3 rounded-md border p-3 ${unfinishedAction === 'backlog' ? 'border-emerald-700 bg-emerald-50' : 'border-zinc-200 bg-white'}`}>
            <input checked={unfinishedAction === 'backlog'} className="mt-1 accent-emerald-800" name="unfinished-action" onChange={() => { setUnfinishedAction('backlog'); setSelectionError('') }} type="radio" value="backlog" />
            <span><span className="block text-sm font-medium text-zinc-950">Mover al Backlog</span><span className="mt-0.5 block text-xs text-zinc-600">Las tareas pendientes quedarán sin Sprint.</span></span>
          </label>
          <label className={`mt-2 flex items-start gap-3 rounded-md border p-3 ${plannedSprints.length === 0 ? 'cursor-not-allowed bg-zinc-50 opacity-60' : 'cursor-pointer'} ${unfinishedAction === 'next_sprint' ? 'border-emerald-700 bg-emerald-50' : 'border-zinc-200'}`}>
            <input checked={unfinishedAction === 'next_sprint'} className="mt-1 accent-emerald-800" disabled={plannedSprintsQuery.isPending || plannedSprints.length === 0} name="unfinished-action" onChange={() => setUnfinishedAction('next_sprint')} type="radio" value="next_sprint" />
            <span className="block text-sm font-medium text-zinc-700">Mover al siguiente Sprint</span>
          </label>
          {unfinishedAction === 'next_sprint' && (
            <div className="mt-3 pl-7">
              <label className="mb-1.5 block text-sm font-medium text-zinc-800" htmlFor="next-sprint">Sprint destino</label>
              <Select
                aria-invalid={Boolean(selectionError)}
                id="next-sprint"
                onChange={(event) => { setNextSprintId(event.target.value); setSelectionError('') }}
                value={nextSprintId}
              >
                <option value="">Seleccionar Sprint</option>
                {plannedSprints.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
              {selectionError && <p className="mt-1.5 text-xs text-red-700">{selectionError}</p>}
            </div>
          )}
        </fieldset>
        <div className="mt-5 flex gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <ArchiveRestore aria-hidden="true" className="shrink-0" size={16} />
          Esta acción finalizará el Sprint y no se puede deshacer.
        </div>
      </div>
      <footer className="flex justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:px-6">
        <Button disabled={completeMutation.isPending} onClick={onClose} variant="ghost">Cancelar</Button>
        <Button disabled={completeMutation.isPending || boardQuery.isPending || boardQuery.isError} onClick={() => void handleComplete()}>
          {completeMutation.isPending && <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />}
          Completar Sprint
        </Button>
      </footer>
    </Modal>
  )
}
