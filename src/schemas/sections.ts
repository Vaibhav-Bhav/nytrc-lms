import { z } from 'zod'

export const sectionSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string().min(1),
  order_number: z.number().int().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newSectionSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  order_number: z.number().int().nonnegative().optional(),
})

export const updateSectionSchema = newSectionSchema.partial()

export type Section = z.infer<typeof sectionSchema>
export type NewSection = z.infer<typeof newSectionSchema>
export type UpdateSection = z.infer<typeof updateSectionSchema>