// src/schemas/payments.ts

import { z } from 'zod'

// -----------------------------------------------------------------------
// Payment entity — matches the future `payments` table in the database
// -----------------------------------------------------------------------

export const paymentSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  razorpay_order_id: z.string().nullable(),
  razorpay_payment_id: z.string().nullable(),
  invoice_id: z.string().nullable(),
  payment_status: z.enum(['pending', 'success', 'failed']),
  amount_paid: z.number().nonnegative(),
  currency: z.string().default('INR'),
  gst_state: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newPaymentSchema = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  amount_paid: z.number().nonnegative(),
  currency: z.string().optional(),
  gst_state: z.string().optional(),
})

export const updatePaymentSchema = z.object({
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  invoice_id: z.string().optional(),
  payment_status: z.enum(['pending', 'success', 'failed']).optional(),
})

// -----------------------------------------------------------------------
// Order creation request — body accepted by POST /api/payments/order
// -----------------------------------------------------------------------

export const createOrderSchema = z.object({
  course_id: z.string().uuid('course_id must be a valid UUID'),
  student_id: z.string().uuid('student_id must be a valid UUID'),
  gst_state: z.string().optional(),
})

// -----------------------------------------------------------------------
// Payment verification request — body accepted by POST /api/payments/verify
// -----------------------------------------------------------------------

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'razorpay_order_id is required'),
  razorpay_payment_id: z.string().min(1, 'razorpay_payment_id is required'),
  razorpay_signature: z.string().min(1, 'razorpay_signature is required'),
})

// -----------------------------------------------------------------------
// Invoice entity — matches the future `invoices` table in the database
// -----------------------------------------------------------------------

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  payment_id: z.string().uuid(),
  invoice_number: z.string(),
  invoice_status: z.enum(['pending', 'generated']),
  invoice_download_url: z.string().nullable(),
  created_at: z.string(),
})

export const newInvoiceSchema = z.object({
  payment_id: z.string().uuid(),
  invoice_number: z.string().min(1, 'invoice_number is required'),
})

// -----------------------------------------------------------------------
// TypeScript type exports
// -----------------------------------------------------------------------

export type Payment = z.infer<typeof paymentSchema>
export type NewPayment = z.infer<typeof newPaymentSchema>
export type UpdatePayment = z.infer<typeof updatePaymentSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
export type Invoice = z.infer<typeof invoiceSchema>
export type NewInvoice = z.infer<typeof newInvoiceSchema>
