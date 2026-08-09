// src/repositories/session.ts
//
// Supabase-backed repository for the `sessions` table.
//
// Public method signatures are identical to the in-memory version so that
// services/auth.ts requires zero changes.
//
// Expected Supabase table DDL (run once in Supabase SQL editor):
//
//   create table public.sessions (
//     id                  uuid primary key default gen_random_uuid(),
//     user_id             uuid not null references public.users(id) on delete cascade,
//     token               text not null unique,
//     refresh_token       text unique,
//     device_identifier   text,
//     browser             text,
//     os                  text,
//     ip_address          text,
//     location_metadata   jsonb,
//     is_active           boolean not null default true,
//     expires_at          timestamptz not null,
//     created_at          timestamptz not null default now()
//   );
//
//   create index sessions_user_id_is_active_idx on public.sessions (user_id, is_active);
//   create index sessions_token_idx on public.sessions (token) where is_active = true;

import { supabase } from '@/lib/supabase'
import type { Session, NewSession } from '@/schemas/sessions'

// -----------------------------------------------------------------------
// Internal helper — maps a raw Supabase row to the Session type.
// -----------------------------------------------------------------------
function toSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    token: row.token as string,
    refresh_token: (row.refresh_token as string | null) ?? null,
    device_identifier: (row.device_identifier as string | null) ?? null,
    browser: (row.browser as string | null) ?? null,
    os: (row.os as string | null) ?? null,
    ip_address: (row.ip_address as string | null) ?? null,
    location_metadata: row.location_metadata ?? null,
    is_active: row.is_active as boolean,
    expires_at: row.expires_at as string,
    created_at: row.created_at as string,
  }
}

export const sessionRepository = {
  async findAll(): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`sessionRepository.findAll: ${error.message}`)
    return (data ?? []).map(toSession)
  },

  async findById(id: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`sessionRepository.findById: ${error.message}`)
    return data ? toSession(data) : null
  },

  // Only returns active sessions — mirrors the original in-memory filter.
  async findByToken(token: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw new Error(`sessionRepository.findByToken: ${error.message}`)
    return data ? toSession(data) : null
  },

  // Only returns active sessions — mirrors the original in-memory filter.
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw new Error(`sessionRepository.findByRefreshToken: ${error.message}`)
    return data ? toSession(data) : null
  },

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`sessionRepository.findActiveByUserId: ${error.message}`)
    return (data ?? []).map(toSession)
  },

  async create(data: NewSession): Promise<Session> {
    const { data: row, error } = await supabase
      .from('sessions')
      .insert({
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
      })
      .select()
      .single()

    if (error) throw new Error(`sessionRepository.create: ${error.message}`)
    return toSession(row)
  },

  async deactivate(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('sessions')
      .update({ is_active: false }, { count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`sessionRepository.deactivate: ${error.message}`)
    return (count ?? 0) > 0
  },

  async deactivateAllForUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw new Error(`sessionRepository.deactivateAllForUser: ${error.message}`)
  },

  async deactivateAllExcept(userId: string, keepSessionId: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .neq('id', keepSessionId)
      .eq('is_active', true)

    if (error) throw new Error(`sessionRepository.deactivateAllExcept: ${error.message}`)
  },

  // Counts only non-expired active sessions — mirrors the original filter.
  async countActiveByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())

    if (error) throw new Error(`sessionRepository.countActiveByUserId: ${error.message}`)
    return count ?? 0
  },

  // Marks all sessions whose expiry is in the past as inactive.
  async deactivateExpiredSessions(): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString())

    if (error) throw new Error(`sessionRepository.deactivateExpiredSessions: ${error.message}`)
  },

  async remove(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('sessions')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) throw new Error(`sessionRepository.remove: ${error.message}`)
    return (count ?? 0) > 0
  },
}
