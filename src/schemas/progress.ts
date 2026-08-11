// src/schemas/progress.ts

import { z } from 'zod'

export const progressSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  video_progress_seconds: z.number().int().nonnegative().default(0),
  document_progress_page: z.number().int().nonnegative().default(0),
  completed: z.boolean().default(false),
  completed_at: z.string().nullable().default(null),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newProgressSchema = z.object({
  student_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  video_progress_seconds: z.number().int().nonnegative().optional(),
  document_progress_page: z.number().int().nonnegative().optional(),
  completed: z.boolean().optional(),
})

export const updateProgressSchema = z.object({
  video_progress_seconds: z.number().int().nonnegative().optional(),
  document_progress_page: z.number().int().nonnegative().optional(),
  completed: z.boolean().optional(),
})

export const progressInputSchema = z.object({
  lessonId: z.string().uuid('lessonId must be a valid UUID'),
  videoProgressSeconds: z.number().finite().nonnegative().optional(),
  documentProgressPage: z.number().int().nonnegative().optional(),
  completed: z.boolean().optional(),
})

export const patchLessonProgressSchema = z.object({
  position_seconds: z.number().finite().nonnegative().optional(),
  video_progress_seconds: z.number().finite().nonnegative().optional(),
  document_progress_page: z.number().int().nonnegative().optional(),
  completed: z.boolean().optional(),
})

export type Progress = z.infer<typeof progressSchema>
export type NewProgress = z.infer<typeof newProgressSchema>
export type UpdateProgress = z.infer<typeof updateProgressSchema>
export type ProgressInput = z.infer<typeof progressInputSchema>
export type PatchLessonProgressInput = z.infer<typeof patchLessonProgressSchema>
