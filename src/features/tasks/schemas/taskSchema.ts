import { z } from 'zod'

const optionalId = z.union([z.literal(''), z.string().regex(/^\d+$/)])

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio.').max(255),
  description: z.string().max(10_000),
  type: z.enum(['story', 'task', 'bug', 'improvement']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['backlog', 'todo', 'in_progress', 'blocked', 'done']),
  story_points: z.enum(['', '1', '2', '3', '5', '8', '13']),
  sprint_id: optionalId,
  tag_ids: z.array(z.number().int().positive()).max(50),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
