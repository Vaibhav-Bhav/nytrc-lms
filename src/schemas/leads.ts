// src/schemas/leads.ts

import { z } from 'zod'

export const leadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  course_id: z.string().uuid().nullable().optional(),
  razorpay_order_id: z.string().nullable().optional(),
  status: z.enum(['initiated', 'paid', 'failed']),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().optional(),
  state: z.string().optional(),
  course_id: z.string().uuid().optional(),
  razorpay_order_id: z.string().optional(),
  status: z.enum(['initiated', 'paid', 'failed']).optional(),
})

export const updateLeadSchema = newLeadSchema.partial()

export type Lead = z.infer<typeof leadSchema>
export type NewLead = z.infer<typeof newLeadSchema>
export type UpdateLead = z.infer<typeof updateLeadSchema>
