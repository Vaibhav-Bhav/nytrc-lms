// src/schemas/emailLog.ts

import { z } from 'zod'

export const emailLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  template: z.string().min(1),
  to_address: z.string().email(),
  subject: z.string().nullable().optional(),
  status: z.enum(['pending', 'sent', 'failed', 'delivered']),
  provider_message_id: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  sent_at: z.string().nullable().optional(),
  created_at: z.string(),
})

export const newEmailLogSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  template: z.string().min(1, 'Template name is required'),
  to_address: z.string().email('Invalid to_address'),
  subject: z.string().optional(),
  status: z.enum(['pending', 'sent', 'failed', 'delivered']).optional(),
  provider_message_id: z.string().optional(),
  error: z.string().optional(),
  metadata: z.any().optional(),
  sent_at: z.string().optional(),
})

export const updateEmailLogSchema = newEmailLogSchema.partial()

export type EmailLog = z.infer<typeof emailLogSchema>
export type NewEmailLog = z.infer<typeof newEmailLogSchema>
export type UpdateEmailLog = z.infer<typeof updateEmailLogSchema>
