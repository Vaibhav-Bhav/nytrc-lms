import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminDashboard } from '@/app/screens/admin/AdminDashboard'

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })

      // Not authenticated — redirect to login
      if (res.status === 401) {
        throw redirect({ to: '/login' })
      }

      if (!res.ok) {
        // Unexpected server error — fail safe to login
        throw redirect({ to: '/login' })
      }

      const data = await res.json()
      const user = data?.user

      // Wrong role — redirect to login
      if (!user || user.role !== 'admin') {
        throw redirect({ to: '/login' })
      }

      // Return user so it is available in route context
      return { user }
    } catch (err) {
      // Re-throw TanStack redirects as-is
      if (err instanceof Response || (err as any)?.isRedirect) throw err
      // Network error — redirect to login
      throw redirect({ to: '/login' })
    }
  },
  component: AdminDashboard,
})
