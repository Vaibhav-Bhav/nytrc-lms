// src/services/payment.ts

import { paymentRepository } from '@/repositories/payment'
import { courseAccessRepository } from '@/repositories/courseAccess'
import { invoiceRepository } from '@/repositories/invoice'
import { userRepository } from '@/repositories/user'
import { courseRepository } from '@/repositories/course'
import { leadRepository } from '@/repositories/lead'
import { emailDispatcher } from '@/services/email/dispatcher'
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
  getRazorpayConfig,
} from '@/lib/razorpay'
import { generateInvoicePdf } from '@/lib/pdf'
import { uploadR2File } from '@/lib/r2'
import { generateWordTemporaryPassword } from '@/lib/password'
import type { CreateOrderInput, VerifyPaymentInput } from '@/schemas/payments'
import type { CourseAccess } from '@/schemas/courseAccess'
import type { Invoice } from '@/schemas/invoices'

// -----------------------------------------------------------------------
// GST rates by state code (IGST 18% flat for digital services)
// -----------------------------------------------------------------------
const GST_RATE = 0.18

/**
 * Returns the final payable amount in paise including GST.
 * @param baseAmountInRupees Base course price in INR (rupees)
 * @param gstState           Indian state code (e.g. 'MH', 'DL')
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
   * Supports both authenticated students and guest checkout buyers.
   */
  async createOrder(data: CreateOrderInput) {
    // 1. Resolve student identity if student_id or email is provided
    let student = null
    if (data.student_id) {
      student = await userRepository.findById(data.student_id)
      if (!student) {
        throw new Error('STUDENT_NOT_FOUND')
      }
    } else if (data.email) {
      student = await userRepository.findByEmail(data.email)
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
    if (student) {
      const existingAccess = await courseAccessRepository.findActiveByStudentAndCourse(student.id, data.course_id)
      if (existingAccess) {
        throw new Error('COURSE_ALREADY_PURCHASED')
      }
    }

    // 4. Fetch the authoritative course price from database
    const BASE_AMOUNT_RUPEES = course.price ?? 999
    const amountInPaise = calculateAmountWithGST(BASE_AMOUNT_RUPEES, data.gst_state)

    // 5. Create or capture Lead for guest tracking
    const buyerEmail = data.email || student?.email || ''
    const buyerName = data.name || student?.name || 'Guest Student'
    let lead = null
    if (buyerEmail) {
      lead = await leadRepository.create({
        name: buyerName,
        email: buyerEmail,
        mobile: data.mobile,
        state: data.gst_state,
        course_id: data.course_id,
        status: 'initiated',
      })
    }

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
          student_id: student?.id ?? '',
          lead_id: lead?.id ?? '',
          email: buyerEmail,
          name: buyerName,
        },
      )
    } catch (err) {
      console.error('[paymentService] Razorpay order creation failed:', err)
      throw new Error('ORDER_CREATION_FAILED')
    }

    // Update lead with generated razorpay_order_id
    if (lead) {
      await leadRepository.update(lead.id, { razorpay_order_id: razorpayOrder.id })
    }

    // Persist a pending payment record linked to the Razorpay order
    const payment = await paymentRepository.create({
      student_id: student?.id ?? null,
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
   * Verifies the Razorpay payment signature and marks the payment as verified.
   */
  async verifyPayment(data: VerifyPaymentInput) {
    const payment = await paymentRepository.findByRazorpayOrderId(data.razorpay_order_id)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    const isValid = verifyRazorpaySignature(
      data.razorpay_order_id,
      data.razorpay_payment_id,
      data.razorpay_signature,
    )

    if (!isValid) {
      throw new Error('PAYMENT_SIGNATURE_INVALID')
    }

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
   * Statutory Invoice Generation.
   * Generates a unique invoice number, base amount + GST breakdown, and stores full statutory metadata.
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

    const invoiceNumber = await generateSequentialInvoiceNumber()

    // Statutory seller environment configuration (strict server-side validation)
    const sellerName = (process.env['SELLER_NAME'] || 'NYTRC Educational Services').trim()
    const sellerGstin = (process.env['SELLER_GSTIN'] || '27AAAAA0000A1Z5').trim()
    const sellerState = (process.env['SELLER_STATE'] || 'MAHARASHTRA').trim().toUpperCase()

    const sacCodeEnv = process.env['SAC_CODE']
    if (!sacCodeEnv || sacCodeEnv.trim() === '') {
      throw new Error(
        'Missing required environment variable: SAC_CODE. Please configure SAC_CODE in the production environment.'
      )
    }
    const sacCode = sacCodeEnv.trim()

    const totalAmount = payment.amount_paid
    const baseAmount = Number((totalAmount / (1 + GST_RATE)).toFixed(2))
    const gstAmount = Number((totalAmount - baseAmount).toFixed(2))

    const buyerState = (payment.gst_state || 'MAHARASHTRA').trim().toUpperCase()
    const placeOfSupply = buyerState
    const taxType = buyerState === sellerState ? 'cgst_sgst' : 'igst'

    const cgst = taxType === 'cgst_sgst' ? Number((gstAmount / 2).toFixed(2)) : 0
    const sgst = taxType === 'cgst_sgst' ? Number((gstAmount / 2).toFixed(2)) : 0
    const igst = taxType === 'igst' ? gstAmount : 0

    const invoice = await invoiceRepository.create({
      payment_id: paymentId,
      invoice_number: invoiceNumber,
      invoice_date: new Date().toISOString(),
      invoice_status: 'generated',
      seller_name: sellerName,
      seller_gstin: sellerGstin,
      buyer_state: buyerState,
      place_of_supply: placeOfSupply,
      sac_code: sacCode,
      tax_type: taxType,
      base_amount: baseAmount,
      gst_amount: gstAmount,
      gst_rate: GST_RATE,
      cgst,
      sgst,
      igst,
      total_amount: totalAmount,
    })

    await paymentRepository.update(paymentId, {
      invoice_id: invoice.id
    })

    console.log(`[invoice] Statutory GST invoice generated: ${invoiceNumber} | Base: ${baseAmount} | GST: ${gstAmount} | Total: ${totalAmount}`)
    return invoice
  },

  // -----------------------------------------------------------------------
  // Read methods
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

  /**
   * Webhook Handler for payment.captured.
   * Handles lead resolution, user account creation for guests (with temporary credentials),
   * course entitlement creation, statutory GST invoice metadata generation, R2 PDF upload, and
   * transactional email dispatches cleanly isolated from webhook core processing.
   */
  async handlePaymentCaptured(payload: any) {
    const paymentEntity = payload.payload?.payment?.entity
    if (!paymentEntity?.id || !paymentEntity?.order_id) {
      throw new Error('INVALID_WEBHOOK_PAYLOAD')
    }

    const orderId = paymentEntity.order_id
    const paymentId = paymentEntity.id
    const paymentMethod = paymentEntity.method ?? null

    // 1. Locate the payment by razorpay_order_id
    let payment = await paymentRepository.findByRazorpayOrderId(orderId)
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND')
    }

    if (payment.payment_status === 'failed') {
      throw new Error('INVALID_PAYMENT_STATUS')
    }

    // Transition payment to success if pending
    if (payment.payment_status !== 'success') {
      const updated = await paymentRepository.update(payment.id, {
        payment_status: 'success',
        razorpay_payment_id: paymentId,
        method: paymentMethod,
        raw_payload: payload,
      })
      if (!updated) {
        throw new Error('PAYMENT_NOT_FOUND')
      }
      payment = updated
    }

    // 2. Resolve Lead and update status to 'paid'
    const lead = await leadRepository.findByRazorpayOrderId(orderId)
    if (lead && lead.status !== 'paid') {
      await leadRepository.update(lead.id, { status: 'paid' })
      console.log(`[paymentService] Updated lead ${lead.id} status to paid`)
    }

    // 3. Resolve or create Student Account
    let studentId = payment.student_id
    const buyerEmail = (lead?.email || paymentEntity.notes?.email || paymentEntity.email || '').trim().toLowerCase()
    const buyerName = (lead?.name || paymentEntity.notes?.name || 'Student').trim()

    if (!studentId && buyerEmail) {
      const existingUser = await userRepository.findByEmail(buyerEmail)
      if (existingUser) {
        studentId = existingUser.id
        await paymentRepository.update(payment.id, { student_id: studentId })
        if (lead?.mobile || lead?.state) {
          await userRepository.update(existingUser.id, {
            mobile: existingUser.mobile || lead?.mobile || undefined,
            state: existingUser.state || lead?.state || undefined,
          })
        }
        console.log(`[paymentService] Associated guest payment with existing student account: ${buyerEmail}`)
      } else {
        // Create new student account with PRD-compliant word temporary password
        const tempPassword = generateWordTemporaryPassword()
        const expiry72h = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

        const newUser = await userRepository.create({
          email: buyerEmail,
          name: buyerName,
          mobile: lead?.mobile || undefined,
          state: lead?.state || undefined,
          role: 'student',
          password: tempPassword,
        })

        await userRepository.update(newUser.id, {
          force_password_change: true,
          reset_token_expires_at: expiry72h,
        })

        studentId = newUser.id
        await paymentRepository.update(payment.id, { student_id: studentId })

        // Dispatch Account Creation Email asynchronously with in-memory temporary credentials
        emailDispatcher.sendAccountCreatedEmail(newUser.id, {
          studentName: buyerName,
          email: buyerEmail,
          temporaryPassword: tempPassword,
        }).catch((emailErr) => {
          console.error('[paymentService] Failed to dispatch account creation email:', emailErr)
        })

        console.log(`[paymentService] Created new student account (${newUser.id}) for guest ${buyerEmail}. Temp password set with 72h expiry.`)
      }
    } else if (studentId) {
      // Update existing student's mobile/state from lead if present
      if (lead?.mobile || lead?.state) {
        const studentObj = await userRepository.findById(studentId)
        if (studentObj) {
          await userRepository.update(studentId, {
            mobile: studentObj.mobile || lead?.mobile || undefined,
            state: studentObj.state || lead?.state || undefined,
          })
        }
      }
    }

    if (!studentId) {
      throw new Error('STUDENT_RESOLUTION_FAILED')
    }

    // 4. Create Course Entitlement (Idempotent check)
    const activeAccess = await courseAccessRepository.findActiveByStudentAndCourse(
      studentId,
      payment.course_id,
    )

    if (activeAccess) {
      console.log(`[paymentService] Entitlement already active for student: ${studentId}, course: ${payment.course_id}. Bypassing creation.`)
    } else {
      await courseAccessRepository.create({
        student_id: studentId,
        course_id: payment.course_id,
        payment_id: payment.id,
        access_status: 'active',
      })
      console.log(`[paymentService] Course access entitlement created for student ${studentId} on course ${payment.course_id}`)
    }

    // 5. Statutory GST Invoice Metadata Generation
    let invoice: Invoice | null = null

    // Load statutory seller environment configuration (strict server-side validation)
    const sellerName = (process.env['SELLER_NAME'] || 'NYTRC Educational Services').trim()
    const sellerGstin = (process.env['SELLER_GSTIN'] || '27AAAAA0000A1Z5').trim()
    const sellerState = (process.env['SELLER_STATE'] || 'MAHARASHTRA').trim().toUpperCase()

    const sacCodeEnv = process.env['SAC_CODE']
    if (!sacCodeEnv || sacCodeEnv.trim() === '') {
      throw new Error(
        'Missing required environment variable: SAC_CODE. Please configure SAC_CODE in the production environment.'
      )
    }
    const sacCode = sacCodeEnv.trim()

    if (payment.invoice_id) {
      console.log(`[paymentService] Invoice already generated with ID: ${payment.invoice_id} for payment ${payment.id}. Loading existing invoice.`)
      invoice = await invoiceRepository.findById(payment.invoice_id)
    }

    const gstRate = 0.18
    const totalAmount = payment.amount_paid
    const baseAmount = Number((totalAmount / (1 + gstRate)).toFixed(2))
    const gstAmount = Number((totalAmount - baseAmount).toFixed(2))

    const buyerState = (payment.gst_state || lead?.state || 'MAHARASHTRA').trim().toUpperCase()
    const placeOfSupply = buyerState
    const taxType = buyerState === sellerState ? 'cgst_sgst' : 'igst'

    const cgst = taxType === 'cgst_sgst' ? Number((gstAmount / 2).toFixed(2)) : 0
    const sgst = taxType === 'cgst_sgst' ? Number((gstAmount / 2).toFixed(2)) : 0
    const igst = taxType === 'igst' ? gstAmount : 0

    if (!invoice) {
      const invoiceNumber = await generateSequentialInvoiceNumber()

      invoice = await invoiceRepository.create({
        payment_id: payment.id,
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString(),
        invoice_status: 'generated',
        seller_name: sellerName,
        seller_gstin: sellerGstin,
        buyer_state: buyerState,
        place_of_supply: placeOfSupply,
        sac_code: sacCode,
        tax_type: taxType,
        base_amount: baseAmount,
        gst_amount: gstAmount,
        gst_rate: gstRate,
        cgst,
        sgst,
        igst,
        total_amount: totalAmount,
      })

      await paymentRepository.update(payment.id, {
        invoice_id: invoice.id,
      })

      console.log(`[paymentService] Statutory invoice successfully created with ID: ${invoice.id} and linked to payment ${payment.id}`)
    }

    // 6. Generate Statutory PDF invoice using persisted invoice record as source of truth, upload to Cloudflare R2, and dispatch email
    if (invoice && !invoice.invoice_download_url) {
      try {
        const studentUser = await userRepository.findById(studentId)
        const courseObj = await courseRepository.findById(payment.course_id)

        if (!studentUser || !courseObj) {
          throw new Error(`Student user (found: ${!!studentUser}) or Course (found: ${!!courseObj}) not found. Downstream payment flow marked unsuccessful.`)
        }

        if (!invoice.invoice_date) {
          throw new Error(`Invoice record ${invoice.id} is missing mandatory invoice_date property.`)
        }

        const studentName = studentUser.name || buyerName || 'Student'
        const invoiceDateFormatted = new Date(invoice.invoice_date).toLocaleDateString('en-IN')

        console.log(`[paymentService] Generating Statutory GST PDF invoice from persisted record: ${invoice.invoice_number}`)
        const pdfBuffer = generateInvoicePdf({
          invoiceNumber: invoice.invoice_number,
          invoiceDate: invoiceDateFormatted,
          sellerName: invoice.seller_name || sellerName,
          sellerGstin: invoice.seller_gstin || sellerGstin,
          sellerState: sellerState,
          buyerName: studentName,
          buyerEmail: studentUser.email,
          buyerState: invoice.buyer_state || buyerState,
          placeOfSupply: invoice.place_of_supply || placeOfSupply,
          courseName: courseObj.title,
          sacCode: invoice.sac_code || sacCode,
          taxableValue: invoice.base_amount,
          gstRate: invoice.gst_rate,
          gstAmount: invoice.gst_amount,
          taxType: invoice.tax_type ?? taxType,
          cgst: invoice.cgst ?? 0,
          sgst: invoice.sgst ?? 0,
          igst: invoice.igst ?? 0,
          totalAmount: invoice.total_amount,
        })

        const r2Key = `invoices/${invoice.invoice_number}.pdf`
        console.log(`[paymentService] Uploading PDF invoice to R2: ${r2Key}`)
        const { publicUrl } = await uploadR2File(r2Key, pdfBuffer, 'application/pdf')
        console.log(`[paymentService] Invoice PDF uploaded successfully. URL: ${publicUrl}`)

        // Dispatch Payment Confirmation Email asynchronously with exact PDF buffer attachment (isolated from webhook core)
        emailDispatcher.sendPaymentConfirmationEmail(
          studentUser.id,
          {
            studentName,
            email: studentUser.email,
            courseTitle: courseObj.title,
            amountPaid: invoice.total_amount,
            invoiceNumber: invoice.invoice_number,
          },
          {
            filename: `Invoice_${invoice.invoice_number}.pdf`,
            content: pdfBuffer,
          },
        ).catch((emailErr) => {
          console.error('[paymentService] Failed to dispatch payment confirmation email:', emailErr)
        })

        await invoiceRepository.updateDownloadUrl(invoice.id, publicUrl)
        console.log(`[paymentService] Invoice record ${invoice.id} updated with download URL: ${publicUrl}`)

        invoice.invoice_download_url = publicUrl
      } catch (flowErr) {
        console.error('[paymentService] Failed to complete PDF or R2 upload flow (will retry on next webhook):', flowErr)
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
    if (payment) {
      await paymentRepository.update(payment.id, {
        payment_status: 'failed',
      })
    }

    const lead = await leadRepository.findByRazorpayOrderId(orderId)
    if (lead) {
      await leadRepository.update(lead.id, { status: 'failed' })
    }

    console.log(`[paymentService] Webhook marked payment & lead failed for order: ${orderId}`)
    return { success: true }
  },

  async handleRefundProcessed(payload: any) {
    const refundEntity = payload.payload?.refund?.entity
    const paymentEntity = payload.payload?.payment?.entity
    if (!refundEntity?.id || !paymentEntity?.id || !paymentEntity?.order_id) {
      throw new Error('INVALID_WEBHOOK_PAYLOAD')
    }

    const orderId = paymentEntity.order_id

    const payment = await paymentRepository.findByRazorpayOrderId(orderId)
    if (payment) {
      await paymentRepository.update(payment.id, { payment_status: 'refunded' })
    }

    console.log(`[paymentService] Webhook received refund.processed for refund: ${refundEntity.id} linked to payment order: ${orderId}`)
    return { success: true }
  },
}
