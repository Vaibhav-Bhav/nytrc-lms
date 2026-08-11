// src/routes/api/admin/email-log.ts
// GET /api/admin/email-log — returns all system email logs with user details
// POST /api/admin/email-log/resend — triggers re-dispatch for a logged email
// Secured: admin only

import { createFileRoute } from '@tanstack/react-router'
import { emailLogRepository } from '@/repositories/emailLog'
import { userRepository } from '@/repositories/user'
import { emailDispatcher } from '@/services/email/dispatcher'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/email-log')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await requireAdmin(request)

        try {
          const logs = await emailLogRepository.findAll()

          const enriched = await Promise.all(
            logs.map(async (log) => {
              const user = log.user_id ? await userRepository.findById(log.user_id).catch(() => null) : null

              return {
                id: log.id,
                user_id: log.user_id,
                recipient_name: user?.name ?? 'System Recipient',
                to_address: log.to_address,
                template: log.template,
                subject: log.subject,
                status: log.status,
                provider_message_id: log.provider_message_id,
                error: log.error,
                metadata: log.metadata,
                sent_at: log.sent_at,
                created_at: log.created_at,
              }
            }),
          )

          return Response.json(enriched)
        } catch (err) {
          console.error('[admin/email-log GET] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
      POST: async ({ request }) => {
        await requireAdmin(request)

        try {
          const body = await request.json()
          const { log_id } = body
          if (!log_id) {
            return Response.json({ error: 'log_id is required' }, { status: 400 })
          }

          const result = await emailDispatcher.resendLogById(log_id)
          if (!result.success) {
            return Response.json({ error: result.error || 'Failed to resend email' }, { status: 500 })
          }

          return Response.json({ success: true })
        } catch (err) {
          console.error('[admin/email-log POST] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
