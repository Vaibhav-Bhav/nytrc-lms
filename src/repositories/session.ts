// src/repositories/session.ts
//
// TEMPORARY: in-memory store. Swap the internals of each function for
// Supabase queries once credentials land — keep these exact function
// signatures so services/auth.ts never needs to change.

import type { Session, NewSession } from '@/schemas/sessions'

let sessions: Session[] = []

function generateId(): string {
  return crypto.randomUUID()
}

export const sessionRepository = {
  async findAll(): Promise<Session[]> {
    return sessions
  },

  async findById(id: string): Promise<Session | null> {
    return sessions.find((s) => s.id === id) ?? null
  },

  async findByToken(token: string): Promise<Session | null> {
    return sessions.find((s) => s.token === token && s.is_active) ?? null
  },

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return sessions.find((s) => s.refresh_token === refreshToken && s.is_active) ?? null
  },

  async findActiveByUserId(userId: string): Promise<Session[]> {
    return sessions.filter((s) => s.user_id === userId && s.is_active)
  },

  async create(data: NewSession): Promise<Session> {
    const now = new Date().toISOString()
    const session: Session = {
      id: generateId(),
      user_id: data.user_id,
      token: data.token,
      refresh_token: data.refresh_token ?? null,
      device_identifier: data.device_identifier ?? null,
      browser: data.browser ?? null,
      os: data.os ?? null,
      ip_address: data.ip_address ?? null,
      location_metadata: data.location_metadata ?? null,
      is_active: true,
      expires_at: data.expires_at,
      created_at: now,
    }
    sessions.push(session)
    return session
  },

  async deactivate(id: string): Promise<boolean> {
    const idx = sessions.findIndex((s) => s.id === id)
    if (idx === -1) return false
    sessions[idx] = { ...sessions[idx], is_active: false }
    return true
  },

  async deactivateAllForUser(userId: string): Promise<void> {
    sessions = sessions.map((s) =>
      s.user_id === userId ? { ...s, is_active: false } : s,
    )
  },

  async remove(id: string): Promise<boolean> {
    const before = sessions.length
    sessions = sessions.filter((s) => s.id !== id)
    return sessions.length < before
  },
}
