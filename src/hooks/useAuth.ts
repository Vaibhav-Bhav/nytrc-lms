import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'student'
  name?: string
  force_password_change?: boolean
}

export const authQueryKey = ['auth', 'me'] as const

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  if (typeof window === 'undefined') {
    return new Promise(() => {}); // Freeze during SSR
  }
  const res = await fetch('/api/auth/me', { credentials: 'include' })
  if (res.status === 401) return null
  if (!res.ok) throw new Error('Failed to fetch current user')
  const data = await res.json()
  return data.user as AuthUser
}

export function useAuth() {
  const query = useQuery({
    queryKey: authQueryKey,
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  return query
}
