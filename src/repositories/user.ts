// src/repositories/user.ts
//
// TEMPORARY: in-memory store. Swap the internals of each function for
// Supabase queries once credentials land — keep these exact function
// signatures so services/auth.ts never needs to change.

import { hashPassword } from '@/lib/password'
import type { User, NewUser, UpdateUser } from '@/schemas/users'

let users: User[] = []

function generateId(): string {
  return crypto.randomUUID()
}

export const userRepository = {
  async findAll(): Promise<User[]> {
    return users
  },

  async findById(id: string): Promise<User | null> {
    return users.find((u) => u.id === id) ?? null
  },

  async findByEmail(email: string): Promise<User | null> {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  },

  async create(data: NewUser): Promise<User> {
    const now = new Date().toISOString()
    const password_hash = await hashPassword(data.password)
    const user: User = {
      id: generateId(),
      email: data.email,
      name: data.name,
      role: data.role ?? 'student',
      password_hash,
      is_active: true,
      force_password_change: false,
      created_at: now,
      updated_at: now,
    }
    users.push(user)
    return user
  },

  async update(id: string, data: UpdateUser): Promise<User | null> {
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) return null

    users[idx] = {
      ...users[idx],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return users[idx]
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<User | null> {
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) return null

    users[idx] = {
      ...users[idx],
      password_hash: passwordHash,
      force_password_change: false,
      updated_at: new Date().toISOString(),
    }
    return users[idx]
  },

  async remove(id: string): Promise<boolean> {
    const before = users.length
    users = users.filter((u) => u.id !== id)
    return users.length < before
  },
}
