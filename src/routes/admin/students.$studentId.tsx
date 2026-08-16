import { authQueryKey, fetchCurrentUser } from '@/hooks/useAuth'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminStudentDetail } from '@/app/screens/admin/AdminStudentDetail'

export const Route = createFileRoute('/admin/students/$studentId')({
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
  component: AdminStudentDetailRoute,
})

function AdminStudentDetailRoute() {
  const { studentId } = Route.useParams()
  return <AdminStudentDetail studentId={studentId} />
}
