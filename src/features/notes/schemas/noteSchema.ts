import { z } from 'zod'

export const noteSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio.').max(255, 'El título no puede exceder 255 caracteres.'),
  content: z.string().min(1, 'El contenido es obligatorio.').max(50_000, 'El contenido no puede exceder 50 000 caracteres.'),
})

export type NoteFormValues = z.infer<typeof noteSchema>
