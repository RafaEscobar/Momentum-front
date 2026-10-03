import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Drawer } from '@/components/common/Drawer'
import { Skeleton } from '@/components/common/Skeleton'
import { ChecklistEditor } from '@/features/tasks/components/ChecklistEditor'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import { useDeleteTask, useTask } from '@/features/tasks/hooks'

interface TaskDetailDrawerProps { projectId: number; taskId: number; onClose: () => void }

export function TaskDetailDrawer({ projectId, taskId, onClose }: TaskDetailDrawerProps) {
  const taskQuery = useTask(projectId, taskId)
  const deleteMutation = useDeleteTask()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const deleteCurrentTask = async () => {
    try {
      await deleteMutation.mutateAsync({ projectId, taskId })
      toast.success('Tarea eliminada')
      onClose()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'No fue posible eliminar la tarea.')
    }
  }

  return <Drawer onClose={deleteMutation.isPending ? () => undefined : onClose} title="Detalle de tarea">
    {taskQuery.isPending ? <div aria-label="Cargando tarea" className="space-y-4 p-6" role="status"><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : taskQuery.isError ? <div className="grid place-items-center gap-3 p-10 text-center"><AlertTriangle className="text-red-600" size={30} /><p className="text-sm text-zinc-600">{taskQuery.error.message}</p><Button onClick={() => void taskQuery.refetch()} size="sm" variant="secondary"><RefreshCw size={16} />Reintentar</Button></div> : <>
      <TaskForm onClose={onClose} projectId={projectId} task={taskQuery.data} />
      <ChecklistEditor items={taskQuery.data.checklist ?? []} projectId={projectId} taskId={taskId} />
      <section className="border-t border-zinc-200 px-5 py-5 sm:px-6">
        <h3 className="text-sm font-semibold text-zinc-950">Eliminar tarea</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Esta acción eliminará definitivamente la tarea y sus datos asociados.
        </p>
        <Button
          className="mt-4"
          disabled={deleteMutation.isPending}
          onClick={() => setShowDeleteConfirmation(true)}
          size="sm"
          variant="danger"
        >
          <Trash2 aria-hidden="true" size={16} />
          Eliminar tarea
        </Button>
      </section>
      {showDeleteConfirmation && (
        <ConfirmDialog
          confirmLabel="Eliminar tarea"
          description={`“${taskQuery.data.title}” se eliminará definitivamente junto con su checklist y asociaciones. Esta acción no se puede deshacer.`}
          isPending={deleteMutation.isPending}
          onCancel={() => setShowDeleteConfirmation(false)}
          onConfirm={() => void deleteCurrentTask()}
          title="Eliminar tarea"
        />
      )}
    </>}
  </Drawer>
}
