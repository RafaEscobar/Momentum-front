import { CalendarDays, Pencil, Play } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { isApiError } from '@/api/errors'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SprintFormModal } from '@/features/sprints/components/SprintFormModal'
import { StoryPointsSummary } from '@/features/sprints/components/StoryPointsSummary'
import { useSprint, useStartSprint } from '@/features/sprints/hooks'
import type { SprintStatus, SprintSummary } from '@/features/sprints/types'

interface SprintCardProps { projectId: number; sprint: SprintSummary }

const status: Record<SprintStatus, { label: string; variant: 'info' | 'success' | 'neutral' }> = {
  planned: { label: 'Planificado', variant: 'info' },
  active: { label: 'Activo', variant: 'success' },
  completed: { label: 'Completado', variant: 'neutral' },
}

function formatDate(value: string | null) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

export function SprintCard({ projectId, sprint }: SprintCardProps) {
  const detailQuery = useSprint(projectId, sprint.id)
  const startMutation = useStartSprint()
  const [showStart, setShowStart] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const start = async () => {
    try { await startMutation.mutateAsync({ projectId, sprintId: sprint.id }); toast.success('Sprint iniciado'); setShowStart(false) }
    catch (caught) { toast.error(isApiError(caught) ? caught.message : 'No fue posible iniciar el Sprint.'); setShowStart(false) }
  }

  return <article className="rounded-md border border-zinc-200 bg-white p-5">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-semibold text-zinc-950">{sprint.name}</h3><div className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><CalendarDays size={16} /><span>{formatDate(sprint.start_date)} → {formatDate(sprint.end_date)}</span></div></div><Badge variant={status[sprint.status].variant}>{status[sprint.status].label}</Badge></div>
    <div className="mt-5 min-h-14"><p className="text-xs font-semibold uppercase text-zinc-500">Objetivo</p><p className="mt-1 line-clamp-2 text-sm text-zinc-700">{detailQuery.isPending ? 'Cargando objetivo...' : detailQuery.data?.goal || 'Sin objetivo definido.'}</p></div>
    <div className="mt-5"><StoryPointsSummary completed={sprint.completed_points} label={`Progreso de ${sprint.name}`} percentage={sprint.progress_percentage} total={sprint.planned_points} /></div>
    <div className="mt-5 flex justify-end gap-2">{sprint.status === 'planned' && <Button onClick={() => setShowStart(true)} size="sm"><Play size={16} />Iniciar</Button>}<Button disabled={!detailQuery.data} onClick={() => setShowEdit(true)} size="sm" variant="secondary"><Pencil size={16} />Editar</Button></div>
    {showStart && <ConfirmDialog confirmLabel="Iniciar Sprint" description={`Se activará “${sprint.name}”. Solo puede existir un Sprint activo.`} isPending={startMutation.isPending} onCancel={() => setShowStart(false)} onConfirm={() => void start()} title="Iniciar Sprint" />}
    {showEdit && detailQuery.data && <SprintFormModal onClose={() => setShowEdit(false)} projectId={projectId} sprint={detailQuery.data} />}
  </article>
}
