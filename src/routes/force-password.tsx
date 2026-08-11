import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ForcePasswordScreen } from '@/app/screens/auth/ForcePasswordScreen'
import { Screen } from '@/data/types'

export const Route = createFileRoute('/force-password')({
  component: ForcePasswordRoute,
})

function ForcePasswordRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    if (screen === 'admin-dashboard') {
      navigate({ to: '/admin/dashboard' })
    } else if (screen === 'student-dashboard') {
      navigate({ to: '/student/dashboard' })
    } else if (screen === 'login') {
      navigate({ to: '/login' })
    } else {
      navigate({ to: '/student/dashboard' })
    }
  }

  return <ForcePasswordScreen onNavigate={handleNavigate} />
}
