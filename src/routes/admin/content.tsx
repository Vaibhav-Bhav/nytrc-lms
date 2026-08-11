import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminContent } from '@/app/screens/admin/AdminContent'
import { Screen } from '@/data/types'
import { useNavigate } from '@tanstack/react-router'

function AdminContentRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    const map: Partial<Record<Screen, string>> = {
      'login': '/login',
      'admin-dashboard': '/admin/dashboard',
      'admin-students': '/admin/students',
    }
    const route = map[screen]
    if (route) navigate({ to: route as '/' })
    else console.warn(`[AdminContent] "${screen}" not yet mapped.`)
  }

  return <AdminContent onNavigate={handleNavigate} />
}

export const Route = createFileRoute('/admin/content')({
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
  component: AdminContentRoute,
})
