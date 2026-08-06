import { createFileRoute } from '@tanstack/react-router'
import { authService } from '@/services/auth'
import { requestPasswordResetSchema } from '@/schemas/users'

export const Route = createFileRoute('/api/auth/forgot-password')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          const parsed = requestPasswordResetSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          await authService.requestPasswordReset(parsed.data.email)

          // Return generic success message to prevent user enumeration
          return Response.json({
            message: 'If the email exists, a password reset link has been generated.'
          })
        } catch (err) {
          console.error('[forgot-password] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
