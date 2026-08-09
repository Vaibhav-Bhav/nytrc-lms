import { createFileRoute } from '@tanstack/react-router'
import { authService } from '@/services/auth'

function getSessionTokenFromRequest(request: Request): string | null {
  // 1. Try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim()
  }

  // 2. Try Cookie header
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, pair) => {
      const [key, val] = pair.split('=').map((c) => c.trim())
      if (key && val) acc[key] = val
      return acc
    }, {} as Record<string, string>)
    return cookies['session_token'] ?? null
  }

  return null
}

export const Route = createFileRoute('/api/auth/sessions')({
  server: {
    handlers: {
      // GET /api/auth/sessions - list active sessions
      GET: async ({ request }: { request: Request }) => {
        try {
          const token = getSessionTokenFromRequest(request)
          if (!token) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const activeSessions = await authService.listSessions(token)
          return Response.json(activeSessions)
        } catch (err) {
          if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }
          console.error('[sessions] GET Error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },

      // DELETE /api/auth/sessions - revoke all except current session
      DELETE: async ({ request }: { request: Request }) => {
        try {
          const token = getSessionTokenFromRequest(request)
          if (!token) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          await authService.revokeOtherSessions(token)
          return Response.json({ message: 'Other sessions revoked successfully' })
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'UNAUTHORIZED') {
              return Response.json({ error: 'Unauthorized' }, { status: 401 })
            }
          }
          console.error('[sessions] DELETE other Error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
