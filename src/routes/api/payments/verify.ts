import { createFileRoute } from '@tanstack/react-router'
import { paymentService } from '@/services/payment'
import { verifyPaymentSchema } from '@/schemas/payments'

export const Route = createFileRoute('/api/payments/verify')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const parsed = verifyPaymentSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          // TODO (Sprint - Auth Middleware): Replace with requireStudent guard
          // once real session middleware is implemented.

          const result = await paymentService.verifyPayment(parsed.data)
          return Response.json(result)
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'INVALID_SIGNATURE') {
              return Response.json({ error: 'Payment signature verification failed' }, { status: 400 })
            }
            if (err.message === 'PAYMENT_NOT_FOUND') {
              return Response.json({ error: 'Payment record not found' }, { status: 404 })
            }
            if (err.message.startsWith('Missing required environment variable')) {
              console.error('[verify] Configuration error:', err.message)
              return Response.json({ error: 'Payment service is not configured' }, { status: 503 })
            }
          }
          console.error('[verify] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
