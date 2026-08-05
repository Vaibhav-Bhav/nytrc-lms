// src/schemas/users.ts

import { z } from 'zod'

// -----------------------------------------------------------------------
// User entity — matches the future `users` table in the database
// -----------------------------------------------------------------------

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'student']),
  password_hash: z.string(),
  is_active: z.boolean(),
  force_password_change: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'student']).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
  force_password_change: z.boolean().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  device_identifier: z.string().optional(),
  location_metadata: z.any().optional(),
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
})

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// -----------------------------------------------------------------------
// TypeScript type exports
// -----------------------------------------------------------------------

export type User = z.infer<typeof userSchema>
export type NewUser = z.infer<typeof newUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>
