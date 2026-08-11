// src/routes/api/admin/payments.ts
// GET /api/admin/payments — returns all payment records joined with invoices and student info
// Secured: admin only

import { createFileRoute } from '@tanstack/react-router'
import { paymentRepository } from '@/repositories/payment'
import { invoiceRepository } from '@/repositories/invoice'
import { userRepository } from '@/repositories/user'
import { courseRepository } from '@/repositories/course'
import { requireAdmin } from '@/middleware/auth'

export const Route = createFileRoute('/api/admin/payments')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await requireAdmin(request)

        try {
          const payments = await paymentRepository.findAll()

          const enriched = await Promise.all(
            payments.map(async (payment) => {
              const [student, course, invoice] = await Promise.all([
                userRepository.findById(payment.student_id).catch(() => null),
                courseRepository.findById(payment.course_id).catch(() => null),
                payment.invoice_id
                  ? invoiceRepository.findById(payment.invoice_id).catch(() => null)
                  : Promise.resolve(null),
              ])

              return {
                id: payment.id,
                student_id: payment.student_id,
                course_id: payment.course_id,
                student_name: student?.name ?? 'Unknown Student',
                student_email: student?.email ?? '',
                course_title: course?.title ?? 'Unknown Course',
                razorpay_order_id: payment.razorpay_order_id,
                razorpay_payment_id: payment.razorpay_payment_id,
                invoice_id: payment.invoice_id,
                invoice_number: invoice?.invoice_number ?? null,
                invoice_download_url: invoice?.invoice_download_url ?? null,
                payment_status: payment.payment_status,
                amount_paid: payment.amount_paid,
                currency: payment.currency,
                gst_state: payment.gst_state,
                created_at: payment.created_at,
                updated_at: payment.updated_at,
              }
            }),
          )

          enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

          return Response.json(enriched)
        } catch (err) {
          console.error('[admin/payments GET] Unexpected error:', err)
          return Response.json({ error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})
