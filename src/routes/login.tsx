import { createFileRoute } from '@tanstack/react-router'
import { LoginScreen } from '@/app/screens/auth/LoginScreen'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  return <LoginScreen />
}