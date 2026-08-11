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
  component: AdminEmailLogRoute,
})
