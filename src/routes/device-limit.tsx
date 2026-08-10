import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DeviceLimitExceededScreen } from '@/app/screens/auth/DeviceLimitExceededScreen'
import { Screen } from '@/data/types'

export const Route = createFileRoute('/device-limit')({
  component: DeviceLimitRoute,
})

function DeviceLimitRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    const routeMap: Partial<Record<Screen, string>> = {
      'login': '/login',
      'student-dashboard': '/student/dashboard',
    }
    const route = routeMap[screen]
    if (route) {
      navigate({ to: route as '/' })
    } else {
      console.warn(`[DeviceLimit] Navigation to "${screen}" not yet wired to a real route.`)
    }
  }

  return <DeviceLimitExceededScreen onNavigate={handleNavigate} />
}
