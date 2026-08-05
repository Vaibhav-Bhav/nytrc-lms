import { createFileRoute } from '@tanstack/react-router'
import { authService } from '@/services/auth'

export const Route = createFileRoute('/api/auth/refresh')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const refreshToken = body?.refresh_token

          if (!refreshToken || typeof refreshToken !== 'string') {
            return Response.json({ error: 'refresh_token is required' }, { status: 400 })
          }

          const result = await authService.refresh(refreshToken)
          return Response.json(result)
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'INVALID_REFRESH_TOKEN') {
              return Response.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
            }
            if (err.message === 'Not implemented') {
              return Response.json({ error: 'Not implemented' }, { status: 501 })
            }
          }
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
