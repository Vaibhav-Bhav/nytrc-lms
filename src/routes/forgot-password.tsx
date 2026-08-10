import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ForgotPasswordScreen } from '@/app/screens/auth/ForgotPasswordScreen'
import { Screen } from '@/data/types'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordRoute,
})

function ForgotPasswordRoute() {
  const navigate = useNavigate()

  function handleNavigate(screen: Screen) {
    if (screen === 'login') {
      navigate({ to: '/login' })
    } else {
      console.warn(`[ForgotPassword] Navigation to "${screen}" not yet wired.`)
    }
  }

  return <ForgotPasswordScreen onNavigate={handleNavigate} />
}
