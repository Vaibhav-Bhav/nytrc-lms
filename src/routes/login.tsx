import { createFileRoute } from '@tanstack/react-router'
import { LoginScreen } from '@/app/screens/auth/LoginScreen'

type LoginSearch = {
  email?: string
}

export const Route = createFileRoute('/login')({
  component: LoginRoute,
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      email: search.email as string | undefined,
    }
  }
})

function LoginRoute() {
  const { email } = Route.useSearch()
  return <LoginScreen initialEmail={email} />
}