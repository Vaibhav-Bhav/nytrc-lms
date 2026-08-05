// src/schemas/courseAccess.ts

import { z } from 'zod'

export const courseAccessSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  payment_id: z.string().uuid().nullable(),
  access_status: z.enum(['active', 'revoked', 'expired']),
  granted_at: z.string(),
  revoked_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newCourseAccessSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  payment_id: z.string().uuid().optional().nullable(),
  access_status: z.enum(['active', 'revoked', 'expired']).default('active'),
})

export const updateCourseAccessSchema = z.object({
  access_status: z.enum(['active', 'revoked', 'expired']).optional(),
  revoked_at: z.string().optional().nullable(),
})

export type CourseAccess = z.infer<typeof courseAccessSchema>
export type NewCourseAccess = z.infer<typeof newCourseAccessSchema>
export type UpdateCourseAccess = z.infer<typeof updateCourseAccessSchema>
