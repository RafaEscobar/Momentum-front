import { z } from 'zod'

export const sprintSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(255),
  goal: z.string().max(10_000),
  start_date: z.string(),
  end_date: z.string(),
}).refine((values) => !values.start_date || !values.end_date || values.end_date >= values.start_date, {
  message: 'La fecha final no puede ser anterior a la inicial.',
  path: ['end_date'],
})

export type SprintFormValues = z.infer<typeof sprintSchema>
