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

export const Route = createFileRoute('/api/auth/sessions/$id')({
  server: {
    handlers: {
      DELETE: async ({ request, params }: { request: Request; params: { id: string } }) => {
        try {
          const token = getSessionTokenFromRequest(request)
          if (!token) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const { id } = params
          await authService.revokeSession(token, id)

          // If the revoked session is the current session, we should clear the cookie too.
          // However, revoking current session is usually done via logout, but we support it.
          return Response.json({ message: 'Session revoked successfully' })
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'UNAUTHORIZED') {
              return Response.json({ error: 'Unauthorized' }, { status: 401 })
            }
            if (err.message === 'SESSION_NOT_FOUND') {
              return Response.json({ error: 'Session not found' }, { status: 404 })
            }
          }
          console.error(`[sessions] DELETE specific session ${params.id} Error:`, err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
