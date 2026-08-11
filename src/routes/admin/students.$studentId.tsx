import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminStudentDetail } from '@/app/screens/admin/AdminStudentDetail'

export const Route = createFileRoute('/admin/students/$studentId')({
  beforeLoad: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (!res.ok) throw redirect({ to: '/login' })
      const data = await res.json()
      if (!data?.user || data.user.role !== 'admin') throw redirect({ to: '/login' })
      return { user: data.user }
    } catch (err) {
      if (err instanceof Response || (err as any)?.isRedirect) throw err
      throw redirect({ to: '/login' })
    }
  },
  component: AdminStudentDetailRoute,
})

function AdminStudentDetailRoute() {
  const { studentId } = Route.useParams()
  return <AdminStudentDetail studentId={studentId} />
}
