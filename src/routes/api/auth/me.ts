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

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const token = getSessionTokenFromRequest(request)

          if (!token) {
            return Response.json({ error: 'Unauthorized: Missing session token' }, { status: 401 })
          }

          const user = await authService.getCurrentUser(token)
          return Response.json({ user })
        } catch (err) {
          if (err instanceof Error && err.message === 'UNAUTHORIZED') {
            return Response.json({ error: 'Unauthorized: Session is invalid or expired' }, { status: 401 })
          }
          console.error('[me] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
