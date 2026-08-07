import { createFileRoute } from '@tanstack/react-router'
import { paymentService } from '@/services/payment'

export const Route = createFileRoute('/api/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Razorpay sends the raw body and a signature header for HMAC verification.
          // We must read the raw body as text — not JSON — to preserve the exact bytes
          // used when computing the signature on Razorpay's side.
          const rawBody = await request.text()
          const signature = request.headers.get('x-razorpay-signature') ?? ''

          if (!signature) {
            return Response.json({ error: 'Missing webhook signature header' }, { status: 400 })
          }

          // Webhook endpoint must NOT be protected by session middleware.
          // Razorpay does not send session cookies.
          // Verification is handled inside paymentService.handleWebhook via HMAC check.

          await paymentService.handleWebhook(rawBody, signature)

          // Razorpay requires a fast 200 ACK.
          // Must return immediately — do NOT wait for Sprint 3 side effects.
          return new Response(null, { status: 200 })
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'INVALID_WEBHOOK_SIGNATURE') {
              return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 })
            }
            if (err.message === 'INVALID_WEBHOOK_PAYLOAD') {
              return Response.json({ error: 'Malformed webhook payload' }, { status: 400 })
            }
            if (err.message.startsWith('Missing required environment variable')) {
              console.error('[webhook] Configuration error:', err.message)
              return Response.json({ error: 'Payment service is not configured' }, { status: 503 })
            }
          }
          console.error('[webhook] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
