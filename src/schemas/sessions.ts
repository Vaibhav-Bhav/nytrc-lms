// src/schemas/sessions.ts

import { z } from 'zod'

// -----------------------------------------------------------------------
// Session entity — matches the future `sessions` table in the database
// -----------------------------------------------------------------------

export const sessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  token: z.string(),
  refresh_token: z.string().nullable(),
  device_identifier: z.string().nullable(),
  browser: z.string().nullable(),
  os: z.string().nullable(),
  ip_address: z.string().nullable(),
  location_metadata: z.any().nullable(),
  is_active: z.boolean(),
  expires_at: z.string(),
  created_at: z.string(),
})

export const newSessionSchema = z.object({
  user_id: z.string().uuid(),
  token: z.string().min(1),
  refresh_token: z.string().optional(),
  device_identifier: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  ip_address: z.string().optional(),
  location_metadata: z.any().optional(),
  expires_at: z.string(),
})

// -----------------------------------------------------------------------
// TypeScript type exports
// -----------------------------------------------------------------------

export type Session = z.infer<typeof sessionSchema>
export type NewSession = z.infer<typeof newSessionSchema>
