import { authQueryKey, fetchCurrentUser } from '@/hooks/useAuth'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { AdminPaymentHistory } from '@/app/screens/admin/AdminPaymentHistory'
import { Screen } from '@/data/types'

function AdminPaymentsRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    const map: Partial<Record<Screen, string>> = {
      'login': '/login',
      'admin-dashboard': '/admin/dashboard',
      'admin-refund': '/admin/payments',
    }
    const route = map[screen]
    if (route) navigate({ to: route as '/' })
    else console.warn(`[AdminPayments] "${screen}" not yet mapped.`)
  }

  return <AdminPaymentHistory onNavigate={handleNavigate} />
}

export const Route = createFileRoute('/admin/payments')({
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
  component: AdminPaymentsRoute,
})
