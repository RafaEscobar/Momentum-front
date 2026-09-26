import { Modal } from '@/components/common/Modal'
import { TaskForm } from '@/features/tasks/components/TaskForm'

interface TaskCreateModalProps { projectId: number; onClose: () => void }

export function TaskCreateModal({ projectId, onClose }: TaskCreateModalProps) {
  return <Modal description="Añade una tarea al backlog o asígnala a un Sprint." onClose={onClose} title="Crear tarea"><TaskForm onClose={onClose} projectId={projectId} /></Modal>
}
