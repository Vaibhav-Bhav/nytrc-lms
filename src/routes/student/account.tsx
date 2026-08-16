import { fetchCurrentUser } from '@/hooks/useAuth';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { StudentAccount } from '@/app/screens/student/StudentAccount'
import { Screen } from '@/data/types'

function StudentAccountRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    const map: Partial<Record<Screen, string>> = {
      'login': '/login',
      'student-dashboard': '/student/dashboard',
      'auth-device-session': '/device-limit',
    }
    const route = map[screen]
    if (route) navigate({ to: route as '/' })
    else console.warn(`[StudentAccount] "${screen}" not yet mapped.`)
  }

  return <StudentAccount onNavigate={handleNavigate} />
}

export const Route = createFileRoute('/student/account')({
  beforeLoad: async ({ context }) => {
  if (typeof window === 'undefined') return; // Skip auth redirect on server

    try {
      const user = await context.queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: fetchCurrentUser, 
      });
      if (!user || user.role !== 'student') throw redirect({ to: '/login' });
      if (user.force_password_change) throw redirect({ to: '/force-password' });
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to fetch current user') {
        throw redirect({ to: '/login' });
      }
      throw redirect({ to: '/login' });
    }
  },
  component: StudentAccountRoute,
})
