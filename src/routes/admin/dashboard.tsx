import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AdminDashboard } from '@/app/screens/admin/AdminDashboard'
import { Screen } from '@/data/types'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardRoute,
})

function AdminDashboardRoute() {
  const navigate = useNavigate()

  // Temporary adapter: maps the prototype Screen type to real routes.
  // This will be progressively replaced as each admin screen is migrated.
  function handleNavigate(screen: Screen) {
    const routeMap: Partial<Record<Screen, string>> = {
      'login': '/login',
      'admin-dashboard': '/admin/dashboard',
    }
    const route = routeMap[screen]
    if (route) {
      navigate({ to: route as '/' })
    } else {
      console.warn(`[AdminDashboard] Navigation to "${screen}" not yet wired to a real route.`)
    }
  }

  return <AdminDashboard onNavigate={handleNavigate} />
}
