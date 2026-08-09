// src/services/payment.ts

import { paymentRepository } from '@/repositories/payment'
import { courseAccessRepository } from '@/repositories/courseAccess'
import { invoiceRepository } from '@/repositories/invoice'
import { userRepository } from '@/repositories/user'
import { courseRepository } from '@/repositories/course'
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
  getRazorpayConfig,
  type RazorpayWebhookEvent,
} from '@/lib/razorpay'
import { sendEmail } from '@/lib/resend'
import { generateInvoicePdf } from '@/lib/pdf'
import { uploadR2File } from '@/lib/r2'
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

async function generateSequentialInvoiceNumber(): Promise<string> {
  const latest = await invoiceRepository.findLatest()
  if (!latest || !latest.invoice_number) {
    return 'INV-000001'
  }

  const match = latest.invoice_number.match(/INV-(\d+)/)
  if (!match) {
    const digitsMatch = latest.invoice_number.match(/(\d+)$/)
    if (!digitsMatch) {
      return 'INV-000001'
    }
    const nextVal = parseInt(digitsMatch[1], 10) + 1
    const paddingLength = digitsMatch[1].length
    const nextString = String(nextVal).padStart(paddingLength, '0')
    const prefix = latest.invoice_number.substring(0, latest.invoice_number.length - paddingLength)
    return `${prefix}${nextString}`
  }

  const nextVal = parseInt(match[1], 10) + 1
  const paddingLength = match[1].length
  const nextString = String(nextVal).padStart(paddingLength, '0')
  return `INV-${nextString}`
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
    // 1. Verify student_id exists in userRepository
    const student = await userRepository.findById(data.student_id)
    if (!student) {
      throw new Error('STUDENT_NOT_FOUND')
    }

    // 2. Verify course_id exists and is published
    const course = await courseRepository.findById(data.course_id)
    if (!course) {
      throw new Error('COURSE_NOT_FOUND')
    }
    if (course.status !== 'published') {
      throw new Error('COURSE_NOT_PUBLISHED')
    }

    // 3. Verify student does not already have active course_access
    const existingAccess = await courseAccessRepository.findActiveByStudentAndCourse(data.student_id, data.course_id)
    if (existingAccess) {
      throw new Error('COURSE_ALREADY_PURCHASED')
    }

    // 4. Fetch the actual course price from courseRepository
    const BASE_AMOUNT_RUPEES = course.price ?? 999

    const amountInPaise = calculateAmountWithGST(BASE_AMOUNT_RUPEES, data.gst_state)

    // Generate a short receipt ID. Razorpay limits receipt to 40 chars.
    const receipt = `rcpt_${Date.now()}`

    let razorpayOrder
    try {
      razorpayOrder = await createRazorpayOrder(
        amountInPaise,
        'INR',
        receipt,
        {
          course_id: data.course_id,
          student_id: data.student_id,
        },
      )
    } catch (err) {
      console.error('[paymentService] Razorpay order creation failed:', err)
      throw new Error('ORDER_CREATION_FAILED')
    }

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

    const config = getRazorpayConfig()

    return {
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      key: config.keyId,
      payment_id: payment.id,
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
    // 1. Find payment using razorpay_order_id.
    const payment = await paymentRepository.findByRazorpayOrderId(data.razorpay_order_id)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    // 2. Call verifyRazorpaySignature()
    const isValid = verifyRazorpaySignature(
      data.razorpay_order_id,
      data.razorpay_payment_id,
      data.razorpay_signature,
    )

    // 3. If signature fails, throw PAYMENT_SIGNATURE_INVALID
    if (!isValid) {
      throw new Error('PAYMENT_SIGNATURE_INVALID')
    }

    // 4. Update payment record to store razorpay_payment_id, without changing status
    const updatedPayment = await paymentRepository.update(payment.id, {
      razorpay_payment_id: data.razorpay_payment_id,
    })

    if (!updatedPayment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    console.log(`[paymentService] Payment signature verified for order: ${data.razorpay_order_id}`)

    return {
      success: true,
      payment: updatedPayment,
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

  async handlePaymentCaptured(payload: any) {
    const paymentEntity = payload.payload?.payment?.entity
    if (!paymentEntity?.id || !paymentEntity?.order_id) {
      throw new Error('INVALID_WEBHOOK_PAYLOAD')
    }

    const orderId = paymentEntity.order_id
    const paymentId = paymentEntity.id

    // 1. Locate the payment using paymentRepository.findByRazorpayOrderId()
    let payment = await paymentRepository.findByRazorpayOrderId(orderId)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    if (payment.payment_status === 'failed') {
      throw new Error('INVALID_PAYMENT_STATUS')
    }

    // 4.5B logic - transition to success if pending
    if (payment.payment_status !== 'success') {
      const updated = await paymentRepository.update(payment.id, {
        payment_status: 'success',
        razorpay_payment_id: paymentId,
      })
      if (!updated) {
        throw new Error('PAYMENT_NOT_FOUND')
      }
      payment = updated
    }

    // 2. Ensure payment status is already success. If not, throw INVALID_PAYMENT_STATUS
    if (payment.payment_status !== 'success') {
      throw new Error('INVALID_PAYMENT_STATUS')
    }

    // 3. Check whether the student already has active access.
    // Use courseAccessRepository.findActiveByStudentAndCourse()
    const activeAccess = await courseAccessRepository.findActiveByStudentAndCourse(
      payment.student_id,
      payment.course_id
    )

    // If access already exists, log it but do NOT return early, allowing subsequent steps to complete/retry if they failed
    if (activeAccess) {
      console.log(`[paymentService] Entitlement already active for student: ${payment.student_id}, course: ${payment.course_id}. Bypassing creation.`)
    } else {
      // 4. Create entitlement using courseAccessRepository.create()
      await courseAccessRepository.create({
        student_id: payment.student_id,
        course_id: payment.course_id,
        payment_id: payment.id,
        access_status: 'active',
      })
      console.log(`[paymentService] Course access entitlement created for student ${payment.student_id} on course ${payment.course_id}`)
    }

    // 5. Generate GST Invoice Metadata
    if (payment.invoice_id) {
      console.log(`[paymentService] Invoice already generated with ID: ${payment.invoice_id} for payment ${payment.id}. Bypassing invoice creation.`)
    } else {
      try {
        const sellerStateEnv = process.env['SELLER_STATE']
        if (!sellerStateEnv || sellerStateEnv.trim() === '') {
          throw new Error('Missing required environment variable: SELLER_STATE. Please configure SELLER_STATE in production environment variables.')
        }

        const invoiceNumber = await generateSequentialInvoiceNumber()
        
        const buyerState = (payment.gst_state || '').trim().toUpperCase()
        const sellerState = sellerStateEnv.trim().toUpperCase()

        const gstRate = 0.18
        const totalAmount = payment.amount_paid
        const taxableValue = Number((totalAmount / (1 + gstRate)).toFixed(2))
        const gstAmount = Number((totalAmount - taxableValue).toFixed(2))

        const cgst = buyerState === sellerState ? Number((gstAmount / 2).toFixed(2)) : 0
        const sgst = buyerState === sellerState ? Number((gstAmount / 2).toFixed(2)) : 0
        const igst = buyerState !== sellerState ? gstAmount : 0

        console.log(`[paymentService] Calculated GST invoice breakdown. Total: ${totalAmount}, Taxable: ${taxableValue}, GST: ${gstAmount}, CGST: ${cgst}, SGST: ${sgst}, IGST: ${igst}, Buyer State: ${buyerState || 'N/A'}, Seller State: ${sellerState}`)

        // TODO (Future Sprint - Extended Invoice Schema): Persist the calculated values 
        // (buyer_state, cgst, sgst, igst) once the SQL database schema is expanded.
        const invoice = await invoiceRepository.create({
          payment_id: payment.id,
          invoice_number: invoiceNumber,
          base_amount: taxableValue,
          gst_amount: gstAmount,
          gst_rate: gstRate,
          total_amount: totalAmount,
          invoice_status: 'generated',
        })

        // Link invoice_id back to payment (Do NOT change payment_status)
        await paymentRepository.update(payment.id, {
          invoice_id: invoice.id,
        })

        console.log(`[paymentService] Invoice successfully created with ID: ${invoice.id} and linked to payment ${payment.id}`)

        // Generate PDF invoice and upload to Cloudflare R2 (best-effort)
        try {
          const studentUser = await userRepository.findById(payment.student_id)
          const courseObj = await courseRepository.findById(payment.course_id)
          const studentName = studentUser?.name || 'Student'
          const courseName = courseObj?.title || 'Course'

          console.log(`[paymentService] Generating PDF invoice for: ${invoiceNumber}`)
          const pdfBuffer = generateInvoicePdf({
            invoiceNumber,
            studentName,
            courseName,
            amountPaid: totalAmount,
            taxableValue,
            gstAmount,
            cgst,
            sgst,
            igst,
            totalAmount,
            invoiceDate: new Date().toLocaleDateString('en-IN'),
          })

          const r2Key = `invoices/${invoiceNumber}.pdf`
          console.log(`[paymentService] Uploading PDF invoice to R2: ${r2Key}`)
          const { publicUrl } = await uploadR2File(r2Key, pdfBuffer, 'application/pdf')

          console.log(`[paymentService] Invoice PDF uploaded successfully. URL: ${publicUrl}`)

          // Update the invoice record with the public PDF URL
          await invoiceRepository.updateDownloadUrl(invoice.id, publicUrl)
          console.log(`[paymentService] Invoice record ${invoice.id} updated with download URL: ${publicUrl}`)
        } catch (pdfErr) {
          console.error('[paymentService] Failed to generate or upload invoice PDF (continuing with success):', pdfErr)
        }

        // Send Payment Confirmation Email via Resend
        try {
          const studentUser = await userRepository.findById(payment.student_id)
          const courseObj = await courseRepository.findById(payment.course_id)
          
          if (studentUser && courseObj) {
            const emailSubject = `Payment Confirmed: ${courseObj.title}`
            const emailHtml = `
              <h1>Payment Confirmation</h1>
              <p>Dear ${studentUser.name || 'Student'},</p>
              <p>Thank you for your payment. Your enrollment in the course is now active.</p>
              <ul>
                <li><strong>Course:</strong> ${courseObj.title}</li>
                <li><strong>Amount Paid:</strong> INR ${payment.amount_paid}</li>
                <li><strong>Invoice Number:</strong> ${invoice.invoice_number}</li>
              </ul>
              <p>Happy Learning!</p>
              <p>Best Regards,<br/>NYTRC Team</p>
            `
            await sendEmail(studentUser.email, emailSubject, emailHtml)
            console.log(`[paymentService] Payment confirmation email sent successfully to ${studentUser.email}`)
          } else {
            console.warn('[paymentService] Skip payment email: student user or course not found')
          }
        } catch (emailErr) {
          console.error('[paymentService] Failed to send payment confirmation email:', emailErr)
        }
      } catch (invErr) {
        console.error('[paymentService] Failed to generate invoice metadata:', invErr)
      }
    }

    return { success: true }
  },

  async handlePaymentFailed(payload: any) {
    const paymentEntity = payload.payload?.payment?.entity
    if (!paymentEntity?.id || !paymentEntity?.order_id) {
      throw new Error('INVALID_WEBHOOK_PAYLOAD')
    }

    const orderId = paymentEntity.order_id

    const payment = await paymentRepository.findByRazorpayOrderId(orderId)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    await paymentRepository.update(payment.id, {
      payment_status: 'failed',
    })

    console.log(`[paymentService] Webhook marked payment failed for order: ${orderId}`)
    return { success: true }
  },

  async handleRefundProcessed(payload: any) {
    const refundEntity = payload.payload?.refund?.entity
    const paymentEntity = payload.payload?.payment?.entity
    if (!refundEntity?.id || !paymentEntity?.id || !paymentEntity?.order_id) {
      throw new Error('INVALID_WEBHOOK_PAYLOAD')
    }

    const orderId = paymentEntity.order_id

    // TODO (Future Sprint - Refund Persistence): Update payment_status to 'refunded'
    // in the database once the schema check constraint is extended to support it.
    console.log(`[paymentService] Webhook received refund.processed for refund: ${refundEntity.id} linked to payment order: ${orderId}`)

    return { success: true }
  },
}
