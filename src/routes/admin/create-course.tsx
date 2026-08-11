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
  component: AdminCreateCourseRoute,
})
