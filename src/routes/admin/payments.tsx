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
  component: AdminPaymentsRoute,
})
