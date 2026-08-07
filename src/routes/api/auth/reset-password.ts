import { createFileRoute } from '@tanstack/react-router'
import { authService } from '@/services/auth'
import { resetPasswordSchema } from '@/schemas/users'

export const Route = createFileRoute('/api/auth/reset-password')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const parsed = resetPasswordSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          await authService.resetPassword(parsed.data.token, parsed.data.new_password)

          return Response.json({
            message: 'Password has been reset successfully. Active sessions have been invalidated.'
          })
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'INVALID_TOKEN') {
              return Response.json({ error: 'Invalid or missing password reset token' }, { status: 400 })
            }
            if (err.message === 'EXPIRED_TOKEN') {
              return Response.json({ error: 'Password reset token has expired' }, { status: 400 })
            }
            if (err.message === 'WEAK_PASSWORD') {
              return Response.json({
                error: 'Weak password: Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number.'
              }, { status: 400 })
            }
          }
          console.error('[reset-password] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
