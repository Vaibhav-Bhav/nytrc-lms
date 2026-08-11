// src/schemas/payments.ts

import { z } from 'zod'

// -----------------------------------------------------------------------
// Payment entity — matches the `payments` table in the database
// -----------------------------------------------------------------------

export const paymentSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid().nullable(),
  course_id: z.string().uuid(),
  razorpay_order_id: z.string().nullable(),
  razorpay_payment_id: z.string().nullable(),
  invoice_id: z.string().nullable(),
  payment_status: z.enum(['pending', 'success', 'failed', 'refunded']),
  amount_paid: z.number().nonnegative(),
  currency: z.string().default('INR'),
  gst_state: z.string().nullable(),
  method: z.string().nullable().optional(),
  raw_payload: z.any().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newPaymentSchema = z.object({
  student_id: z.string().uuid().nullable().optional(),
  course_id: z.string().uuid(),
  amount_paid: z.number().nonnegative(),
  currency: z.string().optional(),
  gst_state: z.string().optional(),
  method: z.string().optional(),
  raw_payload: z.any().optional(),
})

export const updatePaymentSchema = z.object({
  student_id: z.string().uuid().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  invoice_id: z.string().optional(),
  payment_status: z.enum(['pending', 'success', 'failed', 'refunded']).optional(),
  method: z.string().optional(),
  raw_payload: z.any().optional(),
})

// -----------------------------------------------------------------------
// Order creation request — accepts authenticated student_id or guest buyer details
// -----------------------------------------------------------------------

export const createOrderSchema = z.object({
  course_id: z.string().uuid('course_id must be a valid UUID'),
  student_id: z.string().uuid('student_id must be a valid UUID').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  mobile: z.string().optional(),
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
// Invoice entity — matches the `invoices` table in the database
// -----------------------------------------------------------------------

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  payment_id: z.string().uuid(),
  invoice_number: z.string(),
  invoice_date: z.string().nullable().optional(),
  invoice_status: z.enum(['pending', 'generated']),
  invoice_download_url: z.string().nullable(),
  seller_name: z.string().nullable().optional(),
  seller_gstin: z.string().nullable().optional(),
  buyer_state: z.string().nullable().optional(),
  place_of_supply: z.string().nullable().optional(),
  sac_code: z.string().nullable().optional(),
  tax_type: z.enum(['cgst_sgst', 'igst']).nullable().optional(),
  base_amount: z.number().nonnegative(),
  gst_amount: z.number().nonnegative(),
  gst_rate: z.number().nonnegative(),
  cgst: z.number().nonnegative().optional(),
  sgst: z.number().nonnegative().optional(),
  igst: z.number().nonnegative().optional(),
  total_amount: z.number().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newInvoiceSchema = z.object({
  payment_id: z.string().uuid(),
  invoice_number: z.string().min(1, 'invoice_number is required'),
  invoice_date: z.string().optional(),
  invoice_status: z.enum(['pending', 'generated']).default('generated'),
  seller_name: z.string().optional(),
  seller_gstin: z.string().optional(),
  buyer_state: z.string().optional(),
  place_of_supply: z.string().optional(),
  sac_code: z.string().optional(),
  tax_type: z.enum(['cgst_sgst', 'igst']).optional(),
  base_amount: z.number().nonnegative(),
  gst_amount: z.number().nonnegative(),
  gst_rate: z.number().nonnegative(),
  cgst: z.number().nonnegative().optional(),
  sgst: z.number().nonnegative().optional(),
  igst: z.number().nonnegative().optional(),
  total_amount: z.number().nonnegative(),
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
