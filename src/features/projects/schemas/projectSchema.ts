import { z } from 'zod'

export const projectSchema = z
  .object({
    name: z.string().trim().min(1, 'Ingresa un nombre.').max(255, 'Máximo 255 caracteres.'),
    description: z.string().max(10_000, 'Máximo 10,000 caracteres.'),
    status: z.enum(['active', 'paused', 'completed', 'archived']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Selecciona un color válido.'),
    icon: z.string().trim().max(50, 'Máximo 50 caracteres.'),
    start_date: z.string(),
    target_date: z.string(),
  })
  .superRefine((values, context) => {
    if (values.start_date && values.target_date && values.target_date < values.start_date) {
      context.addIssue({
        code: 'custom',
        message: 'La fecha objetivo no puede ser anterior a la fecha de inicio.',
        path: ['target_date'],
      })
    }
  })

export type ProjectFormValues = z.infer<typeof projectSchema>
