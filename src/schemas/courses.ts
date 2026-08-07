// src/schemas/courses.ts

import { z } from 'zod'

export const courseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  thumbnail_url: z.string().url().nullable(),
  status: z.enum(['draft', 'published']),
  price: z.number().nonnegative().default(999),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  status: z.enum(['draft', 'published']).optional(),
  price: z.number().nonnegative().optional(),
  created_by: z.string().uuid(),
})

export const updateCourseSchema = newCourseSchema.partial()

export type Course = z.infer<typeof courseSchema>
export type NewCourse = z.infer<typeof newCourseSchema>
export type UpdateCourse = z.infer<typeof updateCourseSchema>