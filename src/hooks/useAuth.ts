import { useQuery } from '@tanstack/react-query'

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'student'
  name?: string
}

async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me', { credentials: 'include' })
  if (res.status === 401) return null
  if (!res.ok) throw new Error('Failed to fetch current user')
  const data = await res.json()
  return data.user as AuthUser
}

export const authQueryKey = ['auth', 'me'] as const

export function useAuth() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })
}
