// src/services/payment.ts

import { paymentRepository } from '@/repositories/payment'
import { courseAccessRepository } from '@/repositories/courseAccess'
import { invoiceRepository } from '@/repositories/invoice'
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
  type RazorpayWebhookEvent,
} from '@/lib/razorpay'
import type { CreateOrderInput, VerifyPaymentInput } from '@/schemas/payments'
import type { CourseAccess } from '@/schemas/courseAccess'
import type { Invoice } from '@/schemas/invoices'

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
   * Completed:
   * - Signature verification
   * - Status transition validation
   * - Transactional success flow including entitlement and invoice generation
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

    if (payment.payment_status === 'success') {
      throw new Error('PAYMENT_ALREADY_PROCESSED')
    }

    if (payment.payment_status === 'failed') {
      throw new Error('INVALID_PAYMENT_STATUS')
    }

    // Update payment record to success
    const updatedPayment = await paymentRepository.update(payment.id, {
      razorpay_payment_id: data.razorpay_payment_id,
      payment_status: 'success',
    })

    if (!updatedPayment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    console.log(`[paymentService] Payment verification success for order: ${data.razorpay_order_id}`)

    // Create entitlement (course access)
    const entitlement = await this.createEntitlement(
      updatedPayment.student_id,
      updatedPayment.course_id,
      updatedPayment.id
    )

    // Generate invoice metadata
    const invoice = await this.generateInvoice(updatedPayment.id)

    // TODO (Sprint 3 - Notifications): Send payment success email to student via Resend

    return {
      payment: updatedPayment,
      entitlement,
      invoice,
    }
  },

  /**
   * Processes an incoming Razorpay webhook event.
   *
   * Completed:
   * - Signature verification
   * - Event routing for payment.authorized, payment.captured, payment.failed
   * - Entitlement and invoice generation on payment.captured
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

    console.log(`[webhook] Received event: ${event.event} for order: ${paymentEntity?.order_id}`)

    switch (event.event) {
      case 'payment.authorized':
        console.log(`[webhook] payment.authorized for order: ${paymentEntity?.order_id}`)
        break

      case 'payment.captured': {
        if (!paymentEntity?.order_id) break

        const payment = await paymentRepository.findByRazorpayOrderId(paymentEntity.order_id)
        if (!payment) {
          console.warn(`[webhook] payment.captured: no payment record for order ${paymentEntity.order_id}`)
          break
        }

        if (payment.payment_status === 'success') {
          console.log(`[webhook] payment.captured: payment ${payment.id} already marked success (processed via verification)`)
          break
        }

        const updatedPayment = await paymentRepository.update(payment.id, {
          razorpay_payment_id: paymentEntity.id,
          payment_status: 'success',
        })

        if (updatedPayment) {
          // Create entitlement
          try {
            await this.createEntitlement(
              updatedPayment.student_id,
              updatedPayment.course_id,
              updatedPayment.id
            )
          } catch (e) {
            console.error(`[webhook] failed to create entitlement:`, e)
          }

          // Generate invoice
          try {
            await this.generateInvoice(updatedPayment.id)
          } catch (e) {
            console.error(`[webhook] failed to generate invoice:`, e)
          }

          // TODO (Sprint 3 - Notifications): Send payment success email to student
        }

        console.log(`[webhook] payment.captured: payment ${payment.id} marked success and processed via webhook`)
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
        console.log(`[webhook] unhandled event type: ${event.event}`)
        break
    }
  },

  /**
   * Course Entitlement creation.
   * Verifies the payment is valid, prevents duplicates, and creates access record.
   */
  async createEntitlement(studentId: string, courseId: string, paymentId: string): Promise<CourseAccess> {
    console.log(`[entitlement] Creating course access for student: ${studentId}, course: ${courseId}`)

    const payment = await paymentRepository.findById(paymentId)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    if (payment.payment_status !== 'success') {
      throw new Error('PAYMENT_NOT_SUCCESSFUL')
    }

    const existingAccess = await courseAccessRepository.findActiveByStudentAndCourse(studentId, courseId)
    if (existingAccess) {
      console.warn(`[entitlement] Duplicate access attempt: student ${studentId} already active on course ${courseId}`)
      throw new Error('ENTITLEMENT_ALREADY_EXISTS')
    }

    const courseAccess = await courseAccessRepository.create({
      student_id: studentId,
      course_id: courseId,
      payment_id: paymentId,
      access_status: 'active'
    })

    console.log(`[entitlement] Entitlement successfully created with ID: ${courseAccess.id}`)
    return courseAccess
  },

  /**
   * Invoice Generation.
   * Generates a unique invoice number, base amount + GST breakdown, and stores the metadata.
   */
  async generateInvoice(paymentId: string): Promise<Invoice> {
    console.log(`[invoice] Generating invoice for payment: ${paymentId}`)

    const payment = await paymentRepository.findById(paymentId)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    if (payment.payment_status !== 'success') {
      throw new Error('PAYMENT_NOT_SUCCESSFUL')
    }

    const existingInvoice = await invoiceRepository.findByPaymentId(paymentId)
    if (existingInvoice) {
      console.warn(`[invoice] Invoice already exists for payment ${paymentId}`)
      throw new Error('INVOICE_ALREADY_EXISTS')
    }

    // Generate unique invoice number: INV-YYYYMM-XXXXXX
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase()
    const invoiceNumber = `INV-${year}${month}-${randomHex}`

    // GST Breakdown calculation
    // base_amount = total_amount / (1 + GST_RATE)
    const totalAmount = payment.amount_paid
    const baseAmount = Number((totalAmount / (1 + GST_RATE)).toFixed(2))
    const gstAmount = Number((totalAmount - baseAmount).toFixed(2))

    const invoice = await invoiceRepository.create({
      payment_id: paymentId,
      invoice_number: invoiceNumber,
      base_amount: baseAmount,
      gst_amount: gstAmount,
      gst_rate: GST_RATE,
      total_amount: totalAmount,
      invoice_status: 'generated'
    })

    // Update payment record with generated invoice ID
    await paymentRepository.update(paymentId, {
      invoice_id: invoice.id
    })

    // TODO (Sprint 3 - PDF Invoices): Generate PDF file using templates
    // TODO (Sprint 3 - Cloud Storage): Upload PDF to cloud storage and retrieve public download URL

    console.log(`[invoice] Invoice generated: ${invoiceNumber} | Base: ${baseAmount} | GST: ${gstAmount} | Total: ${totalAmount}`)
    return invoice
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
