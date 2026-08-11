// src/routes/api/auth/change-password.ts
// POST /api/auth/change-password — allows authenticated users to change their password
// Clears force_password_change and reset_token_expires_at upon success.

import { createFileRoute } from '@tanstack/react-router'
import { authenticate } from '@/middleware/auth'
import { authService } from '@/services/auth'

export const Route = createFileRoute('/api/auth/change-password')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await authenticate(request)
          const body = await request.json().catch(() => ({}))

          const { current_password, new_password } = body

          if (!current_password || !new_password) {
            return Response.json(
              { error: 'Current password and new password are required.' },
              { status: 400 }
            )
          }

          await authService.changePassword(user.id, current_password, new_password)

          return Response.json({
            success: true,
            message: 'Password changed successfully. Your account is now fully active.',
          })
        } catch (err: any) {
          if (err instanceof Response) return err

          if (err instanceof Error) {
            if (err.message === 'INVALID_CURRENT_PASSWORD') {
              return Response.json(
                { error: 'Current password is incorrect.', code: 'INVALID_CURRENT_PASSWORD' },
                { status: 400 }
              )
            }
            if (err.message === 'PASSWORD_SAME_AS_CURRENT') {
              return Response.json(
                { error: 'New password cannot be the same as your current password.', code: 'PASSWORD_SAME_AS_CURRENT' },
                { status: 400 }
              )
            }
            if (err.message === 'PASSWORD_POLICY_FAILED') {
              return Response.json(
                {
                  error: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.',
                  code: 'PASSWORD_POLICY_FAILED',
                },
                { status: 400 }
              )
            }
            if (err.message === 'TEMPORARY_CREDENTIAL_EXPIRED') {
              return Response.json(
                {
                  error: 'Your 72-hour temporary credential has expired. Please contact support or request a password reset.',
                  code: 'TEMPORARY_CREDENTIAL_EXPIRED',
                },
                { status: 403 }
              )
            }
          }

          console.error('[change-password] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
