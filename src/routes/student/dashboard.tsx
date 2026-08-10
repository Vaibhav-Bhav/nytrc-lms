import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { StudentDashboard } from '@/app/screens/student/StudentDashboard'
import { Screen } from '@/data/types'

export const Route = createFileRoute('/student/dashboard')({
  component: StudentDashboardRoute,
})

function StudentDashboardRoute() {
  const navigate = useNavigate()

  // Temporary adapter: maps the prototype Screen type to real routes.
  // This will be progressively replaced as each student screen is migrated.
  function handleNavigate(screen: Screen) {
    const routeMap: Partial<Record<Screen, string>> = {
      'login': '/login',
      'student-dashboard': '/student/dashboard',
      'auth-device-limit-exceeded': '/device-limit',
    }
    const route = routeMap[screen]
    if (route) {
      navigate({ to: route as '/' })
    } else {
      console.warn(`[StudentDashboard] Navigation to "${screen}" not yet wired to a real route.`)
    }
  }

  return <StudentDashboard />
}
