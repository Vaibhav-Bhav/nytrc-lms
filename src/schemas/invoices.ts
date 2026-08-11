// src/schemas/invoices.ts

import { z } from 'zod'

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
  invoice_number: z.string().min(1),
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

export type Invoice = z.infer<typeof invoiceSchema>
export type NewInvoice = z.infer<typeof newInvoiceSchema>
