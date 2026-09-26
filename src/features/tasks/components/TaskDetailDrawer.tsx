import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Drawer } from '@/components/common/Drawer'
import { Skeleton } from '@/components/common/Skeleton'
import { ChecklistEditor } from '@/features/tasks/components/ChecklistEditor'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import { useTask } from '@/features/tasks/hooks'

interface TaskDetailDrawerProps { projectId: number; taskId: number; onClose: () => void }

export function TaskDetailDrawer({ projectId, taskId, onClose }: TaskDetailDrawerProps) {
  const taskQuery = useTask(projectId, taskId)

  return <Drawer onClose={onClose} title="Detalle de tarea">
    {taskQuery.isPending ? <div aria-label="Cargando tarea" className="space-y-4 p-6" role="status"><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : taskQuery.isError ? <div className="grid place-items-center gap-3 p-10 text-center"><AlertTriangle className="text-red-600" size={30} /><p className="text-sm text-zinc-600">{taskQuery.error.message}</p><Button onClick={() => void taskQuery.refetch()} size="sm" variant="secondary"><RefreshCw size={16} />Reintentar</Button></div> : <>
      <TaskForm onClose={onClose} projectId={projectId} task={taskQuery.data} />
      <ChecklistEditor items={taskQuery.data.checklist ?? []} projectId={projectId} taskId={taskId} />
    </>}
  </Drawer>
}
