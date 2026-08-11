import { createFileRoute } from '@tanstack/react-router'
import { userRepository } from '@/repositories/user'
import { sessionRepository } from '@/repositories/session'
import { verifyPassword } from '@/lib/password'

export const Route = createFileRoute('/api/auth/pending-sessions')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { email, password, action, sessionId } = body

          if (!email || !password) {
            return Response.json({ error: 'Missing credentials' }, { status: 400 })
          }

          const user = await userRepository.findByEmail(email)
          if (!user || !user.is_active) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 })
          }

          const isValid = await verifyPassword(password, user.password_hash)
          if (!isValid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 })
          }

          if (action === 'revoke' && sessionId) {
            const sessionToRevoke = await sessionRepository.findById(sessionId)
            if (sessionToRevoke && sessionToRevoke.user_id === user.id) {
              await sessionRepository.deactivate(sessionId)
            }
          }

          const activeSessions = await sessionRepository.findActiveByUserId(user.id)
          const formattedSessions = activeSessions.map(s => ({
            id: s.id,
            device_name: s.device_identifier || 'Unknown Device',
            browser: s.browser || 'Unknown',
            os: s.os || 'Unknown',
            last_active: s.created_at,
            type: s.os?.toLowerCase().includes('android') || s.os?.toLowerCase().includes('ios') ? 'mobile' : 'desktop'
          }))

          return Response.json({ devices: formattedSessions })
        } catch (err) {
          console.error('[pending-sessions] Error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      }
    }
  }
})
