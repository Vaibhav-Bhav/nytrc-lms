import { createFileRoute } from '@tanstack/react-router'
import { paymentService } from '@/services/payment'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'

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

          // Webhook signature validation
          const isValid = verifyRazorpayWebhookSignature(rawBody, signature)
          if (!isValid) {
            return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 })
          }

          let eventPayload
          try {
            eventPayload = JSON.parse(rawBody)
          } catch {
            return Response.json({ error: 'Malformed webhook payload' }, { status: 400 })
          }

          const event = eventPayload.event
          if (event === 'payment.captured') {
            await paymentService.handlePaymentCaptured(eventPayload)
          } else if (event === 'payment.failed') {
            await paymentService.handlePaymentFailed(eventPayload)
          } else if (event === 'refund.processed') {
            await paymentService.handleRefundProcessed(eventPayload)
          } else {
            return Response.json({ error: 'Unsupported webhook event' }, { status: 400 })
          }

          // Razorpay requires a fast 200 ACK response
          return new Response(null, { status: 200 })
        } catch (err) {
          if (err instanceof Error) {
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
