// src/schemas/invoices.ts

import { z } from 'zod'

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  payment_id: z.string().uuid(),
  invoice_number: z.string(),
  invoice_status: z.enum(['pending', 'generated']),
  invoice_download_url: z.string().nullable(),
  base_amount: z.number().nonnegative(),
  gst_amount: z.number().nonnegative(),
  gst_rate: z.number().nonnegative(),
  total_amount: z.number().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const newInvoiceSchema = z.object({
  payment_id: z.string().uuid(),
  invoice_number: z.string().min(1),
  base_amount: z.number().nonnegative(),
  gst_amount: z.number().nonnegative(),
  gst_rate: z.number().nonnegative(),
  total_amount: z.number().nonnegative(),
  invoice_status: z.enum(['pending', 'generated']).default('generated'),
})

export type Invoice = z.infer<typeof invoiceSchema>
export type NewInvoice = z.infer<typeof newInvoiceSchema>
