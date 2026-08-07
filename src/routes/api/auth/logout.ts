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

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const token = getSessionTokenFromRequest(request)

          if (!token) {
            return Response.json({ error: 'Authorization token is required' }, { status: 401 })
          }

          await authService.logout(token)

          // Setup cookie clear header configuration
          const isProduction = process.env.APP_ENV !== 'development'
          const cookieOptions = [
            'session_token=',
            'HttpOnly',
            'Path=/',
            'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            'SameSite=Lax',
            ...(isProduction ? ['Secure'] : [])
          ].join('; ')

          console.log(`[logout] Successful logout. Clearing session cookie.`)

          return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': cookieOptions
            }
          })
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'SESSION_NOT_FOUND') {
              return Response.json({ error: 'Session not found' }, { status: 404 })
            }
            if (err.message === 'Not implemented') {
              return Response.json({ error: 'Not implemented' }, { status: 501 })
            }
          }
          console.error('[logout] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
