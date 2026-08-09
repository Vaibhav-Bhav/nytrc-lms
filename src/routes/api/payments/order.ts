import { createFileRoute } from '@tanstack/react-router'
import { paymentService } from '@/services/payment'
import { createOrderSchema } from '@/schemas/payments'

export const Route = createFileRoute('/api/payments/order')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const parsed = createOrderSchema.safeParse(body)
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', issues: parsed.error.issues },
              { status: 400 },
            )
          }

          // TODO (Sprint - Auth Middleware): Replace with requireStudent guard
          // once real session middleware is implemented.

          const order = await paymentService.createOrder(parsed.data)
          return Response.json(order, { status: 201 })
        } catch (err) {
          if (err instanceof Error) {
            if (err.message === 'STUDENT_NOT_FOUND') {
              return Response.json({ error: 'Student account not found' }, { status: 404 })
            }
            if (err.message === 'COURSE_NOT_FOUND') {
              return Response.json({ error: 'Course not found' }, { status: 404 })
            }
            if (
              err.message === 'ALREADY_ENROLLED' ||
              err.message === 'COURSE_ALREADY_PURCHASED'
            ) {
              return Response.json({ error: 'Student is already enrolled in this course' }, { status: 409 })
            }
            if (err.message === 'COURSE_NOT_PUBLISHED') {
              return Response.json({ error: 'Course is not published' }, { status: 400 })
            }
            if (err.message === 'ORDER_CREATION_FAILED') {
              return Response.json({ error: 'Failed to create payment order' }, { status: 502 })
            }
            if (err.message.startsWith('Razorpay API error')) {
              console.error('[order] Razorpay API error:', err.message)
              return Response.json({ error: 'Payment gateway error. Please try again.' }, { status: 502 })
            }
            if (err.message.startsWith('Missing required environment variable')) {
              console.error('[order] Configuration error:', err.message)
              return Response.json({ error: 'Payment service is not configured' }, { status: 503 })
            }
          }
          console.error('[order] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
