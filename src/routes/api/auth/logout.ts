import { createFileRoute } from '@tanstack/react-router'
import { authService } from '@/services/auth'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get('authorization') ?? ''
          const token = authHeader.replace('Bearer ', '').trim()

          if (!token) {
            return Response.json({ error: 'Authorization token is required' }, { status: 401 })
          }

          await authService.logout(token)
          return Response.json({ message: 'Logged out successfully' })
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'SESSION_NOT_FOUND') {
              return Response.json({ error: 'Session not found' }, { status: 404 })
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
