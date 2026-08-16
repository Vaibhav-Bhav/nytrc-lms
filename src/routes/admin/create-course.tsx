import { authQueryKey, fetchCurrentUser } from '@/hooks/useAuth'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { AdminCreateCourse } from '@/app/screens/admin/AdminCreateCourse'
import { Screen } from '@/data/types'

function AdminCreateCourseRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    const map: Partial<Record<Screen, string>> = {
      'login': '/login',
      'admin-dashboard': '/admin/dashboard',
      'admin-content': '/admin/content',
    }
    const route = map[screen]
    if (route) navigate({ to: route as '/' })
    else console.warn(`[AdminCreateCourse] "${screen}" not yet mapped.`)
  }

  return <AdminCreateCourse onNavigate={handleNavigate} />
}

export const Route = createFileRoute('/admin/create-course')({
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
  component: AdminCreateCourseRoute,
})
