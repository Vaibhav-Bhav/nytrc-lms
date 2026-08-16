import { authQueryKey, fetchCurrentUser } from '@/hooks/useAuth'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { AdminEmailLog } from '@/app/screens/admin/AdminEmailLog'
import { Screen } from '@/data/types'

function AdminEmailLogRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    const map: Partial<Record<Screen, string>> = {
      'login': '/login',
      'admin-dashboard': '/admin/dashboard',
    }
    const route = map[screen]
    if (route) navigate({ to: route as '/' })
    else console.warn(`[AdminEmailLog] "${screen}" not yet mapped.`)
  }

  return <AdminEmailLog onNavigate={handleNavigate} />
}

export const Route = createFileRoute('/admin/email-log')({
  beforeLoad: async ({ context }) => {
  if (typeof window === 'undefined') return; // Skip auth redirect on server

    try {
      const user = await context.queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: fetchCurrentUser, 
      });
      if (!user || user.role !== 'admin') throw redirect({ to: '/login' });
      if (user.force_password_change) throw redirect({ to: '/force-password' });
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to fetch current user') {
        throw redirect({ to: '/login' });
      }
      throw redirect({ to: '/login' });
    }
  },
  component: AdminEmailLogRoute,
})
