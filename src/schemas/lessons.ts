// src/schemas/lessons.ts

import { z } from 'zod'

export const lessonSchema = z.object({
  id: z.string().uuid(),
  section_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  pdf_url: z.string().url().nullable(),
  video_id: z.string().nullable(),
  allow_download: z.boolean(),
  page_count: z.number().int().nonnegative().nullable(),
  lesson_order: z.number().int().nonnegative(),
  status: z.enum(['draft', 'published']),
  published_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newLessonSchema = z.object({
  section_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  pdf_url: z.string().url().nullable().optional(),
  video_id: z.string().nullable().optional(),
  allow_download: z.boolean().optional(),
  page_count: z.number().int().nonnegative().optional(),
  lesson_order: z.number().int().nonnegative().optional(),
  status: z.enum(['draft', 'published']).optional(),
  published_at: z.string().optional(),
})

export const updateLessonSchema = newLessonSchema.partial()

export type Lesson = z.infer<typeof lessonSchema>
export type NewLesson = z.infer<typeof newLessonSchema>
export type UpdateLesson = z.infer<typeof updateLessonSchema>