// src/services/payment.ts

import { paymentRepository } from '@/repositories/payment'
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
  type RazorpayWebhookEvent,
} from '@/lib/razorpay'
import type { CreateOrderInput, VerifyPaymentInput } from '@/schemas/payments'

// -----------------------------------------------------------------------
// GST rates by state code (IGST 18% flat for digital services)
// Update when state-level rates diverge from central rate.
// -----------------------------------------------------------------------
const GST_RATE = 0.18

/**
 * Returns the final payable amount in paise including GST.
 * @param baseAmountInRupees  Base course price in INR (rupees)
 * @param gstState            Indian state code (e.g. 'MH', 'DL')
 *                            Currently applies 18% GST for all states.
 */
function calculateAmountWithGST(baseAmountInRupees: number, _gstState?: string): number {
  const gstAmount = baseAmountInRupees * GST_RATE
  const totalInRupees = baseAmountInRupees + gstAmount
  // Razorpay requires amount in paise (1 INR = 100 paise), rounded to integer
  return Math.round(totalInRupees * 100)
}

// -----------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------

export const paymentService = {
  /**
   * Creates a Razorpay order and a pending payment record.
   *
   * Sprint scope: order creation only.
   * Does NOT charge the student — charging happens when the student
   * completes the Razorpay checkout modal on the frontend.
   */
  async createOrder(data: CreateOrderInput) {
    // TODO (Sprint 3 - Validation): Verify student_id exists in userRepository
    // TODO (Sprint 3 - Validation): Verify course_id belongs to a published course in courseRepository
    // TODO (Sprint 3 - Entitlement guard): Verify student does not already have active course_access

    // TODO (Sprint 3 - Dynamic Pricing): Fetch the actual course price from courseRepository
    // For now we hard-code a placeholder amount so the order pipeline can be tested end-to-end.
    const BASE_AMOUNT_RUPEES = 999

    const amountInPaise = calculateAmountWithGST(BASE_AMOUNT_RUPEES, data.gst_state)

    // Generate a short receipt ID. Razorpay limits receipt to 40 chars.
    const receipt = `rcpt_${Date.now()}`

    const razorpayOrder = await createRazorpayOrder(
      amountInPaise,
      'INR',
      receipt,
      {
        course_id: data.course_id,
        student_id: data.student_id,
      },
    )

    // Persist a pending payment record linked to the Razorpay order
    const payment = await paymentRepository.create({
      student_id: data.student_id,
      course_id: data.course_id,
      amount_paid: amountInPaise / 100, // store in rupees
      currency: 'INR',
      gst_state: data.gst_state,
    })

    await paymentRepository.update(payment.id, {
      razorpay_order_id: razorpayOrder.id,
      payment_status: 'pending',
    })

    return {
      payment_id: payment.id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env['RAZORPAY_KEY_ID'] ?? '',
    }
  },

  /**
   * Verifies the Razorpay payment signature and marks the payment as successful.
   *
   * Sprint scope: signature verification + status update only.
   * Entitlement creation and invoice generation are Sprint 3 responsibilities.
   */
  async verifyPayment(data: VerifyPaymentInput) {
    const isValid = verifyRazorpaySignature(
      data.razorpay_order_id,
      data.razorpay_payment_id,
      data.razorpay_signature,
    )

    if (!isValid) {
      throw new Error('INVALID_SIGNATURE')
    }

    const payment = await paymentRepository.findByRazorpayOrderId(data.razorpay_order_id)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    const updatedPayment = await paymentRepository.update(payment.id, {
      razorpay_payment_id: data.razorpay_payment_id,
      payment_status: 'success',
    })

    // TODO (Sprint 3 - Entitlement): Call courseAccessService.createEntitlement(
    //   payment.student_id, payment.course_id, payment.id
    // )

    // TODO (Sprint 3 - Invoicing): Call invoiceService.generateInvoice(payment.id)

    // TODO (Sprint 3 - Notifications): Send payment success email to student

    return updatedPayment
  },

  /**
   * Processes an incoming Razorpay webhook event.
   *
   * Sprint scope: signature verification + repository update for supported events.
   * Entitlement creation and invoice generation are Sprint 3 responsibilities.
   *
   * IMPORTANT: The route must return 200 immediately after calling this method.
   * Razorpay retries webhook delivery if it does not receive a 200 within 5 seconds.
   */
  async handleWebhook(rawBody: string, signature: string): Promise<void> {
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature)
    if (!isValid) {
      throw new Error('INVALID_WEBHOOK_SIGNATURE')
    }

    let event: RazorpayWebhookEvent
    try {
      event = JSON.parse(rawBody) as RazorpayWebhookEvent
    } catch {
      throw new Error('INVALID_WEBHOOK_PAYLOAD')
    }

    const paymentEntity = event.payload.payment?.entity

    switch (event.event) {
      case 'payment.authorized':
        // Razorpay has authorized the payment but not yet captured funds.
        // No action needed at this stage — wait for payment.captured.
        console.log(`[webhook] payment.authorized for order: ${paymentEntity?.order_id}`)
        break

      case 'payment.captured': {
        if (!paymentEntity?.order_id) break

        const payment = await paymentRepository.findByRazorpayOrderId(paymentEntity.order_id)
        if (!payment) {
          console.warn(`[webhook] payment.captured: no payment record for order ${paymentEntity.order_id}`)
          break
        }

        await paymentRepository.update(payment.id, {
          razorpay_payment_id: paymentEntity.id,
          payment_status: 'success',
        })

        // TODO (Sprint 3 - Entitlement): courseAccessService.createEntitlement(
        //   payment.student_id, payment.course_id, payment.id
        // )

        // TODO (Sprint 3 - Invoicing): invoiceService.generateInvoice(payment.id)

        // TODO (Sprint 3 - Notifications): Send payment success email to student

        console.log(`[webhook] payment.captured: payment ${payment.id} marked success`)
        break
      }

      case 'payment.failed': {
        if (!paymentEntity?.order_id) break

        const payment = await paymentRepository.findByRazorpayOrderId(paymentEntity.order_id)
        if (!payment) {
          console.warn(`[webhook] payment.failed: no payment record for order ${paymentEntity.order_id}`)
          break
        }

        await paymentRepository.update(payment.id, {
          payment_status: 'failed',
        })

        // TODO (Sprint 3 - Notifications): Send payment failure email to student

        console.log(`[webhook] payment.failed: payment ${payment.id} marked failed`)
        break
      }

      default:
        // Unsupported event types are silently acknowledged.
        // Razorpay requires 200 for all webhook events even if we do not process them.
        console.log(`[webhook] unhandled event type: ${event.event}`)
        break
    }
  },

  // -----------------------------------------------------------------------
  // Sprint 3 stubs — DO NOT implement here
  // -----------------------------------------------------------------------

  async createEntitlement(
    _studentId: string,
    _courseId: string,
    _paymentId: string,
  ): Promise<never> {
    /*
      TODO (Sprint 3 - Entitlement)
      - Verify payment record exists and status is 'success' in paymentRepository
      - Insert a new record into the course_access table:
          student_id, course_id, access_status = 'active', granted_at = now()
      - Requires courseAccessRepository (not yet created)
    */
    throw new Error('Not implemented')
  },

  async generateInvoice(_paymentId: string): Promise<never> {
    /*
      TODO (Sprint 3 - Invoicing)
      - Look up the payment record by paymentId in paymentRepository
      - Generate a sequential unique invoice number (e.g. INV-YYYYMM-XXXXXX)
      - Generate a PDF invoice (student name, course, amount, GST breakdown)
      - Upload the PDF to cloud storage and get a download URL
      - Insert an invoice record via invoiceRepository (not yet created)
      - Update the payment record with invoice_id
    */
    throw new Error('Not implemented')
  },

  // -----------------------------------------------------------------------
  // Read methods (fully functional)
  // -----------------------------------------------------------------------

  async findByStudentId(studentId: string) {
    return paymentRepository.findByStudentId(studentId)
  },

  async findById(id: string) {
    const payment = await paymentRepository.findById(id)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }
    return payment
  },
}
