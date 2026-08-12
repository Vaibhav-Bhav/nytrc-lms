import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { ResetPasswordScreen } from '@/app/screens/auth/ResetPasswordScreen'
import { z } from 'zod'

const resetPasswordSearchSchema = z.object({
  token: z.string().optional().default(''),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search) => resetPasswordSearchSchema.parse(search),
  component: ResetPasswordRoute,
})

function ResetPasswordRoute() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/reset-password' })
  const token = search.token || ''

  function handleNavigateLogin() {
    navigate({ to: '/login' })
  }

  return <ResetPasswordScreen token={token} onNavigateLogin={handleNavigateLogin} />
}
