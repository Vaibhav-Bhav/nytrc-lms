// src/repositories/user.ts
//
// Supabase-backed repository for the `users` table.

import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/password'
import type { User, NewUser, UpdateUser } from '@/schemas/users'

function toUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    mobile: (row.mobile as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    role: row.role as 'admin' | 'student',
    password_hash: row.password_hash as string,
    is_active: row.is_active as boolean,
    force_password_change: row.force_password_change as boolean,
    reset_token: (row.reset_token as string | null) ?? null,
    reset_token_expires_at: (row.reset_token_expires_at as string | null) ?? null,
    last_login_at: (row.last_login_at as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const userRepository = {
  async findAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`userRepository.findAll: ${error.message}`)
    return (data ?? []).map(toUser)
  },

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`userRepository.findById: ${error.message}`)
    return data ? toUser(data) : null
  },

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle()

    if (error) throw new Error(`userRepository.findByEmail: ${error.message}`)
    return data ? toUser(data) : null
  },

  async findByResetToken(resetToken: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', resetToken)
      .maybeSingle()

    if (error) throw new Error(`userRepository.findByResetToken: ${error.message}`)
    return data ? toUser(data) : null
  },

  async create(data: NewUser): Promise<User> {
    const password_hash = await hashPassword(data.password)

    const { data: row, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        name: data.name,
        mobile: data.mobile ?? null,
        state: data.state ?? null,
        role: data.role ?? 'student',
        password_hash,
        is_active: true,
        force_password_change: false,
      })
      .select()
      .single()

    if (error) throw new Error(`userRepository.create: ${error.message}`)
    return toUser(row)
  },

  async update(id: string, data: UpdateUser): Promise<User | null> {
    const { data: row, error } = await supabase
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`userRepository.update: ${error.message}`)
    return row ? toUser(row) : null
  },

  async updateLastLogin(id: string): Promise<User | null> {
    const { data: row, error } = await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`userRepository.updateLastLogin: ${error.message}`)
    return row ? toUser(row) : null
  },

  async updatePasswordHash(id: string, passwordHash: string): Promise<User | null> {
    const { data: row, error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        force_password_change: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw new Error(`userRepository.updatePasswordHash: ${error.message}`)
    return row ? toUser(row) : null
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('users')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`userRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },
}
